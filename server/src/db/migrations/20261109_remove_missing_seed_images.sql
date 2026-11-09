DELETE FROM accommodation_images
WHERE source_name IS NULL
  AND image_url IN (
    '/images/durban-hotel.jpg',
    '/images/pretoria-hotel.jpg',
    '/images/cape-town-hotel.jpg',
    'images/cape-town-hotel.jpg',
    '/images/sandton-hotel.jpg'
  );
