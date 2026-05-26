import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { protect } from '../middlewares/auth.js';

const router = Router();
const dashboardController = new DashboardController();

router.get('/', protect, dashboardController.getDashboardData);

export default router;
