import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  avatar?: string;
  authType: 'email' | 'google';
  userType: 'admin' | 'user';
  subscriptionStatus: 'active' | 'inactive';
  subscriptionType: 'free' | 'pro';
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  plan?: string;
  jobTitle?: string;
  lastActive: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
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
    enum: ['free', 'pro'],
    default: 'free'
  },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
  plan: { type: String },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', UserSchema);
