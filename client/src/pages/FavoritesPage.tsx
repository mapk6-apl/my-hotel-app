import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { fetchHotels, type Hotel } from '../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
import { Heart, Compass } from 'lucide-react';
import { HotelCard } from '../components/hotel/HotelCard.js';
import '../styles/screen1.css';

export type FavoritesPageProps = {
  onOpenAuthModal: () => void;
  onSelectHotel?: (hotelId: number) => void;
};

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { hotels, favorites, loading, error } = useSelector((state: RootState) => state.hotels);

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

  const favoritedHotels = hotels.filter((hotel) => favorites.includes(hotel.id));
  const selectHotel = (id: number) => onSelectHotel ? onSelectHotel(id) : navigate(`/hotel/${id}`);

  return (
    <div className="page-container">
      <Navbar onOpenAuthModal={onOpenAuthModal} />

      <header className="hero-header" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#656839', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: '#F4F9E9', marginBottom: '0.75rem' }}>
          <Heart size={14} className="fill-red-400 text-red-400" />
          <span>YOUR SAVED STAYS</span>
        </div>
        <h1 className="hero-title">
          Saved Favorites{!loading && !error ? ` (${favoritedHotels.length})` : ''}
        </h1>
        <p className="hero-subtitle">
          Keep track of your favorite luxury hotels and suites across South Africa.
        </p>
      </header>

      <main className="main-content-layout" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '50vh' }}>
        {loading ? (
          <p role="status">Loading your saved properties…</p>
        ) : error ? (
          <div role="alert">
            <p>Your saved properties could not be loaded: {error}</p>
            <button type="button" className="btn-search-submit" onClick={() => dispatch(fetchHotels({ city: '', minPrice: '', maxPrice: '', starRating: '' }))}>
              Try again
            </button>
          </div>
        ) : favoritedHotels.length > 0 ? (
          <div className="hotel-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {favoritedHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} onViewDetails={selectHotel} />
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ backgroundColor: '#CBD0B9', padding: '3.5rem 2rem', borderRadius: '16px', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
            <Heart size={48} color="#656839" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#514B23', marginBottom: '0.5rem' }}>No Saved Favorites Yet</h3>
            <p style={{ fontSize: '0.875rem', color: '#514B23', opacity: 0.85, marginBottom: '1.5rem' }}>
              Click the heart icon on any lodging card while exploring to save your favorite hotels here!
            </p>
            <a href="/explore" className="btn-search-submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
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
