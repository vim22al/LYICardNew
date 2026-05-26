import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { protect, admin } from '../middlewares/auth.js';
const router = Router();
// Profile and Password updates are for any logged-in user
router.put('/profile', protect, settingsController.updateProfile);
router.put('/password', protect, settingsController.updatePassword);
// Admin-only settings (SMTP, etc.)
router.get('/admin', protect, admin, settingsController.getAdminSettings);
router.put('/admin', protect, admin, settingsController.updateAdminSettings);
export default router;
