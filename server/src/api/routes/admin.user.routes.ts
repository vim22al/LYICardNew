import { Router } from 'express';
import { AdminUserController } from '../controllers/admin.user.controller.js';
import { protect, admin } from '../middlewares/auth.js';

const router = Router();
const userController = new AdminUserController();

// All routes are protected and require admin privileges
router.use(protect, admin);

router.get('/', userController.listUsers);
router.get('/:userId', userController.getUser);
router.patch('/:userId', userController.updateUser);

export default router;
