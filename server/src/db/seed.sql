-- 1. SEED AMENITIES 
INSERT INTO amenities (id, name) VALUES 
(1, 'Free High-Speed Wi-Fi'), 
(2, 'Outdoor Swimming Pool'),
(3, 'Secure On-Site Parking'), 
(4, 'Air Conditioning'), 
(5, 'Buffet Breakfast Included'), 
(6, 'Fitness Center / Gym'), 
(7, 'Full-Service Spa &amp; Wellness'), 
(8, 'Conference &amp; Meeting Rooms'), 
(9, 'Airport Shuttle Service') 
ON CONFLICT (id) DO NOTHING;

-- 2. SEED ACCOMMODATIONS (Break-Away Hotels SA Branches) 
INSERT INTO accommodations (id, name, description, address, city, latitude, longitude, star_rating, policies) VALUES 
( 1, 'Break-Away Hotel Durban Umhlanga', 'Located in the vibrant coastal hub of Umhlanga Rocks, offering breathtaking ocean views, luxury beachfront suites, and direct access to the beach and Gateway Theatre of Shopping.', 'Corner Palm & Centenary Blvd, Umhlanga Ridge', 'Durban', -29.726600, 31.085800, 4.8, 'Check-in: 14:00. Check-out: 10:00. Non-smoking property. Valid ID required at check-in.' ), 
( 2, 'Break-Away Hotel Pretoria Loftus Park', 'A sleek 4-star modern boutique hotel integrated into the bustling Loftus Park precinct in Arcadia, right next to Loftus Versfeld Stadium with panoramic views of Pretoria.', '416 Kirkness Street, Arcadia', 'Pretoria', -25.752300, 28.222700, 4.6, 'Check-in: 15:00. Check-out: 11:00. Secure basement parking available on-site.' ), 
( 3, 'Break-Away Hotel Cape Town Waterfront', 'A luxury harborside retreat located at the Victoria & Alfred Waterfront precinct, featuring unobstructed views of Table Mountain, fine dining, and direct harbor access.', 'Portswood Road, Victoria & Alfred Waterfront', 'Cape Town', -33.906200, 18.418400, 4.9, 'Check-in: 15:00. Check-out: 11:00. Airport shuttle service available on request.' ), 
( 4, 'Break-Away Hotel Johannesburg Sandton', 'Situated directly opposite the Sandton Gautrain Station, providing high-end executive corporate suites in the heart of Africa’s premier financial district.', 'Corner West Street & Maude Street, Sandton', 'Johannesburg', -26.107600, 28.056700, 4.7, 'Check-in: 14:00. Check-out: 10:00. Express Gautrain link direct to O.R. Tambo International Airport.' ) 
ON CONFLICT (id) DO NOTHING;

-- 3. SEED ROOM TYPES & PRICING (Values in ZAR - South African Rand) 
INSERT INTO rooms (id, accommodation_id, room_type, capacity, price_per_night, is_available) VALUES 
-- Durban Umhlanga Branch Rooms 
(1, 1, 'Standard King Ocean Suite', 2, 1850.00, true), 
(2, 1, 'Executive Two-Bedroom Sea View Villa', 4, 3400.00, true), 

-- Pretoria Loftus Park Branch Rooms 
(3, 2, 'Deluxe Loftus Twin Room', 2, 1450.00, true), 
(4, 2, 'Presidential Executive Suite', 2, 2900.00, true), 

-- Cape Town Waterfront Branch Rooms 
(5, 3, 'Table Mountain View King Room', 2, 2250.00, true), 
(6, 3, 'Waterfront Family Luxury Suite', 4, 4100.00, true), 

-- Johannesburg Sandton Branch Rooms 
(7, 4, 'Executive Business Studio', 2, 1650.00, true), 
(8, 4, 'Sandton Penthouse Suite', 2, 3800.00, true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED PHOTO GALLERIES 
INSERT INTO accommodation_images (accommodation_id, image_url, is_hero) VALUES 
(1, '/images/durban-hotel.jpg', true), 
(2, '/images/pretoria-hotel.jpg', true), 
(3, 'images/cape-town-hotel.jpg', true), 
(4, '/images/sandton-hotel.jpg', true);

-- 5. LINK HOTEL AMENITIES (Junction Records) 
INSERT INTO accommodation_amenities (accommodation_id, amenity_id) VALUES
-- Break-Away Durban: Wi-Fi, Pool, Parking, AC, Breakfast, Spa 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 7),

 -- Break-Away Pretoria: Wi-Fi, Parking, AC, Breakfast, Gym, Conference 
 (2, 1), (2, 3), (2, 4), (2, 5), (2, 6), (2, 8), 
 
 -- Break-Away Cape Town: Wi-Fi, Pool, Parking, AC, Breakfast, Spa, Shuttle 
 (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 7), (3, 9), 
 
 -- Break-Away Sandton: Wi-Fi, Parking, AC, Gym, Conference, Shuttle 
 (4, 1), (4, 3), (4, 4), (4, 6), (4, 8), (4, 9);