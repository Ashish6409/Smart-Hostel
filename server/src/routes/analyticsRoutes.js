import { Router } from 'express';
import { getExecutiveAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/executive', authenticate, getExecutiveAnalytics);

export default router;
