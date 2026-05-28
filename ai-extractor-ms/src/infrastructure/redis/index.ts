import { Redis } from 'ioredis';
import { env } from '../../config/env.js';

export let redis: Redis;

export const connectRedis = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      tls: { rejectUnauthorized: false }
    });

    redis.on('connect', () => {
      // connecting...
    });

    redis.on('ready', () => {
      console.log('✅ Redis connected successfully');
      resolve();
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
      reject(err);
    });
  });
};
