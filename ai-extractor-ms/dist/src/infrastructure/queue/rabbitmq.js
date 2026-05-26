import * as amqp from 'amqplib';
import { env } from '../../config/env.js';
export let rabbitConnection;
export let rabbitChannel;
export const connectRabbitMQ = async (retries = 5, delay = 5000) => {
    const { RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_DEFAULT_USER, RABBITMQ_DEFAULT_PASS, RABBITMQ_VHOST } = env;
    const vhost = RABBITMQ_VHOST === '/' ? '%2f' : RABBITMQ_VHOST;
    const url = `amqp://${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}/${vhost}`;
    for (let i = 0; i < retries; i++) {
        try {
            rabbitConnection = await amqp.connect(url);
            rabbitChannel = await rabbitConnection.createChannel();
            console.log('✅ RabbitMQ connected successfully');
            rabbitConnection.on('error', (err) => {
                console.error('❌ RabbitMQ connection error:', err);
            });
            return { connection: rabbitConnection, channel: rabbitChannel };
        }
        catch (error) {
            if (i === retries - 1) {
                console.error('❌ RabbitMQ connection failed after maximum retries:', error);
                throw error;
            }
            console.warn(`⚠️  RabbitMQ connection failed (attempt ${i + 1}/${retries}). Retrying in ${delay / 1000}s...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};
