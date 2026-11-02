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

//GET /api/admin/bookings retrieves all reservations across all users for admin management.
export const getAllAdminBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const query = ` SELECT 
        res.id AS reservation_id, 
        res.check_in, 
        res.check_out, 
        res.guest_count, 
        res.total_amount, 
        res.payment_status, 
        res.status, 
        res.created_at, 
        u.full_name AS guest_name, 
        u.email AS guest_email, 
        acc.name AS hotel_name, 
        r.room_type 
        FROM reservations res 
        JOIN users u ON res.user_id = u.id 
        JOIN rooms r ON res.room_id = r.id 
        JOIN accommodations acc ON r.accommodation_id = acc.id 
        ORDER BY res.created_at DESC 
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true, 
            count: result.rows.length, 
            data: result.rows,
        });
    } catch (error) {
        console.error('Error fetching admin bookings:', error); 
        res.status(500).json({ error: 'Failed to fetch global reservations' });
    }
};

//PATCH /api/admin/bookings/:id/status updates reservation status (e.g., 'approved', 'cancelled', 'completed').
export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try { 
        const { id } = req.params; 
        const { status, payment_status } = req.body; 
        const query = ` 
        UPDATE reservations 
        SET status = COALESCE($1, status), payment_status = COALESCE($2, payment_status) 
        WHERE id = $3 
        RETURNING * 
        `; 

        const result = await pool.query(query, [status, payment_status, id]); 
        
        if (result.rows.length === 0) { 
            res.status(404).json({ error: 'Reservation not found' }); 
            return; 
        }

        res.status(200).json({ 
            success: true, 
            message: 'Reservation status updated successfully', 
            data: result.rows[0], 
        });
    } catch(error){
        console.error('Error updating booking status:', error); 
        res.status(500).json({ error: 'Failed to update reservation status' });
    }
};

//POST /api/admin/hotels adds a new Break-Away Hotel branch to PostgreSQL.
export const createHotelBranch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { name, description, address, city, latitude, longitude, star_rating, policies } = req.body; 
        const query = ` 
        INSERT INTO accommodations (name, description, address, city, latitude, longitude, star_rating, policies) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING * 
        `;

        const result = await pool.query(query, [ name, description, address, city, latitude || 0, longitude || 0, star_rating || 4.5, policies || 'Standard check-in policies apply.', 
        ]);

        res.status(201).json({ 
            success: true, 
            message: 'Break-Away Hotel branch added successfully!', 
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error creating hotel branch:', error); 
        res.status(500).json({ error: 'Failed to create new hotel branch' });
    }
};