import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { setupLogger } from './config/logger.js';
import { connectDB } from './infrastructure/db/index.js';
import { connectRedis } from './infrastructure/redis/index.js';
import { connectRabbitMQ, startExtractionResultConsumer } from './infrastructure/queue/rabbitmq.js';
import { setupBullBoard } from './infrastructure/queue/bullmq.js';

// Routes
import authRoutes from './api/routes/auth.routes.js';
import contactRoutes from './api/routes/contact.routes.js';
import templateRoutes from './api/routes/template.routes.js';
import campaignRoutes from './api/routes/campaign.routes.js';
import dashboardRoutes from './api/routes/dashboard.routes.js';
import adminDashboardRoutes from './api/routes/admin.dashboard.routes.js';
import adminAnalyticsRoutes from './api/routes/admin.analytics.routes.js';
import adminUserRoutes from './api/routes/admin.user.routes.js';
import adminPlanRoutes from './api/routes/admin.plan.routes.js';
import settingsRoutes from './api/routes/settings.routes.js';

const startServer = async () => {
  const app = express();

  // Middlewares
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
  app.use(setupLogger());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/contacts', contactRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/admin/dashboard', adminDashboardRoutes);
  app.use('/api/admin/analytics', adminAnalyticsRoutes);
  app.use('/api/admin/users', adminUserRoutes);
  app.use('/api/admin/plans', adminPlanRoutes);
  app.use('/api/settings', settingsRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  try {
    // Sequential connections
    await connectDB();
    await connectRedis();
    await connectRabbitMQ();
    
    // Start RabbitMQ Background Consumer for extraction results
    await startExtractionResultConsumer();
    
    // Start BullMQ Worker for campaigns and single emails
    const { startCampaignWorker } = await import('./workers/campaign.worker.js');
    const { startEmailWorker } = await import('./workers/email.worker.js');
    startCampaignWorker();
    startEmailWorker();
    
    // Setup Bull Board
    setupBullBoard(app);

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
