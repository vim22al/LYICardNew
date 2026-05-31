import mongoose from 'mongoose';
import { env } from '../../config/env.js';
export const connectDB = async () => {
    try {
        const { MONGO_URI, MONGO_USER, MONGO_PASSWORD, MONGO_DATABASE } = env;
        // Construct URI if it doesn't already contain auth/db
        // mongodb://user:password@host:port/database?authSource=admin
        let connectionString = MONGO_URI;
        try {
            const urlObj = new URL(MONGO_URI);
            // If credentials are NOT in URI, append them
            if (!MONGO_URI.includes('@') && MONGO_USER && MONGO_PASSWORD) {
                connectionString = `${urlObj.protocol}//${MONGO_USER}:${MONGO_PASSWORD}@${urlObj.host}/${MONGO_DATABASE}?authSource=admin`;
            }
            else {
                // If URI is fully qualified but lacks target database path, append MONGO_DATABASE
                if ((urlObj.pathname === '/' || urlObj.pathname === '' || urlObj.pathname === '/default') && MONGO_DATABASE) {
                    urlObj.pathname = `/${MONGO_DATABASE}`;
                    connectionString = urlObj.toString();
                }
            }
        }
        catch (e) {
            console.warn('Could not parse MONGO_URI as a URL, using raw string:', e);
        }
        await mongoose.connect(connectionString);
        console.log('✅ MongoDB connected successfully');
        console.log("Mongo connected");
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
