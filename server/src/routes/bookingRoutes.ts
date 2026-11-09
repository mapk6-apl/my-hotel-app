import express, { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { createBooking, getUserBookings, cancelBooking, } from '../controllers/bookingController.js'; 
import {
  createPayFastPayment,
  getPayFastPaymentStatus,
  receivePayFastNotification,
} from '../controllers/payfastController.js';

const router = Router(); 

// Protect all reservation routes with authentication middleware 
router.post('/', authenticateToken as any, createBooking as any); 
router.get('/my-bookings', authenticateToken as any, getUserBookings as any); 
router.patch('/:id/cancel', authenticateToken as any, cancelBooking as any); 
router.post(
  '/payfast/notify',
  express.urlencoded({ extended: false, limit: '20kb', parameterLimit: 100 }),
  receivePayFastNotification
);
router.post('/:id/payfast', authenticateToken as any, createPayFastPayment as any);
router.get('/:id/payfast/:paymentReference', authenticateToken as any, getPayFastPaymentStatus as any);

export default router;