import { Router } from 'express'; 
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { createBooking, getUserBookings, cancelBooking, } from '../controllers/bookingController.js'; 

const router = Router(); 

// Protect all reservation routes with authentication middleware 
router.post('/', authenticateToken as any, createBooking as any); 
router.get('/my-bookings', authenticateToken as any, getUserBookings as any); 
router.patch('/:id/cancel', authenticateToken as any, cancelBooking as any); 

export default router;