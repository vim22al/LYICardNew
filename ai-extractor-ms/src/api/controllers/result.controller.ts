import { Request, Response, NextFunction } from 'express';
import { ExtractionResult } from '../models/extraction-result.model.js';

export const getResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Support lookup by either jobId or documentId
    const result = await ExtractionResult.findOne({
      $or: [{ jobId: id }, { documentId: id }]
    });

    if (!result) {
      res.status(404).json({
        id,
        status: 'failed',
        error: 'Result not found for the given ID',
      });
      return;
    }

    res.json({
      jobId: result.jobId,
      documentId: result.documentId,
      status: result.status,
      extracted_data: result.extracted_data,
      error: result.error,
    });
  } catch (error) {
    next(error);
  }
};
