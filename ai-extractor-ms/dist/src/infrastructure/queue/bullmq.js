import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Redis } from 'ioredis';
import { env } from '../../config/env.js';
import { extractJobQueue } from '../../queues/bullmq.queue.js';
// Create a dedicated Redis connection for BullMQ default queue to ensure correct configuration at load time
const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});
// Example queue to initialize Bull Board
export const defaultQueue = new Queue('default', {
    connection
});
export const setupBullBoard = (app) => {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    createBullBoard({
        queues: [
            new BullMQAdapter(defaultQueue),
            new BullMQAdapter(extractJobQueue)
        ],
        serverAdapter: serverAdapter,
    });
    app.use('/admin/queues', serverAdapter.getRouter());
    console.log(`✅ Bull Board API: http://localhost:${env.PORT}/admin/queues`);
};
