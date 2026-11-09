import { Router } from 'express'; 
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { requireAdmin } from '../middleware/adminMiddleware.js'; 
import {
    getAdminStats,
    getAllAdminBookings,
    updateBookingStatus,
    createHotelBranch,
    updateHotelBranch,
    deleteHotelBranch,
} from '../controllers/adminController.js';
import { importPropertyImages } from '../controllers/propertyImageController.js';

const router = Router(); 

// Protect all admin endpoints with Token + Admin Role Middleware 
router.use(authenticateToken as any, requireAdmin as any); 

router.get('/stats', getAdminStats as any); 
router.get('/bookings', getAllAdminBookings as any); 
router.patch('/bookings/:id/status', updateBookingStatus as any); 
router.post('/hotels', createHotelBranch as any); 
router.put('/hotels/:id', updateHotelBranch as any);
router.delete('/hotels/:id', deleteHotelBranch as any);
router.post('/hotels/:id/images/import', importPropertyImages as any);

export default router;