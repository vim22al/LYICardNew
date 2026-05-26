import mongoose, { Schema } from 'mongoose';
const ContactSchema = new Schema({
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
export const Contact = mongoose.model('Contact', ContactSchema);
