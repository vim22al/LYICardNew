import mongoose, { Schema } from 'mongoose';
const PlanSchema = new Schema({
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
export const Plan = mongoose.model('Plan', PlanSchema);
