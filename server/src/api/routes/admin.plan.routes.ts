import { Router } from 'express';
import { AdminPlanController } from '../controllers/admin.plan.controller.js';
import { protect, admin } from '../middlewares/auth.js';

const router = Router();
const planController = new AdminPlanController();

// All routes are protected and require admin privileges
router.use(protect, admin);

router.get('/', planController.listPlans);
router.post('/', planController.createPlan);
router.patch('/:planId', planController.updatePlan);
router.delete('/:planId', planController.deletePlan);

export default router;
