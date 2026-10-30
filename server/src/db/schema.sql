--Drop existing tables in reverse dependency order so i can safely re-run this script during development without conflicts
DROP TABLE IF EXISTS favourites CASCADE; 
DROP TABLE IF EXISTS reviews CASCADE; 
DROP TABLE IF EXISTS reservations CASCADE; 
DROP TABLE IF EXISTS accommodation_amenities CASCADE; 
DROP TABLE IF EXISTS amenities CASCADE; 
DROP TABLE IF EXISTS accommodation_images CASCADE; 
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS accommodations CASCADE; 
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE - Stores guest and admin profiles authenticated via OAuth.
CREATE TABLE users (
id SERIAL PRIMARY KEY, -- auto-incrementing unique user ID 
oauth_provider VARCHAR(50) NOT NULL, -- Authentication provider ('google', etc.) 
oauth_id VARCHAR(255) UNIQUE NOT NULL, -- unique ID returned by OAuth provider 
email VARCHAR(255) UNIQUE NOT NULL, -- user email address 
full_name VARCHAR(255) NOT NULL, -- user's full display name 
avatar_url TEXT, -- Profile picture URL from OAuth 
role VARCHAR(20) DEFAULT 'guest', -- Role-Based Access Control: 'guest' or 'admin' 
phone VARCHAR(50), -- Optional contact phone number 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Account creation timestamp 
);

-- 2. ACCOMMODATIONS TABLE - Primary table for hotel properties, geographic coordinates, and policies.
CREATE TABLE accommodations (
id SERIAL PRIMARY KEY, -- auto-incrementing accommodation ID 
name VARCHAR(255) NOT NULL, -- hotel property title 
description TEXT NOT NULL, -- comprehensive property write-up 
address VARCHAR(255) NOT NULL, -- street address 
city VARCHAR(100) NOT NULL, -- City name (used for location filtering) 
latitude DECIMAL(9, 6), -- geographic latitude for embedded map 
longitude DECIMAL(9, 6), -- geographic longitude for embedded map 
star_rating DECIMAL(2, 1) DEFAULT 0.0, -- Calculated rating average (e.g., 4.8) 
policies TEXT, -- House rules, check-in/out guidelines 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Property creation date 
);

-- 3. ROOMS TABLE - Defines individual room types, pricing, and guest capacity per accommodation.
CREATE TABLE rooms (
id SERIAL PRIMARY KEY, -- unique room type ID 
accommodation_id INT REFERENCES accommodations(id) ON DELETE CASCADE, -- Foreign key linking to parent property 
room_type VARCHAR(100) NOT NULL, -- e.g., 'Deluxe Ocean View Suite' 
capacity INT NOT NULL, -- maximum guest capacity per room 
price_per_night DECIMAL(10, 2) NOT NULL, -- nightly rate in ZAR 
is_available BOOLEAN DEFAULT TRUE, -- availability toggle for admin controls 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- 4. ACCOMMODATION_IMAGES TABLE - Stores gallery images for property listing pages and hero banners.
CREATE TABLE accommodation_images (
id SERIAL PRIMARY KEY, 
accommodation_id INT REFERENCES accommodations(id) ON DELETE CASCADE, 
image_url TEXT NOT NULL, -- CDN/Storage URL for the image 
is_hero BOOLEAN DEFAULT FALSE -- flag to identify main thumbnail image 
);

-- 5. AMENITIES & JUNCTION TABLE - Normalizes hotel facilities (e.g., Wi-Fi, Pool, Parking) to prevent redundancy.
CREATE TABLE amenities (
id SERIAL PRIMARY KEY, 
name VARCHAR(100) UNIQUE NOT NULL -- e.g., 'Free Wi-Fi', 'Swimming Pool' 
); 

-- Junction table for Many-to-Many relationship between Accommodations and Amenities 
CREATE TABLE accommodation_amenities (
accommodation_id INT REFERENCES accommodations(id) ON DELETE CASCADE, 
amenity_id INT REFERENCES amenities(id) ON DELETE CASCADE, 
PRIMARY KEY (accommodation_id, amenity_id) -- Composite Primary Key 
);

-- 6. RESERVATIONS TABLE - Tracks guest stay dates, total payment amounts, and administrative statuses.
CREATE TABLE reservations (
id SERIAL PRIMARY KEY, 
user_id INT REFERENCES users(id) ON DELETE CASCADE, -- foreign key linking to guest 
room_id INT REFERENCES rooms(id) ON DELETE RESTRICT, -- Foreign key linking to booked room 
check_in DATE NOT NULL, -- Stay start date 
check_out DATE NOT NULL, -- Stay end date 
guest_count INT NOT NULL, -- number of guests for the stay 
total_amount DECIMAL(10, 2) NOT NULL, -- calculated total price (rate * nights + fees) 
payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed' 
status VARCHAR(50) DEFAULT 'pending', -- Admin status: 'pending', 'approved', 'cancelled' 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- 7. REVIEWS TABLE - Stores star ratings (1 to 5) and written feedback submitted by verified guests.
CREATE TABLE reviews (
id SERIAL PRIMARY KEY, 
user_id INT REFERENCES users(id) ON DELETE CASCADE, 
accommodation_id INT REFERENCES accommodations(id) ON DELETE CASCADE, 
rating INT CHECK (rating >= 1 AND rating <= 5), -- constrains rating between 1 and 5 
comment TEXT, -- Written guest feedback 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- 8. FAVOURITES TABLE - Junction table tracking user saved/bookmarked hotel properties.
CREATE TABLE favourites (
user_id INT REFERENCES users(id) ON DELETE CASCADE, 
accommodation_id INT REFERENCES accommodations(id) ON DELETE CASCADE, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
PRIMARY KEY (user_id, accommodation_id) -- Composite key prevents duplicate saves 
);