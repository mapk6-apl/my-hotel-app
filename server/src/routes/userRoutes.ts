import { Router } from 'express'; 
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { updateProfile, getAmenities } from '../controllers/userController.js'; 

const router = Router(); 

router.put('/profile', authenticateToken as any, updateProfile as any); 
router.get('/amenities', getAmenities); 

export default router;