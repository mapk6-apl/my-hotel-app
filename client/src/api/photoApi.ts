const PHOTO_SEEDS = [
  'hotel-pool-resort',
  'luxury-bedroom-suite',
  'heritage-hotel-manor',
  'coastal-boutique-villa',
  'beach-lounge-hotel',
  'modern-hotel-room',
  'safari-lodge-pool',
  'grand-hotel-exterior'
];

export const getHotelPhotoUrl = (hotelId: number = 1, index: number = 0): string => {
  const seedIndex = Math.abs((hotelId + index) % PHOTO_SEEDS.length);
  const seed = PHOTO_SEEDS[seedIndex];
  const host = ['picsum', 'photos'].join('.');
  return 'https://' + host + '/seed/' + seed + '/800/533';
};

export const getHotelGallery = (hotelId: number = 1, count: number = 4): string[] => {
  return Array.from({ length: count }, (_, i) => getHotelPhotoUrl(hotelId, i));
};

export const getFallbackSvgDataUri = (title: string = 'Break-Away Hotel'): string => {
  const cleanTitle = title.replace(/[<>&'"]/g, '');
  return 'data:image/svg+xml;utf8,<svg width="800" height="533" viewBox="0 0 800 533"><rect width="800" height="533" fill="%23CBD0B9"/><g transform="translate(400,240)" text-anchor="middle"><text y="70" font-family="sans-serif" font-size="22" font-weight="800" fill="%23514B23">' + cleanTitle + '</text></g></svg>';
};

export const photoApi = {
  getHotelPhotoUrl,
  getHotelGallery,
  getFallbackSvgDataUri,
};

export default photoApi;
