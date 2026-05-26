import mongoose, { Schema } from 'mongoose';
const ExtractionResultSchema = new Schema({
    jobId: { type: String, required: true, unique: true, index: true },
    documentId: { type: String, required: true, index: true },
    status: { type: String, enum: ['queued', 'processing', 'success', 'failed'], default: 'queued' },
    extracted_data: { type: Schema.Types.Mixed, default: {} },
    error: { type: String },
    prompt: { type: String },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
});
export const ExtractionResult = mongoose.model('ExtractionResult', ExtractionResultSchema);
