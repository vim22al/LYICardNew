import { redis } from '../infrastructure/redis/index.js';
import { env } from '../config/env.js';
export async function checkIdempotency(documentId) {
    const cached = await redis.get(`idempotency:${documentId}`);
    if (cached) {
        console.log(`🔁 Idempotent hit for document: ${documentId}`);
        return JSON.parse(cached);
    }
    return null;
}
export async function setIdempotency(documentId, result) {
    await redis.set(`idempotency:${documentId}`, JSON.stringify(result), 'EX', env.IDEMPOTENCY_TTL_SECONDS);
}
