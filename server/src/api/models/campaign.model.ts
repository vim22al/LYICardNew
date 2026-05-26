import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  templateId?: mongoose.Types.ObjectId;
  contacts: mongoose.Types.ObjectId[];
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  scheduledAt?: Date;
  lastSentAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'Template' },
  contacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'running', 'completed', 'failed', 'cancelled'], 
    default: 'draft' 
  },
  scheduledAt: { type: Date },
  lastSentAt: { type: Date },
  isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true });

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
