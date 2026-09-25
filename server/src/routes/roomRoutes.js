import { Router } from 'express';
import {
  getAllRooms,
  updatePreferences,
  getStudentRecommendations,
  getAdminAllocationQueue,
  allocateRoom,
  testCompatibility,
  getAllAllocatedStudents,
  deallocateStudent,
  getMyAllocation
} from '../controllers/roomController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllRooms);
router.get('/my-allocation', authenticate, getMyAllocation);
router.post('/preferences', authenticate, updatePreferences);
router.get('/recommendations', authenticate, getStudentRecommendations);
router.get('/admin-queue', authenticate, authorizeRoles('ADMIN', 'WARDEN'), getAdminAllocationQueue);
router.get('/allocated-students', authenticate, authorizeRoles('ADMIN', 'WARDEN'), getAllAllocatedStudents);
router.post('/allocate', authenticate, authorizeRoles('ADMIN', 'WARDEN'), allocateRoom);
router.post('/deallocate', authenticate, authorizeRoles('ADMIN', 'WARDEN'), deallocateStudent);
router.post('/test-compatibility', testCompatibility);

export default router;
