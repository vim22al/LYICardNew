import { rabbitChannel } from '../infrastructure/queue/rabbitmq.js';
import { extract, ExtractInput } from '../services/extract.service.js';
import { publishExtractionResult } from './rabbitmq.producer.js';

export async function startImageExtractionConsumer(): Promise<void> {
  if (!rabbitChannel) {
    console.warn('⚠️ RabbitMQ channel not initialized. Extraction consumer not started.');
    return;
  }

  const queue = 'extract-image-queue';
  await rabbitChannel.assertQueue(queue, { durable: true });
  await rabbitChannel.prefetch(1);

  console.log(`📡 RabbitMQ Consumer started for queue: ${queue}`);

  rabbitChannel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      
      // Support both 'id' (legacy) and 'documentId' from incoming messages
      const documentId = payload.documentId || payload.id;

      // Basic validation
      if (!documentId || !payload.image || !payload.prompt) {
        throw new Error('Invalid payload: Missing documentId, image, or prompt');
      }

      const input: ExtractInput = {
        documentId,
        image: payload.image,
        prompt: payload.prompt,
      };

      const result = await extract(input);
      
      await publishExtractionResult(result);
      
      rabbitChannel.ack(msg);
    } catch (error) {
      console.error('❌ Error in RabbitMQ Consumer:', error);
      
      // Publish error result if possible
      try {
        const rawContent = msg.content.toString();
        const payload = JSON.parse(rawContent);
        const documentId = payload.documentId || payload.id;
        if (documentId) {
            await publishExtractionResult({
                jobId: 'error',
                documentId,
                status: 'failed',
                error: error instanceof Error ? error.message : String(error),
                extracted_data: {}
            });
        }
      } catch (innerError) {
          // ignore
      }

      rabbitChannel.nack(msg, false, false);
    }
  });
}
