import type { Response } from 'express';
import { pool } from '../config/db.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// POST /api/bookings creates a new hotel reservation for the authenticated guest and automatically calculates total price in ZAR based on stay duration (nights * price_per_night).
export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { roomId, checkIn, checkOut, guestCount } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const parsedRoomId = Number(roomId);
        const parsedGuestCount = Number(guestCount);
        if (
            !Number.isInteger(parsedRoomId) || parsedRoomId <= 0 ||
            !Number.isInteger(parsedGuestCount) || parsedGuestCount <= 0 ||
            typeof checkIn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(checkIn) ||
            typeof checkOut !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)
        ) {
            res.status(400).json({ error: 'Missing required booking fields (roomId, checkIn, checkOut, guestCount)' });
            return;
        }

        const startDate = new Date(`${checkIn}T00:00:00.000Z`);
        const endDate = new Date(`${checkOut}T00:00:00.000Z`);
        if (
            !Number.isFinite(startDate.getTime()) ||
            !Number.isFinite(endDate.getTime()) ||
            startDate.toISOString().slice(0, 10) !== checkIn ||
            endDate.toISOString().slice(0, 10) !== checkOut ||
            endDate <= startDate
        ) {
            res.status(400).json({ error: 'Check-in and check-out must be valid dates, and check-out must be later.' });
            return;
        }

        const client = await pool.connect();
        try {
        await client.query('BEGIN');
        const roomQuery = 'SELECT price_per_night, capacity, is_available FROM rooms WHERE id = $1 FOR UPDATE';
        const roomResult = await client.query(roomQuery, [parsedRoomId]);

        if (roomResult.rows.length === 0) { 
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'Selected room category does not exist' }); 
            return; 
        } 
        
        const room = roomResult.rows[0]; 
        
        if (!room.is_available) { 
            await client.query('ROLLBACK');
            res.status(400).json({ error: 'Selected room is currently unavailable' }); 
            return; 
        } 
        
        if (parsedGuestCount > room.capacity) {
            await client.query('ROLLBACK');
            res.status(400).json({ error: `Guest count exceeds maximum room capacity of ${room.capacity}` }); 
            return; 
        }

        const overlappingReservation = await client.query(
            `SELECT id
             FROM reservations
             WHERE room_id = $1
               AND status <> 'cancelled'
               AND check_in < $3::date
               AND check_out > $2::date
             LIMIT 1`,
            [parsedRoomId, checkIn, checkOut]
        );
        if (overlappingReservation.rows.length > 0) {
            await client.query('ROLLBACK');
            res.status(409).json({ error: 'This room is no longer available for the selected dates. Choose another room or dates.' });
            return;
        }

        // 2. Calculate stay duration in nights 
        const diffTime = endDate.getTime() - startDate.getTime();
        const nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (!Number.isFinite(nights) || nights <= 0) {
            await client.query('ROLLBACK');
            res.status(400).json({ error: 'Check-out date must be greater than check-in date' }); 
            return; 
        }

        //3. Calculate total stay amount in ZAR (R) 
        const totalAmount = (nights * Number(room.price_per_night)).toFixed(2);

        //4. Insert reservation into PostgreSQL 
        const insertQuery = `
        WITH new_reservation AS (
            INSERT INTO reservations
                (user_id, room_id, check_in, check_out, guest_count, total_amount, payment_status, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'pending')
            RETURNING *
        )
        SELECT
            nr.id AS reservation_id,
            nr.check_in,
            nr.check_out,
            nr.guest_count,
            nr.total_amount,
            nr.payment_status,
            nr.status,
            nr.created_at,
            u.full_name AS guest_name,
            u.email AS guest_email,
            r.room_type,
            r.price_per_night,
            a.id AS accommodation_id,
            a.name AS hotel_name,
            a.city,
            (SELECT image_url FROM accommodation_images
             WHERE accommodation_id = a.id AND is_hero = true
             ORDER BY id ASC LIMIT 1) AS hero_image
        FROM new_reservation nr
        JOIN users u ON nr.user_id = u.id
        JOIN rooms r ON nr.room_id = r.id
        JOIN accommodations a ON r.accommodation_id = a.id
        `;
        
        const newBooking = await client.query(insertQuery, [
            userId, parsedRoomId, checkIn, checkOut, parsedGuestCount, totalAmount,
        ]);
        await client.query('COMMIT');
        res.status(201).json({
            success: true,
            message: 'Reservation created successfully!',
            data: newBooking.rows[0],
        });
        return;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) { 
        console.error('Error creating reservation:', error); 
        res.status(500).json({ error: 'Failed to create reservation' }); 
    } 
};

//GET /api/bookings/my-bookings retrieves all past and upcoming reservations for the authenticated guest.
export const getUserBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if(!userId){
            res.status(401).json({error: 'User not authenticated'})
            return;
        }

        const bookingsQuery = ` SELECT
        res.id AS reservation_id, 
        res.check_in, res.check_out, 
        res.guest_count, 
        res.total_amount,
        res.payment_status, 
        res.status, 
        res.created_at, 
        r.room_type, 
        r.price_per_night,
        guest.full_name AS guest_name,
        guest.email AS guest_email,
        acc.id AS accommodation_id, 
        acc.name AS hotel_name, 
        acc.city,
        acc.address,
        (SELECT image_url FROM accommodation_images
         WHERE accommodation_id = acc.id AND is_hero = true
         ORDER BY id ASC LIMIT 1) AS hero_image
        FROM reservations res 
        JOIN rooms r ON res.room_id = r.id 
        JOIN accommodations acc ON r.accommodation_id = acc.id 
        JOIN users guest ON res.user_id = guest.id
        WHERE res.user_id = $1 
        ORDER BY res.created_at DESC `; 
        
        const result = await pool.query(bookingsQuery, [userId]); 
        
        res.status(200).json({ 
            success: true, 
            count: result.rows.length, 
            data: result.rows, 
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error); 
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
};

//PATCH /api/bookings/:id/cancel allows a guest to cancel an active reservation.
export const cancelBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try { 
        const userId = req.user?.id; 
        const { id } = req.params; 
        const checkQuery = 'SELECT * FROM reservations WHERE id = $1 AND user_id = $2'; 
        const checkResult = await pool.query(checkQuery, [id, userId]); 
        
        if (checkResult.rows.length === 0) { 
            res.status(404).json({ error: 'Reservation not found or unauthorized' }); 
            return; 
        }

        const updateQuery = ` UPDATE reservations 
        SET status = 'cancelled' 
        WHERE id = $1 AND user_id = $2 
        RETURNING * `; 
        
        const updatedResult = await pool.query(updateQuery, [id, userId]);

        res.status(200).json({ 
            success: true, 
            message: 'Reservation cancelled successfully', 
            data: updatedResult.rows[0],
        });
    }catch(error){
        console.error('Error cancelling reservation:', error); 
        res.status(500).json({ error: 'Failed to cancel reservation' });
    }
};
