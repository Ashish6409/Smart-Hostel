import { Router } from 'express';
import { chatWithAssistant } from '../controllers/assistantController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/chat', authenticate, chatWithAssistant);

export default router;
