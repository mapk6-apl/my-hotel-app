import type { Response } from 'express'; 
import { pool } from '../config/db.js'; 
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

//GET /api/favorites fetches saved favorite properties for the logged-in guest.
export const getUserFavorites = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id; 
        const query = ` SELECT a.id, a.name, a.city, a.star_rating, img.image_url AS hero_image, COALESCE(MIN(r.price_per_night), 0) AS starting_price 
        FROM user_favorites f 
        JOIN accommodations a ON f.accommodation_id = a.id 
        LEFT JOIN accommodation_images img ON a.id = img.accommodation_id AND img.is_hero = true 
        LEFT JOIN rooms r ON a.id = r.accommodation_id 
        WHERE f.user_id = $1 
        GROUP BY a.id, img.image_url `; 
        
        const result = await pool.query(query, [userId]); 
        res.status(200).json({ 
            success: true, 
            count: result.rows.length, 
            data: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch guest favorites' });
    }
}