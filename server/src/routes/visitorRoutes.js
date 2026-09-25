import { Router } from 'express';
import {
  requestVisitorPass,
  updatePassApproval,
  scanOrVerifyPass,
  checkInVisitor,
  checkOutVisitor,
  getActiveVisitors,
  getAllVisitorPasses
} from '../controllers/visitorController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/request', authenticate, requestVisitorPass);
router.patch('/:id/approval', authenticate, updatePassApproval);
router.get('/verify', authenticate, scanOrVerifyPass);
router.post('/check-in', authenticate, checkInVisitor);
router.post('/check-out', authenticate, checkOutVisitor);
router.get('/active', authenticate, getActiveVisitors);
router.get('/all', authenticate, getAllVisitorPasses);

export default router;
