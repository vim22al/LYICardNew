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
// Then import your modules
// import { env } from './config/env.js';
console.log('Loaded REDIS_URL:', env.REDIS_URL ? 'YES ✅' : 'NO ❌');
// At the very top of your file
console.log('🚀 Server Starting...');
console.log('REDIS_URL env:', process.env.REDIS_URL ? 'SET ✅' : 'NOT SET ❌');
console.log('NODE_ENV:', process.env.NODE_ENV);
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
    // DB Debug Endpoint
    app.get('/api/debug/db', async (req, res) => {
        try {
            const mongoose = await import('mongoose');
            const dbState = mongoose.default.connection.readyState;
            const dbStates = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting'
            };
            // Test write
            let writeResult = null;
            let writeError = null;
            try {
                const testSchema = new mongoose.default.Schema({
                    test: Boolean,
                    createdAt: Date
                }, { collection: 'debug_tests' });
                const TestModel = mongoose.default.models.DebugTest || mongoose.default.model('DebugTest', testSchema);
                writeResult = await TestModel.create({
                    test: true,
                    createdAt: new Date()
                });
            }
            catch (err) {
                writeError = {
                    message: err.message,
                    stack: err.stack
                };
            }
            // Check user collection
            let collections = [];
            try {
                if (mongoose.default.connection.db) {
                    const list = await mongoose.default.connection.db.listCollections().toArray();
                    collections = list.map(c => c.name);
                }
            }
            catch (e) {
                collections = ['error: ' + e.message];
            }
            res.json({
                env: {
                    MONGO_URI: env.MONGO_URI ? 'configured' : 'missing',
                    MONGO_URI_VALUE: env.MONGO_URI,
                    MONGODB_URI: process.env.MONGODB_URI || 'not set',
                    DATABASE_URL: process.env.DATABASE_URL || 'not set',
                    MONGO_USER: env.MONGO_USER,
                    MONGO_DATABASE: env.MONGO_DATABASE,
                    NODE_ENV: process.env.NODE_ENV,
                },
                connection: {
                    readyState: dbState,
                    status: dbStates[dbState] || 'unknown',
                    dbName: mongoose.default.connection.name,
                    host: mongoose.default.connection.host,
                    port: mongoose.default.connection.port,
                },
                writeTest: {
                    success: !writeError,
                    result: writeResult,
                    error: writeError
                },
                collections
            });
        }
        catch (err) {
            res.status(500).json({
                error: err.message,
                stack: err.stack
            });
        }
    });
    try {
        // Sequential connections
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
            // Start RabbitMQ Background Consumer for extraction results
            await startExtractionResultConsumer();
        }
        catch (err) {
            console.warn('⚠️  RabbitMQ unavailable:', err.message);
            console.warn('ℹ️  Server will continue without message queue');
        }
        // Start BullMQ Worker for campaigns and single emails
        const { startCampaignWorker } = await import('./workers/campaign.worker.js');
        const { startEmailWorker } = await import('./workers/email.worker.js');
        startCampaignWorker();
        startEmailWorker();
        // Setup Bull Board
        setupBullBoard(app);
        // Error handling middleware to guarantee JSON responses
        app.use((err, req, res, next) => {
            console.error('Unhandled error middleware:', err);
            res.status(err.status || 500).json({
                error: err.message || 'Internal Server Error',
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        });
        const port = env.PORT;
        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
