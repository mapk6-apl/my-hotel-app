import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { HotelCard } from '../components/hotel/HotelCard.js';
import { Footer } from '../components/common/Footer.js';
import { fetchHotels, type Hotel } from '../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
import { getHotelPhotoUrl } from '../api/photoApi.js';
import { Heart, Compass } from 'lucide-react';
import '../styles/screen1.css';

export type FavoritesPageProps = {
  onOpenAuthModal: () => void;
  onSelectHotel: (hotelId: number) => void;
};

const SAMPLE_HOTELS: Hotel[] = [
  {
    id: 1,
    name: 'Protea Hotel Break-Away',
    city: 'Polokwane',
    address: '62nd Avenue, Bendor, Polokwane, 0700',
    star_rating: 5,
    starting_price: 1800,
    description: 'Tranquil luxury suites surrounded by lush gardens, fine dining, and executive amenities.',
    hero_image: getHotelPhotoUrl(1, 0),
  },
  {
    id: 2,
    name: 'Cape Grace Luxury Resort',
    city: 'Cape Town',
    address: 'West Quay Road, V&A Waterfront, Cape Town, 8001',
    star_rating: 5,
    starting_price: 2400,
    description: 'Waterfront elegance overlooking Table Mountain with private marina views.',
    hero_image: getHotelPhotoUrl(2, 0),
  },
  {
    id: 3,
    name: 'Kruger Safari Lodge',
    city: 'Kruger Park',
    address: 'Paul Kruger Gate, Skukuza, 1242',
    star_rating: 4,
    starting_price: 3200,
    description: 'Immersive African wilderness lodge offering daily guided game drives.',
    hero_image: getHotelPhotoUrl(3, 0),
  },
  {
    id: 4,
    name: 'The Oyster Box Hotel',
    city: 'Durban',
    address: 2,
    star_rating: 5,
    starting_price: 2100,
    description: 'Iconic seaside luxury resort located directly on the vibrant Umhlanga coastline.',
    hero_image: getHotelPhotoUrl(4, 0),
  } as unknown as Hotel
];

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { hotels, favorites } = useSelector((state: RootState) => state.hotels);

  useEffect(() => {
    dispatch(
      fetchHotels({
        city: '',
        minPrice: 0,
        maxPrice: 0,
        starRating: 0,
      })
    );
  }, [dispatch]);

  const allHotels = hotels && hotels.length > 0 ? hotels : SAMPLE_HOTELS;
  const favoritedHotels = allHotels.filter((hotel) => favorites.includes(hotel.id));

  return (
    <div className="page-container">
      <Navbar onOpenAuthModal={onOpenAuthModal} />

      <header className="hero-header" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#656839', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: '#F4F9E9', marginBottom: '0.75rem' }}>
          <Heart size={14} className="fill-red-400 text-red-400" />
          <span>YOUR SAVED STAYS</span>
        </div>
        <h1 className="hero-title">Saved Favorites ({favoritedHotels.length})</h1>
        <p className="hero-subtitle">
          Keep track of your favorite luxury hotels and suites across South Africa.
        </p>
      </header>

      <main className="main-content-layout" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '50vh' }}>
        {favoritedHotels.length > 0 ? (
          <div className="hotel-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {favoritedHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} onViewDetails={onSelectHotel} />
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ backgroundColor: '#CBD0B9', padding: '3.5rem 2rem', borderRadius: '16px', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
            <Heart size={48} color="#656839" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#514B23', marginBottom: '0.5rem' }}>No Saved Favorites Yet</h3>
            <p style={{ fontSize: '0.875rem', color: '#514B23', opacity: 0.85, marginBottom: '1.5rem' }}>
              Click the heart icon on any lodging card while exploring to save your favorite hotels here!
            </p>
            <a href="/" className="btn-search-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
              <Compass size={16} />
              <span>EXPLORE HOTELS</span>
            </a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
