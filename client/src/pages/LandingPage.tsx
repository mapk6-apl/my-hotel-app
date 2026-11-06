import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { HotelCard } from '../components/hotel/HotelCard.js';
import { Footer } from '../components/common/Footer.js';
import { setFilters } from '../store/slices/hotelSlice.js';
import type { AppDispatch } from '../store/store.js';
import { MASTER_SOUTH_AFRICAN_HOTELS } from '../data/hotelData.js';
import { Search, MapPin, Calendar, Users, Sparkles, ShieldCheck, Award, Clock, ArrowRight } from 'lucide-react';
import '../styles/screen1.css';

export type LandingPageProps = {
  onOpenAuthModal?: () => void;
  onSelectHotel?: (hotelId: number) => void;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [cityInput, setCityInput] = useState<string>('');
  const [guestsInput, setGuestsInput] = useState<number>(2);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      dispatch(setFilters({ city: cityInput.trim() }));
    }
    window.location.href = '/explore';
  };

  const featuredHotels = MASTER_SOUTH_AFRICAN_HOTELS.slice(0, 4);

  const handleSelect = (id: number) => {
    if (onSelectHotel) {
      onSelectHotel(id);
    } else {
      window.location.href = `/hotel/${id}`;
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
            <span>SOUTH AFRICAN HOSPITALITY PORTAL</span>
          </div>

          <h1 className="hero-main-title">
            Find Your Perfect <br />
            <span className="hero-title-highlight">Break-Away Lodging</span>
          </h1>

          <p className="hero-description">
            Discover luxury hotel suites, boutique rooms, and safari resorts in South Africa.
            Compare verified guest reviews, explore local maps, and reserve your stay seamlessly.
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
                  <span className="field-value-text">Select Dates</span>
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
                    <option value={4}>4+ Guests</option>
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
            <div className="feature-pill"><ShieldCheck size={15} /><span>Best Price Guarantee</span></div>
            <div className="feature-pill"><Award size={15} /><span>Verified Properties</span></div>
            <div className="feature-pill"><Clock size={15} /><span>Instant Confirmation</span></div>
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
                Explore handpicked luxury resorts and boutique suites across South Africa.
              </p>
            </div>
            <a href="/explore" className="btn-view-all-link">
              <span>View All Properties</span>
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="featured-grid">
            {featuredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onViewDetails={handleSelect}
              />
            ))}
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
