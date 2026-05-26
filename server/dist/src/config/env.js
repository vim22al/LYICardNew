import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform((val) => parseInt(val, 10)).default(8000),
    // MongoDB
    MONGO_URI: z.string(),
    MONGO_USER: z.string(),
    MONGO_PASSWORD: z.string(),
    MONGO_DATABASE: z.string(),
    // Redis
    REDIS_URL: z.string().url(),
    // RabbitMQ
    RABBITMQ_HOST: z.string().default('localhost'),
    RABBITMQ_PORT: z.string().transform((val) => parseInt(val, 10)).default(5672),
    RABBITMQ_DEFAULT_USER: z.string().default('user'),
    RABBITMQ_DEFAULT_PASS: z.string().default('password'),
    RABBITMQ_VHOST: z.string().default('/'),
    // App
    CLIENT_URL: z.string().url(),
    JWT_SECRET: z.string(),
    JWT_EXPIRY: z.string().default('90d'),
    // SMTP
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().default('587'),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
}
export const env = parsed.data;
