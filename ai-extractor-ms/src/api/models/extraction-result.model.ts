import mongoose, { Schema, Document } from 'mongoose';

export interface IExtractionResult extends Document {
  jobId: string;
  documentId: string;
  status: 'queued' | 'processing' | 'success' | 'failed';
  extracted_data: Record<string, any>;
  error?: string;
  prompt: string;
  createdAt: Date;
  completedAt?: Date;
}

const ExtractionResultSchema: Schema = new Schema({
  jobId: { type: String, required: true, unique: true, index: true },
  documentId: { type: String, required: true, index: true },
  status: { type: String, enum: ['queued', 'processing', 'success', 'failed'], default: 'queued' },
  extracted_data: { type: Schema.Types.Mixed, default: {} },
  error: { type: String },
  prompt: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

export const ExtractionResult = mongoose.model<IExtractionResult>('ExtractionResult', ExtractionResultSchema);
