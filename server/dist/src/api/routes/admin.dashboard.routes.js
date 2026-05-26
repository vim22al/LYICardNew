import { Router } from 'express';
import { AdminDashboardController } from '../controllers/admin.dashboard.controller.js';
import { protect, admin } from '../middlewares/auth.js';
const router = Router();
const adminController = new AdminDashboardController();
// All routes are protected and require admin privileges
router.use(protect, admin);
router.get('/stats', adminController.getStats);
router.get('/charts', adminController.getGrowthData);
router.get('/health', adminController.getSystemHealth);
router.get('/activity', adminController.getActivityFeed);
router.get('/top-users', adminController.getTopUsers);
export default router;
