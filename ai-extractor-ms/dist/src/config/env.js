import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(8000),
    // MongoDB
    MONGO_URI: z.string(),
    MONGO_USER: z.string(),
    MONGO_PASSWORD: z.string(),
    MONGO_DATABASE: z.string(),
    // Redis
    REDIS_URL: z.string().url(),
    // RabbitMQ
    RABBITMQ_HOST: z.string().default('localhost'),
    RABBITMQ_PORT: z.coerce.number().default(5672),
    RABBITMQ_DEFAULT_USER: z.string().default('user'),
    RABBITMQ_DEFAULT_PASS: z.string().default('password'),
    RABBITMQ_VHOST: z.string().default('/'),
    // Primary LLM
    PRIMARY_LLM_PROVIDER: z.enum(['openai', 'anthropic', 'google-genai', 'groq', 'mistralai', 'ollama']).default('ollama'),
    PRIMARY_LLM_MODEL: z.string().default('llama3.2-vision'),
    PRIMARY_LLM_API_KEY: z.string().default(''),
    PRIMARY_LLM_BASE_URL: z.string().default('http://localhost:11434'),
    // Secondary LLM (fallback)
    SECONDARY_LLM_PROVIDER: z.enum(['openai', 'anthropic', 'google-genai', 'groq', 'mistralai', 'ollama']).default('openai'),
    SECONDARY_LLM_MODEL: z.string().default('gpt-4o'),
    SECONDARY_LLM_API_KEY: z.string().default(''),
    SECONDARY_LLM_BASE_URL: z.string().default(''),
    // LLM Behavior
    LLM_TIMEOUT_MS: z.coerce.number().default(300000),
    LLM_MAX_RETRIES: z.coerce.number().default(3),
    // Extraction
    RATE_LIMIT_PER_MIN: z.coerce.number().default(10),
    MAX_FILE_SIZE_MB: z.coerce.number().default(10),
    IDEMPOTENCY_TTL_SECONDS: z.coerce.number().default(86400),
    EXTRACT_WORKER_CONCURRENCY: z.coerce.number().default(2),
    // App
    CLIENT_URL: z.string().url(),
    JWT_SECRET: z.string(),
    JWT_EXPIRY: z.string().default('90d'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
}
export const env = parsed.data;
