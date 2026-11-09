import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.js';
import { HotelCard } from '../components/hotel/HotelCard.js';
import { Footer } from '../components/common/Footer.js';
import { setFilters } from '../store/slices/hotelSlice.js';
import type { AppDispatch } from '../store/store.js';
import { hotelApi } from '../api/hotelApi.js';
import type { Hotel } from '../store/slices/hotelSlice.js';
import { Search, MapPin, Calendar, Users, Sparkles, ShieldCheck, Award, Clock, ArrowRight } from 'lucide-react';
import '../styles/screen1.css';

const toDateInput = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getDateOffset = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toDateInput(date);
};

const getDateOffsetFrom = (value: string, offset: number): string => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return getDateOffset(offset);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offset);
  return toDateInput(date);
};

export type LandingPageProps = {
  onOpenAuthModal?: () => void;
  onSelectHotel?: (hotelId: number) => void;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [cityInput, setCityInput] = useState<string>('');
  const [guestsInput, setGuestsInput] = useState<number>(2);
  const [checkIn, setCheckIn] = useState(() => getDateOffset(1));
  const [checkOut, setCheckOut] = useState(() => getDateOffset(4));
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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ city: cityInput.trim() }));
    navigate('/explore', { state: { bookingSearch: { checkIn, checkOut, guests: guestsInput } } });
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
            <span>STAYS ACROSS SOUTH AFRICA</span>
          </div>

          <h1 className="hero-main-title">
            Find Your Perfect <br />
            <span className="hero-title-highlight">Break-Away Lodging</span>
          </h1>

          <p className="hero-description">
            Discover luxury hotel suites, boutique rooms, and safari resorts in South Africa.
            Explore guest reviews where available, view property locations, and save a reservation online.
          </p>

          {/* HERO SEARCH ENGINE CARD */}
          <div className="hero-search-card">
            <form onSubmit={handleHeroSearch} className="hero-search-grid">
              <div className="hero-input-field">
                <MapPin size={18} color="#656839" />
                <div className="field-content">
                  <label className="field-label">Destination</label>
                  <input
                    type="text"
                    placeholder="e.g. Polokwane, Cape Town..."
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="field-input"
                  />
                </div>
              </div>

              <div className="hero-input-field">
                <Calendar size={18} color="#656839" />
                <div className="field-content">
                  <label className="field-label">Travel Dates</label>
                  <div className="hero-date-inputs">
                    <input aria-label="Check-in date" type="date" min={getDateOffset(0)} value={checkIn} onChange={(event) => {
                      setCheckIn(event.target.value);
                      if (event.target.value >= checkOut) setCheckOut(getDateOffsetFrom(event.target.value, 1));
                    }} />
                    <input aria-label="Check-out date" type="date" min={getDateOffsetFrom(checkIn, 1)} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
                  </div>
                </div>
              </div>

              <div className="hero-input-field">
                <Users size={18} color="#656839" />
                <div className="field-content">
                  <label className="field-label">Travelers</label>
                  <select
                    value={guestsInput}
                    onChange={(e) => setGuestsInput(Number(e.target.value))}
                    className="field-select"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="hero-search-button">
                <Search size={18} />
                <span>EXPLORE STAYS</span>
              </button>
            </form>
          </div>

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
              <h2 className="featured-title">Top Featured Lodgings</h2>
              <p className="featured-subtitle">
                A selection from current property listings, ordered by property star rating.
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
          <h2>Ready to explore luxury stays across South Africa?</h2>
          <p>Filter by price, location, and star rating in our dedicated Explore portal.</p>
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
