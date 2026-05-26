import { rabbitChannel } from '../infrastructure/queue/rabbitmq.js';
import { ExtractOutput } from '../utils/idempotency.js';

export async function publishExtractionResult(result: ExtractOutput): Promise<void> {
  if (!rabbitChannel) {
    throw new Error('RabbitMQ channel not initialized');
  }

  const queue = 'extracted-image-data';
  await rabbitChannel.assertQueue(queue, { durable: true });
  
  rabbitChannel.sendToQueue(queue, Buffer.from(JSON.stringify(result)), {
    persistent: true,
  });
}
