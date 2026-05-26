import mongoose, { Schema } from 'mongoose';
const TransactionSchema = new Schema({
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
export const Transaction = mongoose.model('Transaction', TransactionSchema);
