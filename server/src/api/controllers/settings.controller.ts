import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Config } from '../models/config.model.js';
import { resetTransporter } from '../../utils/mailer.js';
import { AuthRequest } from '../middlewares/auth.js';

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, jobTitle } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, jobTitle },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.authType !== 'email' || !user.password) {
      res.status(400).json({ error: 'Password change not supported for your account' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Incorrect current password' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAdminSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only return SMTP keys for now
    const smtpKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const configs = await Config.find({ key: { $in: smtpKeys } });
    
    // Map to an object for easier consumption
    const settings = configs.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateAdminSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = req.body; // Expecting { KEY: VALUE }

    for (const [key, value] of Object.entries(settings)) {
      if (typeof value !== 'string') continue;
      
      await Config.findOneAndUpdate(
        { key },
        { 
          key, 
          value, 
          isSecret: key.includes('PASS') || key.includes('SECRET') 
        },
        { upsert: true, new: true }
      );
    }

    // Reset mailer transporter to use new settings
    resetTransporter();

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};
