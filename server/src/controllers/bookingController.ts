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

        if (!roomId || !checkIn || !checkOut || !guestCount) {
            res.status(400).json({ error: 'Missing required booking fields (roomId, checkIn, checkOut, guestCount)' });
            return;
        }

        // 1.Fetch room details and price per night in ZAR 
        const roomQuery = 'SELECT price_per_night, capacity, is_available FROM rooms WHERE id = $1';
        const roomResult = await pool.query(roomQuery, [roomId]);

        if (roomResult.rows.length === 0) { 
            res.status(404).json({ error: 'Selected room category does not exist' }); 
            return; 
        } 
        
        const room = roomResult.rows[0]; 
        
        if (!room.is_available) { 
            res.status(400).json({ error: 'Selected room is currently unavailable' }); 
            return; 
        } 
        
        if (guestCount > room.capacity) { 
            res.status(400).json({ error: `Guest count exceeds maximum room capacity of ${room.capacity}` }); 
            return; 
        }

        // 2. Calculate stay duration in nights 
        const startDate = new Date(checkIn); 
        const endDate = new Date(checkOut); 
        const diffTime = endDate.getTime() - startDate.getTime(); 
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); //
        
        if (nights <= 0) { 
            res.status(400).json({ error: 'Check-out date must be greater than check-in date' }); 
            return; 
        }

        //3. Calculate total stay amount in ZAR (R) 
        const totalAmount = (nights * Number(room.price_per_night)).toFixed(2);

        //4. Insert reservation into PostgreSQL 
        const insertQuery = ` INSERT INTO reservations (user_id, room_id, check_in, check_out, guest_count, total_amount, payment_status, status) 
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'approved') 
        RETURNING * `; 
        
        const newBooking = await pool.query(insertQuery, [ userId, roomId, checkIn, checkOut, guestCount, totalAmount, ]); 
        res.status(201).json({ 
            success: true, 
            message: 'Reservation created successfully!', 
            data: newBooking.rows[0], 
        }); 
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
        acc.id AS accommodation_id, 
        acc.name AS hotel_name, 
        acc.city, 
        acc.address, 
        img.image_url AS hero_image 
        FROM reservations res 
        JOIN rooms r ON res.room_id = r.id 
        JOIN accommodations acc ON r.accommodation_id = acc.id 
        LEFT JOIN accommodation_images img ON acc.id = img.accommodation_id 
        AND img.is_hero = true 
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

