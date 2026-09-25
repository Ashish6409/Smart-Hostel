import { Router } from 'express';
import {
  getMessDemandPrediction,
  getMealHistory,
  submitStudentLeave,
  getStudentLeaves
} from '../controllers/messController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/predict', getMessDemandPrediction);
router.get('/history', getMealHistory);
router.post('/leave', authenticate, submitStudentLeave);
router.get('/leaves', authenticate, getStudentLeaves);

export default router;
