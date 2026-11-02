import { Router } from 'express'; 
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { createReview, getHotelReviews } from '../controllers/reviewController.js';

const router = Router(); 

router.get('/hotel/:accommodationId', getHotelReviews); 
router.post('/', authenticateToken as any, createReview as any);

export default router;