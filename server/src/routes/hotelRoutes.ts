import { Router } from 'express'; 
import { getAllHotels, getHotelById } from '../controllers/hotelController.js'; 

const router = Router(); 

router.get('/', getAllHotels); 
router.get('/:id', getHotelById); 

export default router;