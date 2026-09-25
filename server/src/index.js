import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import messRoutes from './routes/messRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { checkAndTriggerPredictiveAlerts } from './engines/predictiveMaintenanceEngine.js';
import prisma from './prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Smart Hostel Management Backend',
    timestamp: new Date().toISOString()
  });
});

// Periodic maintenance alert check
setInterval(async () => {
  try {
    await checkAndTriggerPredictiveAlerts(prisma);
  } catch (e) {
    // silence background task errors
  }
}, 60000);

app.listen(PORT, async () => {
  console.log(`🚀 Smart Hostel Backend Server running on http://localhost:${PORT}`);
  try {
    await checkAndTriggerPredictiveAlerts(prisma);
    console.log(`✅ Predictive Maintenance Engine initialized.`);
  } catch (e) {
    console.warn(`Could not run initial predictive check: ${e.message}`);
  }
});
