import morgan from 'morgan';
import { env } from './env.js';

export const setupLogger = () => {
  const format = env.NODE_ENV === 'production' ? 'combined' : 'dev';
  return morgan(format);
};
