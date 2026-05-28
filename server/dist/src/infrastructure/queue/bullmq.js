import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Redis } from 'ioredis';
import { env } from '../../config/env.js';
// Create a dedicated Redis connection for BullMQ queues to ensure correct configuration at load time
const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});
// Queues to initialize
export const defaultQueue = new Queue('default', {
    connection
});
export const campaignQueue = new Queue('campaign', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
    }
});
export const singleEmailQueue = new Queue('single-email', {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: true,
    }
});
export const setupBullBoard = (app) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    createBullBoard({
        queues: [
            new BullMQAdapter(defaultQueue),
            new BullMQAdapter(campaignQueue),
            new BullMQAdapter(singleEmailQueue)
        ],
        serverAdapter: serverAdapter,
    });
    app.use('/admin/queues', serverAdapter.getRouter());
    console.log(`✅ Bull Board API: http://localhost:${env.PORT}/admin/queues`);
};
