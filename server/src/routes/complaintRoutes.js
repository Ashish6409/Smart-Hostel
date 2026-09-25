import { Router } from 'express';
import {
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
  previewAIExtraction
} from '../controllers/complaintController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAllComplaints);
router.post('/', authenticate, createComplaint);
router.post('/preview-ai', authenticate, previewAIExtraction);
router.patch('/:id/status', authenticate, updateComplaintStatus);

export default router;
