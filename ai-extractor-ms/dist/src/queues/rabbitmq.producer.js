import { rabbitChannel } from '../infrastructure/queue/rabbitmq.js';
export async function publishExtractionResult(result) {
    if (!rabbitChannel) {
        throw new Error('RabbitMQ channel not initialized');
    }
    const queue = 'extracted-image-data';
    await rabbitChannel.assertQueue(queue, { durable: true });
    rabbitChannel.sendToQueue(queue, Buffer.from(JSON.stringify(result)), {
        persistent: true,
    });
}
