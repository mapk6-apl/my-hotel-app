import { Router } from 'express'; 
import { getAllHotels, getHotelById, getHotelFilterOptions } from '../controllers/hotelController.js';

const router = Router(); 

router.get('/', getAllHotels); 
router.get('/filters', getHotelFilterOptions);
router.get('/:id', getHotelById); 

export default router;