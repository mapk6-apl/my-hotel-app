import { Router } from 'express'; 
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { requireAdmin } from '../middleware/adminMiddleware.js'; 
import { getAdminStats, getAllAdminBookings, updateBookingStatus, createHotelBranch, } from '../controllers/adminController.js';

const router = Router(); 

// Protect all admin endpoints with Token + Admin Role Middleware 
router.use(authenticateToken as any, requireAdmin as any); 

router.get('/stats', getAdminStats as any); 
router.get('/bookings', getAllAdminBookings as any); 
router.patch('/bookings/:id/status', updateBookingStatus as any); 
router.post('/hotels', createHotelBranch as any); 

export default router;