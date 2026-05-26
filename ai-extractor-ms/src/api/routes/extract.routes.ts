import { Router } from 'express';
import multer from 'multer';
import { handleExtract } from '../controllers/extract.controller.js';
import { getResult } from '../controllers/result.controller.js';
import { validateExtractInput } from '../middlewares/validate.js';
import { extractRateLimiter } from '../middlewares/rate-limit.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/extract', upload.single('image'), extractRateLimiter, validateExtractInput, handleExtract);
router.get('/extract/:id/result', getResult);

export default router;
