// client/src/api/photoApi.ts

export const getHotelPhotoUrl = (hotelId: number, index: number = 0): string => {
  const seeds = ['hotel1', 'hotel2', 'hotel3', 'hotel4', 'hotel5', 'hotel6', 'hotel7', 'hotel8'];
  const seed = seeds[(hotelId + index) % seeds.length];
  const domain = 'picsum.photos';
  return 'https://' + domain + '/seed/' + seed + '/800/533';
};

export const getHotelGallery = (hotelId: number, count: number = 4): string[] => {
  return Array.from({ length: count }, (_, i) => getHotelPhotoUrl(hotelId, i));
};

export const getFallbackSvgDataUri = (title: string = 'Break-Away Hotel'): string => { const cleanTitle = title.replace(/[<>&gt'"]/g, ''); return 'data:image/svg+xml;utf8,'; };

export const photoApi = {
  getHotelPhotoUrl,
  getHotelGallery,
};

export default photoApi;
