import type { Response } from 'express'; 
import { pool } from '../config/db.js'; 
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

//PUT /api/users/profile updates the logged-in user's profile details.
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id; 
        const { fullName, phone, avatarUrl } = req.body; 
        const query = ` 
        UPDATE users 
        SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), avatar_url = COALESCE($3, avatar_url) 
        WHERE id = $4 
        RETURNING id, email, full_name, avatar_url, phone, role`; //COALESCE returns the first non-null value from a list of arguments.
    
        const result = await pool.query(query, [fullName, phone, avatarUrl, userId]); 
        res.status(200).json({ 
            success: true,
             message: 'Profile updated successfully', 
             user: result.rows[0], 
            });
    } catch (error) {
        console.error('Error updating profile:', error); 
        res.status(500).json({ error: 'Failed to update profile' });
    }
}

//GET /api/amenities fetches the master list of hotel amenities for UI search filters. 
export const getAmenities = async (req: any, res: Response): Promise<void> => {
    try {
       const result = await pool.query('SELECT * FROM amenities ORDER BY id ASC'); 
       res.status(200).json({ 
        success: true, 
        data: result.rows, }); 
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch amenities' });
    }
};