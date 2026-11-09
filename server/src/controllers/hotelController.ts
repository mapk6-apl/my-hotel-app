import type { Request, Response } from 'express'; 
import { pool } from '../config/db.js';

//GET /api/hotels fetches Break-Away Hotel branches with optional search & filters (city, price, rating)
export const getAllHotels = async (req: Request, res: Response): Promise<void> => {
    try {
        const { city, minPrice, maxPrice, starRating, guests } = req.query;
        const requestedAmenities = Array.isArray(req.query.amenity)
            ? req.query.amenity.map(String).filter(Boolean)
            : typeof req.query.amenity === 'string'
                ? [req.query.amenity].filter(Boolean)
                : [];
        const guestCount = guests === undefined ? undefined : Number(guests);

        if (guestCount !== undefined && (!Number.isInteger(guestCount) || guestCount < 1)) {
            res.status(400).json({ error: 'Guest count must be a positive whole number.' });
            return;
        }
        
        let queryText = ` 
        SELECT a.id, a.name, a.description, a.address, a.city, a.latitude, a.longitude, a.star_rating,
        (SELECT img.image_url FROM accommodation_images img
         WHERE img.accommodation_id = a.id AND img.is_hero = true
         ORDER BY img.id ASC LIMIT 1) AS hero_image,
        COALESCE((
            SELECT json_agg(
                json_build_object(
                    'image_url', img.image_url,
                    'attribution_name', to_jsonb(img)->>'attribution_name',
                    'attribution_url', to_jsonb(img)->>'attribution_url',
                    'source_name', to_jsonb(img)->>'source_name',
                    'source_url', to_jsonb(img)->>'source_url',
                    'alt_text', to_jsonb(img)->>'alt_text',
                    'photo_id', to_jsonb(img)->>'photo_id'
                )
                ORDER BY img.is_hero DESC,
                    (to_jsonb(img)->>'display_order')::integer NULLS LAST,
                    img.id ASC
            )
            FROM accommodation_images img
            WHERE img.accommodation_id = a.id
        ), '[]'::json) AS gallery_images,
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

        if (guestCount !== undefined) {
            queryParams.push(guestCount);
            whereClauses.push(`EXISTS (
                SELECT 1 FROM rooms guest_room
                WHERE guest_room.accommodation_id = a.id
                  AND guest_room.is_available = true
                  AND guest_room.capacity >= $${queryParams.length}
            )`);
        }

        if (requestedAmenities.length > 0) {
            queryParams.push(requestedAmenities);
            whereClauses.push(`(
                SELECT COUNT(DISTINCT amenity.name)
                FROM accommodation_amenities property_amenity
                JOIN amenities amenity ON amenity.id = property_amenity.amenity_id
                WHERE property_amenity.accommodation_id = a.id
                  AND amenity.name = ANY($${queryParams.length}::text[])
            ) = cardinality($${queryParams.length}::text[])`);
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
        queryText += ` ORDER BY a.star_rating DESC, a.id ASC`;
        
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

export const getHotelFilterOptions = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [amenitiesResult, guestsResult, pricesResult] = await Promise.all([
            pool.query<{ name: string }>('SELECT name FROM amenities ORDER BY name'),
            pool.query<{ max_guests: number }>(
                'SELECT COALESCE(MAX(capacity), 1)::integer AS max_guests FROM rooms WHERE is_available = true'
            ),
            pool.query<{ min_price: number; max_price: number }>(
                `SELECT COALESCE(MIN(price_per_night), 0)::integer AS min_price,
                        COALESCE(MAX(price_per_night), 0)::integer AS max_price
                 FROM rooms WHERE is_available = true`
            ),
        ]);
        res.status(200).json({
            success: true,
            data: {
                amenities: amenitiesResult.rows.map((row) => row.name),
                maxGuests: guestsResult.rows[0]?.max_guests ?? 1,
                minPrice: pricesResult.rows[0]?.min_price ?? 0,
                maxPrice: pricesResult.rows[0]?.max_price ?? 0,
            },
        });
    } catch (error) {
        console.error('Error fetching property filter options:', error);
        res.status(500).json({ error: 'Failed to fetch property filter options.' });
    }
};

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

        const imagesQuery = `SELECT id, image_url, is_hero, alt_text, photo_id, source_url,
            to_jsonb(image_row)->>'attribution_name' AS attribution_name,
            to_jsonb(image_row)->>'attribution_url' AS attribution_url,
            to_jsonb(image_row)->>'source_name' AS source_name
        FROM accommodation_images 
        AS image_row
        WHERE accommodation_id = $1
        ORDER BY is_hero DESC, id ASC`;
        
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