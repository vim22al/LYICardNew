import mongoose, { Schema, Document } from 'mongoose';

export interface IConfig extends Document {
  key: string;
  value: string;
  isSecret: boolean;
  description?: string;
  updatedAt: Date;
}

const ConfigSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: String, required: true },
  isSecret: { type: Boolean, default: false },
  description: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp on save
ConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Config = mongoose.model<IConfig>('Config', ConfigSchema);
