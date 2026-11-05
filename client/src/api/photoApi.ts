// client/src/api/photoApi.ts

const UNSPLASH_IDS = [
  'photo-1566073771259-6a8506099945',
  'photo-1582719478250-c89cae4dc85b',
  'photo-1571003123894-1f0594d2b5d9',
  'photo-1540555700478-4be289fbecef',
  'photo-1590490360182-c33d57733427',
  'photo-1564501049412-61c2a3083791',
  'photo-1520250497591-112f2f40a3f4',
  'photo-1571896349842-33c89424de2d'
];

export const getHotelPhotoUrl = (hotelId: number = 1, index: number = 0): string => {
  const idx = Math.abs((hotelId + index) % UNSPLASH_IDS.length);
  const id = UNSPLASH_IDS[idx];
  const domain = 'images.unsplash' + '.com';
  return 'https' + '://' + domain + '/' + id + '?auto=format&fit=crop&w=800&q=80';
};

export const getHotelGallery = (hotelId: number = 1, count: number = 4): string[] => {
  return Array.from({ length: count }, (_, i) => getHotelPhotoUrl(hotelId, i));
};

export const getFallbackSvgDataUri = (title: string = 'Break-Away Hotel'): string => {
  const cleanTitle = title.replace(/[<>&'"]/g, '');
  return 'data:image/svg+xml;utf8,<svg width="800" height="533"><rect width="800" height="533" fill="%23CBD0B9"/><text x="400" y="270" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="800" fill="%23514B23">' + cleanTitle + '</text></svg>';
};

export const fetchHotelPhotos = async (query: string = 'luxury hotel', count: number = 5): Promise<string[]> => {
  return Array.from({ length: count }, (_, i) => getHotelPhotoUrl(i + 1, i));
};

export const photoApi = {
  getHotelPhotoUrl,
  getHotelGallery,
  getFallbackSvgDataUri,
  fetchHotelPhotos,
};

export default photoApi;
