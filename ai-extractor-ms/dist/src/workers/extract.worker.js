import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { extract } from '../services/extract.service.js';
import { ExtractionResult } from '../api/models/extraction-result.model.js';
import { env } from '../config/env.js';
export function startExtractWorker() {
    const connection = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
        tls: { rejectUnauthorized: false }
    });
    const worker = new Worker('extract-jobs', async (job) => {
        const { documentId, jobId } = job.data;
        await ExtractionResult.findOneAndUpdate({ jobId }, { status: 'processing' });
        const result = await extract(job.data);
        await ExtractionResult.findOneAndUpdate({ jobId }, {
            status: result.status,
            extracted_data: result.extracted_data,
            error: result.error,
            completedAt: new Date(),
        }, { upsert: true });
        return result;
    }, {
        connection,
        concurrency: env.EXTRACT_WORKER_CONCURRENCY,
    });
    worker.on('completed', (job) => {
        console.log(`✅ BullMQ Job completed: ${job.id}`);
    });
    worker.on('failed', (job, err) => {
        console.error(`❌ BullMQ Job failed: ${job?.id}`, err);
    });
    return worker;
}
