import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    maxContacts: number;
    maxCampaigns: number;
    maxTemplates: number;
  };
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  features: [{ type: String }],
  limits: {
    maxContacts: { type: Number, default: 100 },
    maxCampaigns: { type: Number, default: 5 },
    maxTemplates: { type: Number, default: 5 }
  },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);
