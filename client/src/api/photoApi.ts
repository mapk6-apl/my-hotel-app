//Helper to fetch dynamic hotel photos from external API or return local fallback asset paths.

const FALLBACK_HOTEL_PHOTOS = [
  '/assets/hotel-hero.jpg',
  '/assets/hotel-room-1.jpg',
  '/assets/hotel-room-2.jpg',
  '/assets/hotel-pool.jpg',
  '/assets/hotel-lounge.jpg',
];

export const fetchHotelPhotos = async (query: string = 'luxury hotel', count: number = 5): Promise<string[]> => {
  const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
  const PHOTO_API_URL = env.VITE_PHOTO_API_URL;
  const ACCESS_KEY = env.VITE_UNSPLASH_ACCESS_KEY;

  if (PHOTO_API_URL && ACCESS_KEY) {
    try {
      const response = await fetch(
        `${PHOTO_API_URL}?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${ACCESS_KEY}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results.map((item: { urls: { regular: string } }) => item.urls.regular);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch photos from API, using fallback assets:', error);
    }
  }

  return FALLBACK_HOTEL_PHOTOS.slice(0, count);
};
