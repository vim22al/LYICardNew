import { Router } from 'express';
import multer from 'multer';
import { scanCard, getContacts, getContactById, updateContact, deleteContact, sendDefaultEmail } from '../controllers/contact.controller.js';
import { protect } from '../middlewares/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.post('/scan', upload.single('image'), scanCard);
router.get('/', getContacts);
router.get('/:id', getContactById);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);
router.post('/:id/send-default-email', sendDefaultEmail);

export default router;
