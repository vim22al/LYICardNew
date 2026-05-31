import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    name: { type: String, required: true },
    jobTitle: { type: String },
    googleId: { type: String, unique: true, sparse: true, index: true },
    avatar: { type: String },
    authType: {
        type: String,
        enum: ['email', 'google'],
        default: 'email'
    },
    userType: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    subscriptionType: {
        type: String,
        enum: ['free', 'pro', 'max'],
        default: 'free'
    },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
    plan: { type: String },
    lastActive: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});
export const User = mongoose.model('User', UserSchema);
