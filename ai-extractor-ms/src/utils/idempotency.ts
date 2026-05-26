import { redis } from '../infrastructure/redis/index.js';
import { env } from '../config/env.js';

export interface ExtractOutput {
  jobId: string;
  documentId: string;
  extracted_data: Record<string, any>;
  status: 'success' | 'failed';
  error?: string;
}

export async function checkIdempotency(documentId: string): Promise<ExtractOutput | null> {
  const cached = await redis.get(`idempotency:${documentId}`);
  if (cached) {
    console.log(`🔁 Idempotent hit for document: ${documentId}`);
    return JSON.parse(cached);
  }
  return null;
}

export async function setIdempotency(documentId: string, result: ExtractOutput): Promise<void> {
  await redis.set(
    `idempotency:${documentId}`,
    JSON.stringify(result),
    'EX',
    env.IDEMPOTENCY_TTL_SECONDS
  );
}
