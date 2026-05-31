import mongoose from 'mongoose';
import { env } from '../../config/env.js';

export const connectDB = async () => {
  try {
    const { MONGO_URI, MONGO_USER, MONGO_PASSWORD, MONGO_DATABASE } = env;
    
    // Construct URI if it doesn't already contain auth/db
    // mongodb://user:password@host:port/database?authSource=admin
    let connectionString = MONGO_URI;
    
    // Simple check to append credentials if they are present and not in URI
    if (!MONGO_URI.includes('@') && MONGO_USER && MONGO_PASSWORD) {
        const urlObj = new URL(MONGO_URI);
        connectionString = `${urlObj.protocol}//${MONGO_USER}:${MONGO_PASSWORD}@${urlObj.host}/${MONGO_DATABASE}?authSource=admin`;
    }

    await mongoose.connect(connectionString);
    console.log('✅ MongoDB connected successfully');
    console.log("Mongo connected");
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
