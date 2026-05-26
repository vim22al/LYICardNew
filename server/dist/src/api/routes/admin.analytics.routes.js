import { Router } from 'express';
import { AdminAnalyticsController } from '../controllers/admin.analytics.controller.js';
import { protect, admin } from '../middlewares/auth.js';
const router = Router();
const analyticsController = new AdminAnalyticsController();
// All routes are protected and require admin privileges
router.use(protect, admin);
router.get('/users', analyticsController.getUserAnalytics);
router.get('/revenue', analyticsController.getRevenueAnalytics);
export default router;
