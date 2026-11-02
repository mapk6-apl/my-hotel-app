import { Router } from 'express'; 
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { getUserFavorites, toggleFavorite } from '../controllers/favouriteController.js'; 

const router = Router(); router.get('/', authenticateToken as any, getUserFavorites as any); 

router.post('/toggle', authenticateToken as any, toggleFavorite as any); 

export default router;