import type { Response } from 'express'; 
import { pool } from '../config/db.js'; 
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

//PUT /api/users/profile updates the logged-in user's profile details.
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id; 
        const { fullName, phone, avatarUrl } = req.body;
        const hasPhone = Object.prototype.hasOwnProperty.call(req.body, 'phone');
        if (
            typeof fullName !== 'string' || !fullName.trim() ||
            (hasPhone && phone !== null && typeof phone !== 'string')
        ) {
            res.status(400).json({ error: 'Provide a valid name and phone number.' });
            return;
        }
        const query = ` 
        UPDATE users 
        SET full_name = $1,
            phone = CASE WHEN $2 THEN $3 ELSE phone END,
            avatar_url = COALESCE($4, avatar_url)
        WHERE id = $5
        RETURNING id, email, full_name, avatar_url, phone, role`; //COALESCE returns the first non-null value from a list of arguments.
    
        const result = await pool.query(query, [fullName.trim(), hasPhone, hasPhone ? phone : null, avatarUrl, userId]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'User account not found.' });
            return;
        }
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