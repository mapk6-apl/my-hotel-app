import { pool } from '../config/db.js';

const demoBranches = [
  {
    name: 'Break-Away Hotel Polokwane Central',
    description: 'A central city stay with comfortable rooms, convenient business access, and easy connections to Polokwane attractions.',
    address: '37 Marshall Street, Polokwane Central',
    city: 'Polokwane',
    latitude: -23.9045,
    longitude: 29.4689,
    starRating: 4.5,
    rooms: [
      { type: 'Central King Room', capacity: 2, price: 1690 },
      { type: 'Family City Suite', capacity: 4, price: 2790 },
    ],
    amenities: ['Free High-Speed Wi-Fi', 'Secure On-Site Parking', 'Air Conditioning', 'Buffet Breakfast Included', 'Fitness Center / Gym'],
  },
  {
    name: 'Break-Away Hotel Mbombela Riverside',
    description: 'A relaxed Lowveld base near Mbombela city amenities and regional routes to the Panorama and Kruger areas.',
    address: '20 Government Boulevard, Riverside Park, Mbombela',
    city: 'Mbombela',
    latitude: -25.4658,
    longitude: 30.9853,
    starRating: 4.6,
    rooms: [
      { type: 'Riverside King Room', capacity: 2, price: 1780 },
      { type: 'Lowveld Family Suite', capacity: 4, price: 2980 },
    ],
    amenities: ['Free High-Speed Wi-Fi', 'Outdoor Swimming Pool', 'Secure On-Site Parking', 'Air Conditioning', 'Buffet Breakfast Included'],
  },
  {
    name: 'Break-Away Hotel Gqeberha Boardwalk',
    description: 'A coastal city stay close to the Summerstrand beachfront, local dining, and Gqeberha attractions.',
    address: 'Marine Drive, Summerstrand, Gqeberha',
    city: 'Gqeberha',
    latitude: -33.9782,
    longitude: 25.6524,
    starRating: 4.4,
    rooms: [
      { type: 'Boardwalk King Room', capacity: 2, price: 1940 },
      { type: 'Oceanfront Family Suite', capacity: 4, price: 3290 },
    ],
    amenities: ['Free High-Speed Wi-Fi', 'Outdoor Swimming Pool', 'Secure On-Site Parking', 'Air Conditioning', 'Buffet Breakfast Included'],
  },
  {
    name: 'Break-Away Hotel Stellenbosch Winelands',
    description: 'A Winelands city base with historic streets, nearby vineyards, and comfortable rooms for leisure and business stays.',
    address: 'Dorp Street, Stellenbosch Central',
    city: 'Stellenbosch',
    latitude: -33.9367,
    longitude: 18.8614,
    starRating: 4.7,
    rooms: [
      { type: 'Winelands King Room', capacity: 2, price: 2180 },
      { type: 'Vineyard Family Suite', capacity: 4, price: 3580 },
    ],
    amenities: ['Free High-Speed Wi-Fi', 'Secure On-Site Parking', 'Air Conditioning', 'Buffet Breakfast Included', 'Full-Service Spa &amp; Wellness'],
  },
];

const run = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE accommodations, rooms, accommodation_amenities IN SHARE ROW EXCLUSIVE MODE');
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('accommodations', 'id'),
        GREATEST(COALESCE((SELECT MAX(id) FROM accommodations), 0), (SELECT last_value FROM accommodations_id_seq)),
        true
      )
    `);
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('rooms', 'id'),
        GREATEST(COALESCE((SELECT MAX(id) FROM rooms), 0), (SELECT last_value FROM rooms_id_seq)),
        true
      )
    `);

    for (const branch of demoBranches) {
      const existing = await client.query(
        'SELECT id FROM accommodations WHERE LOWER(name) = LOWER($1) AND LOWER(city) = LOWER($2) LIMIT 1',
        [branch.name, branch.city]
      );
      if (existing.rows.length > 0) continue;

      const property = await client.query<{ id: number }>(
        `INSERT INTO accommodations (name, description, address, city, latitude, longitude, star_rating)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [branch.name, branch.description, branch.address, branch.city, branch.latitude, branch.longitude, branch.starRating]
      );
      const propertyId = property.rows[0]?.id;
      if (!propertyId) throw new Error(`Failed to insert ${branch.name}.`);

      for (const room of branch.rooms) {
        await client.query(
          `INSERT INTO rooms (accommodation_id, room_type, capacity, price_per_night, is_available)
           VALUES ($1, $2, $3, $4, true)`,
          [propertyId, room.type, room.capacity, room.price]
        );
      }

      for (const amenityName of branch.amenities) {
        const amenity = await client.query<{ id: number }>(
          'SELECT id FROM amenities WHERE name = $1',
          [amenityName]
        );
        const amenityId = amenity.rows[0]?.id;
        if (!amenityId) throw new Error(`Required amenity is not seeded: ${amenityName}.`);
        await client.query(
          `INSERT INTO accommodation_amenities (accommodation_id, amenity_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [propertyId, amenityId]
        );
      }
    }

    await client.query(
      `UPDATE accommodation_images
       SET image_url = '/images/cape-town-hotel.jpg'
       WHERE image_url = 'https://localhost:5001'
         AND accommodation_id = (
           SELECT id FROM accommodations
           WHERE name = 'Break-Away Hotel Cape Town Waterfront'
           ORDER BY id ASC LIMIT 1
         )`
    );
    await client.query('COMMIT');
    console.log('Demo branch records are ready.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Unable to add demo branches:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

void run();
