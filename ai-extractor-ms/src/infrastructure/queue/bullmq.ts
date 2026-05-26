import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { redis } from '../redis/index.js';
import { env } from '../../config/env.js';
import { Express } from 'express';
import { extractJobQueue } from '../../queues/bullmq.queue.js';

// Example queue to initialize Bull Board
export const defaultQueue = new Queue('default', {
  connection: redis
});

export const setupBullBoard = (app: Express) => {
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
