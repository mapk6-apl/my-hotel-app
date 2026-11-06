export interface HotelPhotoSet {
  hero: string;
  gallery: string[];
}

const DOMAIN = 'images.' + 'unsplash' + '.com';
const BASE_URL = 'https://' + DOMAIN + '/';

const RAW_PHOTO_IDS: Record<number, string[]> = {
  1: ['photo-1566073771259-6a8506099945', 'photo-1582719478250-c89cae4dc85b', 'photo-1618773928121-c32242e63f39', 'photo-1590490360182-c33d57733427', 'photo-1584132967334-10e028bd69f7'],
  2: ['photo-1571003123894-1f0594d2b5d9', 'photo-1540555700478-4be289fbecef', 'photo-1571896349842-33c89424de2d', 'photo-1520250497591-112f2f40a3f4', 'photo-1564501049412-61c2a3083791'],
  3: ['photo-1549294413-26f195200c16', 'photo-1596394516093-501ba68a0ba6', 'photo-1522771739844-6a9f6d5f14af', 'photo-1578683010236-d716f9a3f461', 'photo-1591088398332-8a7791972843'],
  4: ['photo-1566665797739-1674de7a421a', 'photo-1578683010236-d716f9a3f461', 'photo-1582719508461-905c673771fd', 'photo-1595576508898-0ad5c879a061', 'photo-1507652313519-d4e9174996dd'],
  5: ['photo-1542314831-068cd1dbfeeb', 'photo-1611892440504-42a792e24d32', 'photo-1590490360182-c33d57733427', 'photo-1584132967334-10e028bd69f7', 'photo-1631049307264-da0ec9d70304'],
  6: ['photo-1512917774080-9991f1c4c750', 'photo-1613977257363-707ba9348227', 'photo-1600585154340-be6161a56a0c', 'photo-1600596542815-ffad4c1539a9', 'photo-1600607687939-ce8a6c25118c'],
  7: ['photo-1520250497591-112f2f40a3f4', 'photo-1571003123894-1f0594d2b5d9', 'photo-1582719478250-c89cae4dc85b', 'photo-1540555700478-4be289fbecef', 'photo-1596394516093-501ba68a0ba6'],
  8: ['photo-1564501049412-61c2a3083791', 'photo-1578683010236-d716f9a3f461', 'photo-1591088398332-8a7791972843', 'photo-1522771739844-6a9f6d5f14af', 'photo-1582719508461-905c673771fd']
};

export const getHotelPhotoSet = (hotelId: number = 1): HotelPhotoSet => {
  const keys = Object.keys(RAW_PHOTO_IDS).map(Number);
  const targetKey = RAW_PHOTO_IDS[hotelId] ? hotelId : keys[(hotelId - 1) % keys.length] || 1;
  const ids = RAW_PHOTO_IDS[targetKey] ?? RAW_PHOTO_IDS[1]!;
  const gallery = ids.map(id => BASE_URL + id + '?auto=format&fit=crop&w=800&q=80');
  return { hero: gallery[0]!, gallery };
};

export const getHotelPhotoUrl = (hotelId: number = 1, index: number = 0): string => {
  const set = getHotelPhotoSet(hotelId);
  return set.gallery[index % set.gallery.length] || set.hero;
};

export const getHotelGallery = (hotelId: number = 1, count: number = 5): string[] => {
  const set = getHotelPhotoSet(hotelId);
  return set.gallery.slice(0, count);
};

export const getFallbackSvgDataUri = (title: string = 'Break-Away Hotel'): string => {
  const cleanTitle = title.replace(/[<>&'"]/g, '');
  return 'data:image/svg+xml;utf8,<svg width="800" height="533"><rect width="800" height="533" fill="%23CBD0B9"/><text x="400" y="270" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23514B23">' + cleanTitle + '</text></svg>';
};

export const photoApi = {
  getHotelPhotoSet,
  getHotelPhotoUrl,
  getHotelGallery,
  getFallbackSvgDataUri
};

export default photoApi;
