import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { redis } from '../redis/index.js';
import { env } from '../../config/env.js';
import { Express } from 'express';

// Queues to initialize
export const defaultQueue = new Queue('default', {
  connection: redis
});

export const campaignQueue = new Queue('campaign', {
  connection: redis,
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
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  }
});

export const setupBullBoard = (app: Express) => {
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
