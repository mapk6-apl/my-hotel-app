import type { Request, Response } from 'express'; 
import { pool } from '../config/db.js';

//GET /api/hotels fetches Break-Away Hotel branches with optional search & filters (city, price, rating)
export const getAllHotels = async (req: Request, res: Response): Promise<void> => {
    try {
        const { city, minPrice, maxPrice, starRating } = req.query; 
        
        let queryText = ` 
        SELECT a.id, a.name, a.description, a.address, a.city, a.latitude, a.longitude, a.star_rating,
        (SELECT img.image_url FROM accommodation_images img
         WHERE img.accommodation_id = a.id AND img.is_hero = true
         ORDER BY img.id ASC LIMIT 1) AS hero_image,
        COALESCE(MIN(r.price_per_night), 0) AS starting_price
        FROM accommodations a 
        LEFT JOIN rooms r ON a.id = r.accommodation_id `;

        const queryParams: any[] = []; 
        const whereClauses: string[] = []; 
        
        if (city) { 
            queryParams.push(`%${city}%`); 
            whereClauses.push(`a.city ILIKE $${queryParams.length}`); 
        }

        if (starRating) { 
            queryParams.push(Number(starRating)); 
            whereClauses.push(`a.star_rating >= $${queryParams.length}`); 
        } 
        
        if (whereClauses.length > 0) { 
            queryText += ` WHERE ` + whereClauses.join(' AND '); 
        }

        queryText += ` GROUP BY a.id`;
        
        if (minPrice || maxPrice) { 
            const havingClauses: string[] = []; 
            if (minPrice) { 
                queryParams.push(Number(minPrice)); 
                havingClauses.push(`MIN(r.price_per_night) >= $${queryParams.length}`); 
            } 
            if (maxPrice) { 
                queryParams.push(Number(maxPrice)); 
                havingClauses.push(`MIN(r.price_per_night) <= $${queryParams.length}`);
            } queryText += ` HAVING ` + havingClauses.join(' AND '); 
        } 
        queryText += ` ORDER BY a.star_rating DESC`; 
        
        const result = await pool.query(queryText, queryParams); 
        res.status(200).json({ 
            success: true, 
            count: result.rows.length, 
            data: result.rows, 
        });
    } catch (error) {
        console.error('Error fetching accommodations:', error); 
        res.status(500).json({ error: 'Failed to fetch accommodation listings'});
    }
}

//GET /api/hotels/:id fetches hotel details, gallery, rooms, amenities, and guest reviews
export const getHotelById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; 
        const hotelQuery = `SELECT id, name, description, address, city, latitude, longitude, star_rating, policies 
        FROM accommodations 
        WHERE id = $1`; 
        
        const hotelResult = await pool.query(hotelQuery, [id]); 
        
        if (hotelResult.rows.length === 0) { 
            res.status(404).json({ error: 'Break-Away Hotel branch not found' }); 
            return; 
        }

        const imagesQuery = `SELECT id, image_url, is_hero 
        FROM accommodation_images 
        WHERE accommodation_id = $1`; 
        
        const imagesResult = await pool.query(imagesQuery, [id]); 
        const roomsQuery = `SELECT id, room_type, capacity, price_per_night, is_available 
        FROM rooms 
        WHERE accommodation_id = $1`; 
        
        const roomsResult = await pool.query(roomsQuery, [id]); 
        const amenitiesQuery = ` SELECT am.id, am.name 
        FROM amenities am 
        JOIN accommodation_amenities aa ON am.id = aa.amenity_id 
        WHERE aa.accommodation_id = $1 `; 
        
        const amenitiesResult = await pool.query(amenitiesQuery, [id]); 
        const reviewsQuery = ` SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS guest_name, u.avatar_url 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.accommodation_id = $1 
        ORDER BY r.created_at DESC `; 
        
        const reviewsResult = await pool.query(reviewsQuery, [id]);

        res.status(200).json({ 
            success: true, 
            data: { ...hotelResult.rows[0], 
                images: imagesResult.rows, 
                rooms: roomsResult.rows, 
                amenities: amenitiesResult.rows, 
                reviews: reviewsResult.rows, 
            }, 
        });
    } catch (error) {
        console.error(`Error fetching hotel with ID ${req.params.id}:`, error); 
        res.status(500).json({ error: 'Failed to fetch accommodation details' 
        });
    }
};