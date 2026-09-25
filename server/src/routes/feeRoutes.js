import { Router } from 'express';
import {
  getStudentInvoices,
  getAllInvoices,
  payInvoice,
  getFeeAnalytics
} from '../controllers/feeController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/my-invoices', authenticate, getStudentInvoices);
router.get('/all', authenticate, authorizeRoles('ADMIN', 'WARDEN'), getAllInvoices);
router.post('/pay/:id', authenticate, payInvoice);
router.get('/analytics', authenticate, authorizeRoles('ADMIN', 'WARDEN'), getFeeAnalytics);

export default router;
