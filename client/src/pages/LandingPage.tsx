import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { SearchFilterBar } from '../components/hotel/SearchFilterBar.js';
import { HotelGrid } from '../components/hotel/HotelGrid.js';
import { Footer } from '../components/common/Footer.js';
import { fetchHotels, setFilters } from '../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
import { Search, MapPin, Calendar, Users, Sparkles, Compass, ShieldCheck, Award, Clock } from 'lucide-react';
import '../styles/screen1.css';

export type LandingPageProps = {
  onOpenAuthModal: () => void;
  onSelectHotel: (hotelId: number) => void;
};

//LandingPage Component (Screen 1 Main Entry); Displays a dedicated Hero landing view at the top, followed by interactive search, filtering, and live API property listings.
export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Extract live property data, loading state, and active filters directly from Redux
  const { hotels, loading, filters } = useSelector((state: RootState) => state.hotels);

  // Local state for Hero Search inputs
  const [cityInput, setCityInput] = useState<string>('');
  const [guestsInput, setGuestsInput] = useState<number>(2);

  // Fetch properties from backend API when component mounts or filters change
  useEffect(() => {
    dispatch(fetchHotels(filters));
  }, [dispatch, filters]);

  // Handle Hero Search submit: dispatches filter update to Redux & scrolls to explore grid
  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      dispatch(setFilters({ city: cityInput.trim() }));
    }
    const exploreSection = document.getElementById('explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="page-container">
      {/* 1. TOP NAVIGATION HEADER */}
      <Navbar onOpenAuthModal={onOpenAuthModal} />

      {/* 2. DEDICATED HERO LANDING SECTION (FIRST VIEW FOR VISITORS) */}
      <section className="hero-section">
        <div className="hero-content-wrapper">
          
          <div className="hero-badge">
            <Sparkles size={14} className="badge-icon" />
            <span>EXCLUSIVE SOUTH AFRICAN STAYS</span>
          </div>

          <h1 className="hero-main-title">
            Find Your Perfect <br />
            <span className="hero-title-highlight">Break-Away Lodging</span>
          </h1>

          <p className="hero-description">
            Discover luxury hotel suites, boutique rooms, and safari resorts. 
            Compare verified guest reviews, explore local maps, and reserve your stay seamlessly.
          </p>

          {/* HERO SEARCH ENGINE PANEL */}
          <div className="hero-search-card">
            <form onSubmit={handleHeroSearch} className="hero-search-grid">
              
              {/* Destination City Input */}
              <div className="hero-input-field">
                <MapPin size={18} className="field-icon" />
                <div className="field-content">
                  <label className="field-label">Destination</label>
                  <input
                    type="text"
                    placeholder="e.g. Polokwane, Cape Town"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    className="field-input"
                  />
                </div>
              </div>

              {/* Date Selector Display */}
              <div className="hero-input-field">
                <Calendar size={18} className="field-icon" />
                <div className="field-content">
                  <label className="field-label">Check-In / Out</label>
                  <span className="field-value-text">Select Dates</span>
                </div>
              </div>

              {/* Guest Count Selector */}
              <div className="hero-input-field">
                <Users size={18} className="field-icon" />
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

              {/* Search Submit CTA Button */}
              <button type="submit" className="hero-search-button">
                <Search size={18} />
                <span>EXPLORE STAYS</span>
              </button>

            </form>
          </div>

          {/* VALUE PROPOSITION BADGES */}
          <div className="hero-features-bar">
            <div className="feature-pill">
              <ShieldCheck size={16} />
              <span>Best Price Guarantee</span>
            </div>
            <div className="feature-pill">
              <Award size={16} />
              <span>Verified Properties</span>
            </div>
            <div className="feature-pill">
              <Clock size={16} />
              <span>Instant Confirmation</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. MAIN ACCOMMODATIONS WORKSPACE (FILTER SIDEBAR & LIVE API HOTEL GRID) */}
      <main id="explore" className="main-content-layout">
        {/* Left Column: Search & Filter Sidebar */}
        <SearchFilterBar />

        {/* Right Column: Dynamic Hotel Listings from API */}
        <section className="listings-section">
          <div className="listings-header">
            <div className="listings-title-group">
              <Compass size={20} className="listings-icon" />
              <h2 className="section-title">
                Available Accommodations ({hotels ? hotels.length : 0})
              </h2>
            </div>
          </div>

          {/* Live Hotel Grid Component connected to Redux API state */}
          <HotelGrid
            hotels={hotels}
            loading={loading}
            onSelectHotel={onSelectHotel}
          />
        </section>
      </main>

      {/* 4. FOOTER */}
      <Footer />
    </div>
  );
};
