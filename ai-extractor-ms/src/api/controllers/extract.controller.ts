import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { extract } from '../../services/extract.service.js';
import { extractJobQueue } from '../../queues/bullmq.queue.js';
import { ExtractionResult } from '../models/extraction-result.model.js';

export const handleExtract = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, prompt } = req.body;
    let image = req.body.image;

    // Handle file upload if present
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      image = `data:${mimeType};base64,${base64}`;
    }

    const mode = req.query.mode || 'sync';

    if (mode === 'sync' || req.query['mode-sync'] !== undefined) {
      const result = await extract({ documentId, image, prompt });
      res.json(result);
    } else if (mode === 'async') {
      const jobId = uuidv4();

      // Initialize result in DB
      await ExtractionResult.findOneAndUpdate(
        { jobId },
        { 
            jobId,
            documentId,
            status: 'queued', 
            prompt,
            createdAt: new Date() 
        },
        { upsert: true, new: true }
      );

      // Add to BullMQ
      await extractJobQueue.add('extract', { documentId, jobId, image, prompt }, { jobId });

      res.status(202).json({
        jobId,
        documentId,
        status: 'queued',
      });
    } else {
      res.status(400).json({
        documentId,
        status: 'failed',
        error: 'Invalid mode. Use mode=sync or mode=async',
      });
    }
  } catch (error) {
    next(error);
  }
};
