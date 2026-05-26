import { Queue } from 'bullmq';
import { redis } from '../infrastructure/redis/index.js';
export const extractJobQueue = new Queue('extract-jobs', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 200 },
    },
});
