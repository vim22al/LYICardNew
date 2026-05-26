import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment {
  _id?: any;
  filename: string;
  content: Buffer;
  contentType: string;
  size: number;
}

export interface ITemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'email' | 'whatsapp';
  isDefault: boolean;
  subject?: string;
  header?: string;
  body: string; // HTML content
  attachments: IAttachment[]; 
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['email', 'whatsapp'], default: 'email' },
  isDefault: { type: Boolean, default: false },
  subject: { type: String },
  header: { type: String },
  body: { type: String, required: true },
  attachments: [{
    filename: { type: String, required: true },
    content: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
