import { Router } from 'express'; 
import passport from '../config/passport.js'; 
import { googleCallback, getCurrentuser } from '../controllers/authController.js'; 

const router = Router(); 

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] })); 
router.get( '/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback ); 
router.get('/me', getCurrentuser); 

export default router;