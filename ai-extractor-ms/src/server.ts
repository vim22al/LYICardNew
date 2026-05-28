import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { setupLogger } from './config/logger.js';
import { connectDB } from './infrastructure/db/index.js';
import { connectRedis } from './infrastructure/redis/index.js';
import { connectRabbitMQ } from './infrastructure/queue/rabbitmq.js';
import { setupBullBoard } from './infrastructure/queue/bullmq.js';
import extractRoutes from './api/routes/extract.routes.js';
import { errorHandler } from './api/middlewares/error-handler.js';
import { startImageExtractionConsumer } from './queues/rabbitmq.consumer.js';
import { startExtractWorker } from './workers/extract.worker.js';

const startServer = async () => {
  const app = express();

  // Middlewares
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(setupLogger());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Routes
  app.use('/api', extractRoutes);

  try {
    // Sequential connections to ensure deterministic logging order
    await connectDB();
    await connectRedis();

    // Connection diagnostics
    console.log('📋 Service Connection Status:');
    console.log('  ✅ MongoDB:', env.MONGO_URI ? 'configured' : '❌ missing');
    console.log('  ✅ Redis:', env.REDIS_URL ? 'connected' : '❌ missing');
    console.log('  🔄 RabbitMQ:', env.RABBITMQ_HOST || '❌ missing');
    
    try {
      await connectRabbitMQ();
      console.log('✅ RabbitMQ connected');
      // Initialization
      await startImageExtractionConsumer();
    } catch (err: any) {
      console.warn('⚠️  RabbitMQ unavailable:', err.message);
      console.warn('ℹ️  Server will continue without message queue');
    }

    // Setup Bull Board (needs Redis connection)
    setupBullBoard(app);

    startExtractWorker();

    // Error handler (must be last)
    app.use(errorHandler);

    const port = env.PORT;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
