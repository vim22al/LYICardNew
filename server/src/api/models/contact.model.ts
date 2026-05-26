import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  rawImage?: string; // Base64 or URL
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  additionalDetails?: Map<string, string>;
  isDeleted: boolean;
  createdAt: Date;
}

const ContactSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  title: { type: String },
  company: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  rawImage: { type: String },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  error: { type: String },
  additionalDetails: { type: Map, of: String, default: {} },
  isDeleted: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const Contact = mongoose.model<IContact>('Contact', ContactSchema);
