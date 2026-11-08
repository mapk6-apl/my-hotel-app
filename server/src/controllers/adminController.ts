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
        LEFT JOIN users u ON res.user_id = u.id
        LEFT JOIN rooms r ON res.room_id = r.id
        LEFT JOIN accommodations acc ON r.accommodation_id = acc.id
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
        const { status } = req.body;
        const validStatuses = ['pending', 'approved', 'cancelled', 'completed'];
        if (typeof status !== 'string' || !validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid reservation status' });
            return;
        }
        const query = ` 
        UPDATE reservations 
        SET status = $1
        WHERE id = $2
        RETURNING * 
        `; 

        const result = await pool.query(query, [status, id]);
        
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
    const client = await pool.connect();
    try {
        const {
            name, description, address, city, star_rating, starting_price,
            room_type, capacity, hero_image,
        } = req.body;
        const price = Number(starting_price);
        const rating = Number(star_rating);
        const roomCapacity = Number(capacity);
        if (
            ![name, description, address, city, room_type].every((value) => typeof value === 'string' && value.trim()) ||
            !Number.isFinite(price) || price <= 0 ||
            !Number.isFinite(rating) || rating < 0 || rating > 5 ||
            !Number.isInteger(roomCapacity) || roomCapacity < 1
        ) {
            res.status(400).json({ error: 'Provide valid property details, a room type, capacity, price and rating.' });
            return;
        }

        await client.query('BEGIN');
        const propertyResult = await client.query(
            `INSERT INTO accommodations (name, description, address, city, star_rating)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name.trim(), description.trim(), address.trim(), city.trim(), rating]
        );
        const propertyId = propertyResult.rows[0].id as number;
        await client.query(
            `INSERT INTO rooms (accommodation_id, room_type, capacity, price_per_night, is_available)
             VALUES ($1, $2, $3, $4, true)`,
            [propertyId, room_type.trim(), roomCapacity, price]
        );
        if (typeof hero_image === 'string' && hero_image.trim()) {
            await client.query(
                `INSERT INTO accommodation_images (accommodation_id, image_url, is_hero)
                 VALUES ($1, $2, true)`,
                [propertyId, hero_image.trim()]
            );
        }
        await client.query('COMMIT');

        res.status(201).json({ 
            success: true, 
            message: 'Break-Away Hotel branch added successfully!', 
            data: propertyResult.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating hotel branch:', error); 
        res.status(500).json({ error: 'Failed to create new hotel branch' });
    } finally {
        client.release();
    }
};

export const updateHotelBranch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const client = await pool.connect();
    try {
        const propertyId = Number(req.params.id);
        const {
            name, description, address, city, star_rating, starting_price, hero_image,
        } = req.body;
        const price = Number(starting_price);
        const rating = Number(star_rating);
        if (
            !Number.isInteger(propertyId) || propertyId <= 0 ||
            ![name, description, address, city].every((value) => typeof value === 'string' && value.trim()) ||
            !Number.isFinite(price) || price <= 0 ||
            !Number.isFinite(rating) || rating < 0 || rating > 5
        ) {
            res.status(400).json({ error: 'Provide valid property details, starting price and rating.' });
            return;
        }

        await client.query('BEGIN');
        const existing = await client.query(
            'SELECT id FROM accommodations WHERE id = $1 FOR UPDATE',
            [propertyId]
        );
        if (existing.rowCount === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        const updated = await client.query(
            `UPDATE accommodations
             SET name = $1, description = $2, address = $3, city = $4, star_rating = $5
             WHERE id = $6 RETURNING *`,
            [name.trim(), description.trim(), address.trim(), city.trim(), rating, propertyId]
        );
        const room = await client.query(
            `UPDATE rooms SET price_per_night = $1
             WHERE id = (SELECT id FROM rooms WHERE accommodation_id = $2 ORDER BY price_per_night ASC, id ASC LIMIT 1)
             RETURNING id`,
            [price, propertyId]
        );
        if (room.rowCount === 0) {
            await client.query(
                `INSERT INTO rooms (accommodation_id, room_type, capacity, price_per_night, is_available)
                 VALUES ($1, 'Standard Room', 2, $2, true)`,
                [propertyId, price]
            );
        }
        if (typeof hero_image === 'string' && hero_image.trim()) {
            const image = await client.query(
                `UPDATE accommodation_images SET image_url = $1, is_hero = true
                 WHERE id = (
                   SELECT id FROM accommodation_images
                   WHERE accommodation_id = $2 AND is_hero = true
                   ORDER BY id ASC LIMIT 1
                 ) RETURNING id`,
                [hero_image.trim(), propertyId]
            );
            if (image.rowCount === 0) {
                await client.query(
                    `INSERT INTO accommodation_images (accommodation_id, image_url, is_hero)
                     VALUES ($1, $2, true)`,
                    [propertyId, hero_image.trim()]
                );
            }
        }
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Property updated successfully', data: updated.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating hotel branch:', error);
        res.status(500).json({ error: 'Failed to update property' });
    } finally {
        client.release();
    }
};

export const deleteHotelBranch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const client = await pool.connect();
    try {
        const propertyId = Number(req.params.id);
        if (!Number.isInteger(propertyId) || propertyId <= 0) {
            res.status(400).json({ error: 'Invalid property ID' });
            return;
        }
        await client.query('BEGIN');
        const property = await client.query(
            'SELECT id FROM accommodations WHERE id = $1 FOR UPDATE',
            [propertyId]
        );
        if (property.rowCount === 0) {
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'Property not found' });
            return;
        }
        const reservationCount = await client.query(
            `SELECT COUNT(*) AS count
             FROM reservations res
             JOIN rooms room ON res.room_id = room.id
             WHERE room.accommodation_id = $1`,
            [propertyId]
        );
        if (Number(reservationCount.rows[0].count) > 0) {
            await client.query('ROLLBACK');
            res.status(409).json({
                error: 'This property has reservation history and cannot be deleted without an archive feature.',
            });
            return;
        }
        await client.query('DELETE FROM accommodations WHERE id = $1', [propertyId]);
        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting hotel branch:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    } finally {
        client.release();
    }
};