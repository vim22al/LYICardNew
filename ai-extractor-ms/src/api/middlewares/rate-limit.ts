import { rateLimit } from 'express-rate-limit';
import { env } from '../../config/env.js';

export const extractRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: env.RATE_LIMIT_PER_MIN,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'failed',
    error: 'Too many extraction requests, please try again later.',
  },
});
