import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.js';
import { HotelCard } from '../components/hotel/HotelCard.js';
import { Footer } from '../components/common/Footer.js';
import { SearchBar, type BookingSearch } from '../components/hotel/SearchBar.js';
import { setFilters } from '../store/slices/hotelSlice.js';
import type { AppDispatch } from '../store/store.js';
import { hotelApi } from '../api/hotelApi.js';
import type { Hotel } from '../store/slices/hotelSlice.js';
import { Sparkles, ShieldCheck, Award, Clock, ArrowRight } from 'lucide-react';
import '../styles/screen1.css';

export type LandingPageProps = {
  onOpenAuthModal?: () => void;
  onSelectHotel?: (hotelId: number) => void;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const loadFeaturedHotels = useCallback(async () => {
    setFeaturedLoading(true);
    setFeaturedError(null);
    try {
      const response = await hotelApi.getHotels();
      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error('The server returned an invalid property list.');
      }
      setFeaturedHotels(response.data.slice(0, 6));
    } catch (error: unknown) {
      setFeaturedError(error instanceof Error ? error.message : 'Unable to load featured properties.');
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeaturedHotels();
  }, [loadFeaturedHotels]);

  const handleHeroSearch = (search: BookingSearch) => {
    dispatch(setFilters({ city: search.city }));
    navigate('/explore', { state: { bookingSearch: search } });
  };

  const handleSelect = (id: number) => {
    if (onSelectHotel) {
      onSelectHotel(id);
    } else {
      navigate(`/hotel/${id}`);
    }
  };

  return (
    <div className="page-container">
      <Navbar {...(onOpenAuthModal ? { onOpenAuthModal } : {})} />

      {/* 1. STANDALONE LANDING HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-badge">
            <Sparkles size={14} className="badge-icon" />
            <span>Break-Away Hotels</span>
          </div>

          <h1 className="hero-main-title">
            Find Your Perfect <br />
            <span className="hero-title-highlight">Break-Away Lodging</span>
          </h1>

          <p className="hero-description">
            Find a room, check its details and rates, and make a reservation.
          </p>

          {/* HERO SEARCH ENGINE CARD */}
          <SearchBar onSearch={handleHeroSearch} />

          {/* VALUE PROPOSITION BADGES */}
          <div className="hero-features-bar">
            <div className="feature-pill"><ShieldCheck size={15} /><span>Secure account access</span></div>
            <div className="feature-pill"><Award size={15} /><span>Property details and room rates</span></div>
            <div className="feature-pill"><Clock size={15} /><span>Reservation status shown clearly</span></div>
          </div>
        </div>
      </section>

      {/* 2. TOP FEATURED LODGINGS PREVIEW */}
      <section className="featured-section">
        <div className="featured-container">
          <div className="section-header-block">
            <div>
              <h2 className="featured-title">Featured properties</h2>
              <p className="featured-subtitle">
                Six properties from the current catalogue.
              </p>
            </div>
            <a href="/explore" className="btn-view-all-link">
              <span>View All Properties</span>
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="featured-grid featured-hotel-grid">
            {featuredLoading ? (
              <p role="status">Loading featured properties…</p>
            ) : featuredError ? (
              <div role="alert">
                <p>Featured properties could not be loaded: {featuredError}</p>
                <button type="button" className="btn-view-all-link" onClick={() => void loadFeaturedHotels()}>
                  Try again
                </button>
              </div>
            ) : featuredHotels.length === 0 ? (
              <p>No properties are currently available.</p>
            ) : (
              featuredHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onViewDetails={handleSelect}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. CALL TO ACTION BANNER */}
      <section className="cta-banner-section">
        <div className="cta-banner-content">
          <h2>Find a place for your next stay</h2>
          <p>Browse the full property catalogue and compare room rates.</p>
          <a href="/explore" className="btn-cta-explore">
            <span>EXPLORE ALL HOTELS</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};
