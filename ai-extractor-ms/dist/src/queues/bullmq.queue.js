import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';
const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});
export const extractJobQueue = new Queue('extract-jobs', {
    connection,
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
