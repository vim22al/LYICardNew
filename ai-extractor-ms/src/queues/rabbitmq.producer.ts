import { rabbitChannel } from '../infrastructure/queue/rabbitmq.js';
import { ExtractOutput } from '../utils/idempotency.js';

export async function publishExtractionResult(result: ExtractOutput): Promise<void> {
  if (!rabbitChannel) {
    console.warn('⚠️ RabbitMQ channel not initialized. Cannot publish extraction result.');
    return;
  }

  const queue = 'extracted-image-data';
  await rabbitChannel.assertQueue(queue, { durable: true });
  
  rabbitChannel.sendToQueue(queue, Buffer.from(JSON.stringify(result)), {
    persistent: true,
  });
}
