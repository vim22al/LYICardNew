import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'refunded';
  type: 'subscription' | 'one-time';
  plan: string;
  interval: 'month' | 'year';
  transactionId: string;
  provider: 'stripe' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: {
    type: String,
    enum: ['success', 'failed', 'refunded'],
    default: 'success'
  },
  type: {
    type: String,
    enum: ['subscription', 'one-time'],
    default: 'subscription'
  },
  plan: { type: String, required: true },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  transactionId: { type: String, unique: true, sparse: true },
  provider: {
    type: String,
    enum: ['stripe', 'manual'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Index for aggregation performance
TransactionSchema.index({ createdAt: 1 });
TransactionSchema.index({ status: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
