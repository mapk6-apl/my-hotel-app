import { type Hotel } from '../store/slices/hotelSlice.js';
import { getHotelPhotoSet } from '../api/photoApi.js';

export const MASTER_SOUTH_AFRICAN_HOTELS: Hotel[] = [
  {
    id: 1,
    name: 'Protea Hotel Break-Away',
    city: 'Polokwane',
    address: '62nd Avenue, Bendor, Polokwane, 0700, South Africa',
    star_rating: 5,
    starting_price: 1800,
    description: 'Tranquil luxury suites surrounded by lush gardens, gourmet dining, executive conference facilities, and outdoor pool.',
    hero_image: getHotelPhotoSet(1).hero
  },
  {
    id: 2,
    name: 'Cape Grace Luxury Resort',
    city: 'Cape Town',
    address: 'West Quay Road, V&A Waterfront, Cape Town, 8001, South Africa',
    star_rating: 5,
    starting_price: 2400,
    description: 'Waterfront elegance overlooking Table Mountain with private marina views, luxury spa, and fine seafood dining.',
    hero_image: getHotelPhotoSet(2).hero
  },
  {
    id: 3,
    name: 'Kruger Safari Lodge',
    city: 'Kruger Park',
    address: 'Paul Kruger Gate, Skukuza, 1242, South Africa',
    star_rating: 4,
    starting_price: 3200,
    description: 'Immersive African wilderness lodge offering daily guided Big-5 game drives, boma fire pit dinners, and infinity pool.',
    hero_image: getHotelPhotoSet(3).hero
  },
  {
    id: 4,
    name: 'The Oyster Box Hotel',
    city: 'Durban',
    address: '2 Lighthouse Road, Umhlanga Rocks, Durban, 4319, South Africa',
    star_rating: 5,
    starting_price: 2100,
    description: 'Iconic seaside luxury resort located directly on the vibrant Umhlanga coastline with oceanfront terraces and spa.',
    hero_image: getHotelPhotoSet(4).hero
  },
  {
    id: 5,
    name: 'The Saxon Villa & Suites',
    city: 'Johannesburg',
    address: '36 Saxon Road, Sandhurst, Johannesburg, 2196, South Africa',
    star_rating: 5,
    starting_price: 2800,
    description: 'Exclusive Sandton sanctuary featuring private infinity pools, world-class wine cellars, and tranquil garden suites.',
    hero_image: getHotelPhotoSet(5).hero
  },
  {
    id: 6,
    name: 'Winelands Heritage Manor',
    city: 'Stellenbosch',
    address: 'Strand Road, Stellenbosch Wine Route, 7600, South Africa',
    star_rating: 4,
    starting_price: 1950,
    description: 'Historic Cape Dutch estate nestled amidst rolling vineyards with daily wine tastings and mountain views.',
    hero_image: getHotelPhotoSet(6).hero
  },
  {
    id: 7,
    name: 'Drakensberg Mountain Lodge',
    city: 'Drakensberg',
    address: 'Central Drakensberg Valley Road, Winterton, 3340, South Africa',
    star_rating: 4,
    starting_price: 1650,
    description: 'Panoramic mountain resort featuring alpine chalets, guided hiking trails, trout fishing, and cozy fireplaces.',
    hero_image: getHotelPhotoSet(7).hero
  },
  {
    id: 8,
    name: 'Pretoria Executive Club Hotel',
    city: 'Pretoria',
    address: 'Arcadia Street, Hatfield, Pretoria, 0083, South Africa',
    star_rating: 4,
    starting_price: 1750,
    description: 'Modern diplomatic capital hotel close to embassy gardens, featuring high-speed fibre, rooftop lounge, and gym.',
    hero_image: getHotelPhotoSet(8).hero
  }
];

export const getHotelById = (id: number): Hotel => {
  const found = MASTER_SOUTH_AFRICAN_HOTELS.find(h => h.id === id);
  if (found) return found;
  return MASTER_SOUTH_AFRICAN_HOTELS[0]!;
};
