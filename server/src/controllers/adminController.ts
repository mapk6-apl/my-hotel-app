import type { Response } from 'express'; 
import { pool } from '../config/db.js'; 
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

//GET /api/admin/stats provides overview metrics for the Admin Dashboard (Revenue in ZAR, totals).
export const getAdminStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try { 
        const revenueQuery = `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue 
        FROM reservations 
        WHERE status != 'cancelled'`; 
        const bookingsCountQuery = `SELECT COUNT(*) AS total_bookings 
        FROM reservations`; 
        const activeHotelsQuery = `SELECT COUNT(*) AS total_hotels 
        FROM accommodations`; 
        const totalUsersQuery = `SELECT COUNT(*) AS total_users 
        FROM users 
        WHERE role = 'guest'`;

        const [revenueRes, bookingsRes, hotelsRes, usersRes] = await Promise.all([ 
            pool.query(revenueQuery), 
            pool.query(bookingsCountQuery), 
            pool.query(activeHotelsQuery), 
            pool.query(totalUsersQuery), 
        ]);

        res.status(200).json({ 
            success: true, 
            data: { 
                totalRevenueZAR: Number(revenueRes.rows[0].total_revenue), 
                totalBookings: Number(bookingsRes.rows[0].total_bookings), 
                totalHotels: Number(hotelsRes.rows[0].total_hotels), 
                totalGuests: Number(usersRes.rows[0].total_users), 
            }, 
        });
    } catch(error){
       console.error('Error fetching admin stats:', error); 
       res.status(500).json({ error: 'Failed to fetch dashboard statistics' 
}); 
    }
};