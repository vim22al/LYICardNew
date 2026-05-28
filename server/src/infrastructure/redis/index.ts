// import { Redis } from 'ioredis';
// import { env } from '../../config/env.js';

// export let redis: Redis;

// export const connectRedis = async (): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     redis = new Redis(env.REDIS_URL, {
//       maxRetriesPerRequest: null,
//       enableReadyCheck: true,
//       tls: {
//         rejectUnauthorized: false
//       }
//     });

//     redis.on('connect', () => {
//       // connecting...
//     });

//     redis.on('ready', () => {
//       console.log('✅ Redis connected successfully');
//       resolve();
//     });

//     redis.on('error', (err) => {
//       console.error('❌ Redis connection error:', err);
//       reject(err);
//     });
//     console.log('REDIS_URL FROM ENV:', env.REDIS_URL);
//   });
// };

import { Redis } from 'ioredis';
import { env } from '../../config/env.js';

export let redis: Redis;

export const connectRedis = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('📋 Environment Variables Check:');
    console.log('REDIS_URL:', env.REDIS_URL);
    console.log('REDIS_HOST:', process.env.REDIS_HOST);
    console.log('REDIS_PORT:', process.env.REDIS_PORT);

    if (!env.REDIS_URL) {
      console.error('❌ REDIS_URL is NOT defined!');
      reject(new Error('REDIS_URL environment variable is missing'));
      return;
    }

    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      tls: {
        rejectUnauthorized: false
      }
    });

    redis.on('connect', () => {
      console.log('🔌 Connecting to Redis...');
    });

    redis.on('ready', () => {
      console.log('✅ Redis connected successfully');
      console.log('Connected to:', env.REDIS_URL.substring(0, 50) + '...');
      resolve();
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      reject(err);
    });

  });
};
