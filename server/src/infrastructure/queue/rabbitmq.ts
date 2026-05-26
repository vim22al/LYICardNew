import amqp, { ChannelModel, Channel } from 'amqplib';
import { env } from '../../config/env.js';
import { Contact } from '../../api/models/contact.model.js';

export let rabbitConnection: ChannelModel;
export let rabbitChannel: Channel;

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
    } catch (error) {
      if (i === retries - 1) {
        console.error('❌ RabbitMQ connection failed after maximum retries:', error);
        throw error;
      }
      console.warn(`⚠️  RabbitMQ connection failed (attempt ${i + 1}/${retries}). Retrying in ${delay / 1000}s...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

export const publishToExtractionQueue = async (data: any) => {
  if (!rabbitChannel) throw new Error('RabbitMQ channel not initialized');
  
  const queue = 'extract-image-queue';
  await rabbitChannel.assertQueue(queue, { durable: true });
  
  rabbitChannel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
};

export const startExtractionResultConsumer = async () => {
  if (!rabbitChannel) throw new Error('RabbitMQ channel not initialized');

  const queue = 'extracted-image-data';
  await rabbitChannel.assertQueue(queue, { durable: true });
  await rabbitChannel.prefetch(1);

  console.log(`📡 RabbitMQ Consumer started for result queue: ${queue}`);

  rabbitChannel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const result = JSON.parse(msg.content.toString());
      const { documentId, extracted_data, status, error } = result;

      console.log(`📥 Received extraction result for contact: ${documentId}`);

      if (status === 'success') {
        const data = extracted_data || {};
        await Contact.findByIdAndUpdate(documentId, {
          name: data.name || data.fullName || 'Unknown',
          title: data.title || data.jobTitle,
          company: data.company || data.organization,
          email: data.email,
          phone: data.phone || data.mobile,
          address: data.address,
          website: data.website || data.url,
          additionalDetails: data.additionalDetails || {},
          status: 'completed',
        });
      } else {
        await Contact.findByIdAndUpdate(documentId, {
          status: 'failed',
          error: error || 'Extraction failed',
        });
      }

      rabbitChannel.ack(msg);
    } catch (err) {
      console.error('❌ Error processing extraction result:', err);
      rabbitChannel.nack(msg, false, false);
    }
  });
};
