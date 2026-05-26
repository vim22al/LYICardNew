import mongoose, { Schema } from 'mongoose';
const CampaignSchema = new Schema({
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
export const Campaign = mongoose.model('Campaign', CampaignSchema);
