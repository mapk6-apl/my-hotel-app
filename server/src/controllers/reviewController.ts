import type { Request, Response } from 'express'; 
import { pool } from '../config/db.js'; 
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js'; 

//POST /api/reviews submits a rating & comment for a Break-Away Hotel branch. 
export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id; 
        const { accommodationId, rating, comment } = req.body; 
        
        if (!userId) { 
            res.status(401).json({ error: 'Authentication required' }); 
            return; 
        } 
        
        if (!accommodationId || !rating || !comment) { 
            res.status(400).json({ error: 'Missing required fields (accommodationId, rating, comment)' }); 
            return; 
        }

        const query = ` 
        INSERT INTO reviews (user_id, accommodation_id, rating, comment) 
        VALUES ($1, $2, $3, $4) 
        RETURNING * 
        `; 
        
        const result = await pool.query(query, [userId, accommodationId, rating, comment]); 
        res.status(201).json({ 
            success: true, 
            message: 'Review posted successfully!',
             data: result.rows[0], 
        });
    } catch (error) {
        console.error('Error posting review:', error); 
        res.status(500).json({ error: 'Failed to post review' });
    }
};

//GET /api/reviews/hotel/:accommodationId fetches all reviews for a specific hotel branch.
export const getHotelReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { accommodationId } = req.params; 
        const query = ` SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS guest_name, u.avatar_url 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.accommodation_id = $1 
        ORDER BY r.created_at DESC `;

        const result = await pool.query(query, [accommodationId]); 
        res.status(200).json({ 
            success: true, 
            count: result.rows.length, 
            data: result.rows, 
        });
    } catch (error) {
        console.error('Error fetching hotel reviews:', error); 
        res.status(500).json({ error: 'Failed to fetch reviews' 
        });
    }
};