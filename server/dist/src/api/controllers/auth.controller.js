import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/user.model.js';
import { generateToken } from '../../utils/jwt.js';
import { env } from '../../config/env.js';
import { redis } from '../../infrastructure/redis/index.js';
import { singleEmailQueue } from '../../infrastructure/queue/bullmq.js';
const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID);
export const register = async (req, res, next) => {
    console.log('Register request body:', req.body);
    try {
        const { email, password, name } = req.body;
        const validationErrors = [];
        if (!email)
            validationErrors.push('Email is required');
        if (!password)
            validationErrors.push('Password is required');
        if (!name)
            validationErrors.push('Name is required');
        if (validationErrors.length > 0) {
            res.status(400).json({
                error: 'Validation failed',
                validationErrors,
                requestBody: req.body
            });
            return;
        }
        let existingUser;
        try {
            existingUser = await User.findOne({ email });
        }
        catch (dbErr) {
            console.error('Database find user error:', dbErr);
            res.status(500).json({
                error: 'Database query failed',
                exception: dbErr.message,
                stack: dbErr.stack,
                requestBody: req.body
            });
            return;
        }
        if (existingUser) {
            res.status(400).json({ error: 'User already exists', requestBody: req.body });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let user;
        try {
            user = await User.create({
                email,
                password: hashedPassword,
                name,
                authType: 'email',
            });
        }
        catch (insertErr) {
            console.error('Database insert user error:', insertErr);
            res.status(500).json({
                error: 'Database insertion failed',
                exception: insertErr.message,
                stack: insertErr.stack,
                requestBody: req.body
            });
            return;
        }
        const token = generateToken(user._id.toString());
        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                userType: user.userType,
                authType: user.authType,
                jobTitle: user.jobTitle,
            },
            requestBody: req.body,
            insertResult: 'success'
        });
    }
    catch (error) {
        console.error('Unhandled register error:', error);
        res.status(500).json({
            error: 'Unhandled register error',
            exception: error.message,
            stack: error.stack,
            requestBody: req.body
        });
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = generateToken(user._id.toString());
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                userType: user.userType,
                authType: user.authType,
                jobTitle: user.jobTitle,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const googleLogin = async (req, res, next) => {
    try {
        const { idToken, accessToken } = req.body;
        let googleId, email, name, avatar;
        if (idToken) {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                res.status(400).json({ error: 'Invalid ID token payload' });
                return;
            }
            googleId = payload.sub;
            email = payload.email;
            name = payload.name;
            avatar = payload.picture;
        }
        else if (accessToken) {
            // Verify access token by calling Google userinfo API
            const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
            const data = await response.json();
            if (!response.ok) {
                res.status(400).json({ error: 'Invalid access token' });
                return;
            }
            googleId = data.sub;
            email = data.email;
            name = data.name;
            avatar = data.picture;
        }
        else {
            res.status(400).json({ error: 'idToken or accessToken is required' });
            return;
        }
        if (!email) {
            res.status(400).json({ error: 'Email not provided by Google' });
            return;
        }
        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });
        if (!user) {
            user = await User.create({
                googleId,
                email,
                name: name || email.split('@')[0],
                avatar,
                authType: 'google',
            });
        }
        else {
            let updated = false;
            if (!user.googleId) {
                user.googleId = googleId;
                updated = true;
            }
            if (avatar && !user.avatar) {
                user.avatar = avatar;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
        }
        const token = generateToken(user._id.toString());
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                userType: user.userType,
                authType: user.authType,
                jobTitle: user.jobTitle,
            },
        });
    }
    catch (error) {
        res.status(401).json({ error: 'Google authentication failed', message: error.message });
    }
};
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if user exists. Just return 200.
            res.status(200).json({ message: 'If an account exists with this email, a reset link will be sent.' });
            return;
        }
        const token = crypto.randomBytes(32).toString('hex');
        const resetKey = `reset-token:${token}`;
        // Store in Redis with 10 mins expiry
        await redis.set(resetKey, user._id.toString(), 'EX', 600);
        const resetUrl = `${env.CLIENT_URL}/auth/reset-password?token=${token}`;
        // Enqueue email job
        await singleEmailQueue.add('password-reset', {
            to: user.email,
            subject: 'Reset your LYICard Password',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4fb8b2;">Password Reset Request</h2>
          <p>Hi ${user.name || 'there'},</p>
          <p>We received a request to reset your password for your LYICard account. Click the button below to choose a new password. This link is valid for 10 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4fb8b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #777;">If the button above doesn't work, copy and paste this link into your browser: <br/> ${resetUrl}</p>
        </div>
      `,
        });
        res.json({ message: 'If an account exists with this email, a reset link will be sent.' });
    }
    catch (error) {
        next(error);
    }
};
export const resetPassword = async (req, res, next) => {
    try {
        const { token, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            res.status(400).json({ error: 'Passwords do not match' });
            return;
        }
        const resetKey = `reset-token:${token}`;
        const userId = await redis.get(resetKey);
        if (!userId) {
            res.status(400).json({ error: 'Invalid or expired reset token' });
            return;
        }
        const user = await User.findById(userId);
        if (!user) {
            res.status(400).json({ error: 'User not found' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        // Cleanup token
        await redis.del(resetKey);
        res.json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        next(error);
    }
};
