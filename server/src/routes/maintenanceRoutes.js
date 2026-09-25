import { Router } from 'express';
import {
  getPredictiveAlerts,
  updateAlertStatus,
  getMaintenanceAnalytics
} from '../controllers/maintenanceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/alerts', authenticate, getPredictiveAlerts);
router.patch('/alerts/:id', authenticate, updateAlertStatus);
router.get('/analytics', authenticate, getMaintenanceAnalytics);

export default router;
