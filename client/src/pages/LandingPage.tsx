// client/src/pages/LandingPage.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { SearchFilterBar } from '../components/hotel/SearchFilterBar.js';
import { HotelGrid } from '../components/hotel/HotelGrid.js';
import { HotelCard } from '../components/hotel/HotelCard.js';
import { Footer } from '../components/common/Footer.js';
import { fetchHotels, setFilters, type Hotel } from '../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
import { getHotelPhotoUrl } from '../api/photoApi.js';
import { Search, MapPin, Calendar, Users, Sparkles, Compass, ShieldCheck, Award, Clock } from 'lucide-react';
import '../styles/screen1.css';

export type LandingPageProps = {
  onOpenAuthModal: () => void;
  onSelectHotel: (hotelId: number) => void;
};

// Curated South African hotels displayed below the hero header on the landing page
const FEATURED_PROPERTIES: Hotel[] = [
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
    address: 'Paul Kruger Gate, Skukuza, Kruger National Park, 1350',
    star_rating: 4,
    starting_price: 3200,
    description: 'Immersive African wilderness lodge offering daily guided game drives.',
    hero_image: getHotelPhotoUrl(3, 0),
  },
  {
    id: 4,
    name: 'The Oyster Box Hotel',
    city: 'Durban',
    address: '2 Lighthouse Road, Umhlanga Rocks, Durban, 4320',
    star_rating: 5,
    starting_price: 2100,
    description: 'Iconic seaside luxury resort located directly on the vibrant Umhlanga coastline.',
    hero_image: getHotelPhotoUrl(4, 0),
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Read backend hotels, loading state, and active filters from Redux
  const { hotels, loading, filters } = useSelector((state: RootState) => state.hotels);

  // Local state for Hero Search Form inputs
  const [cityInput, setCityInput] = useState<string>('');
  const [guestsInput, setGuestsInput] = useState<number>(2);

  // Initial load: fetch hotel listings from database
  useEffect(() => {
    dispatch(fetchHotels(filters));
  }, [dispatch, filters]);

  // Handle "EXPLORE STAYS" click: dispatches filters and smoothly scrolls down to Explore Grid
  const handleExploreStays = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      dispatch(setFilters({ city: cityInput.trim() }));
    }
    const exploreSection = document.getElementById('explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayGridHotels = hotels && hotels.length > 0 ? hotels : FEATURED_PROPERTIES;

  return (
    <div className="page-container">
      {/* 1. TOP HEADER NAVBAR */}
      <Navbar onOpenAuthModal={onOpenAuthModal} />

      {/* 2. DEDICATED HERO SECTION (FIRST VIEW ON WEBSITE OPENING) */}
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
            Discover luxury hotel suites, boutique rooms, and holiday resorts in South Africa. 
            Compare verified guest ratings, explore interactive maps, and book your stay seamlessly.
          </p>

          {/* HERO SEARCH ENGINE CARD */}
          <div className="hero-search-card">
            <form onSubmit={handleExploreStays} className="hero-search-grid">
              
              {/* Destination City Input */}
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

              {/* Check-In / Check-Out Date Display */}
              <div className="hero-input-field">
                <Calendar size={18} color="#656839" />
                <div className="field-content">
                  <label className="field-label">Travel Dates</label>
                  <span className="field-value-text">Select Dates</span>
                </div>
              </div>

              {/* Guests Count Selector */}
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

              {/* EXPLORE STAYS CTA BUTTON */}
              <button type="submit" className="hero-search-button">
                <Search size={18} />
                <span>EXPLORE STAYS</span>
              </button>

            </form>
          </div>

          {/* VALUE PROPOSITION BADGES */}
          <div className="hero-features-bar">
            <div className="feature-pill">
              <ShieldCheck size={15} />
              <span>Best Price Guarantee</span>
            </div>
            <div className="feature-pill">
              <Award size={15} />
              <span>Verified Properties</span>
            </div>
            <div className="feature-pill">
              <Clock size={15} />
              <span>Instant Confirmation</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURED HOTELS PREVIEW SECTION (BELOW HERO ON LANDING PAGE) */}
      <section className="featured-section">
        <div className="featured-container">
          <div className="section-header-block">
            <h2 className="featured-title">Top Featured Lodgings</h2>
            <p className="featured-subtitle">
              Explore our handpicked luxury resorts and hotel suites across popular destinations.
            </p>
          </div>

          <div className="featured-grid">
            {FEATURED_PROPERTIES.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onViewDetails={onSelectHotel}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROTOTYPE SCREEN 1 EXPLORE WORKSPACE (SCROLLED TO VIA 'EXPLORE STAYS') */}
      <main id="explore" className="main-content-layout">
        <SearchFilterBar />

        <section className="listings-section">
          <div className="listings-header">
            <div className="listings-title-group">
              <Compass size={20} color="#656839" />
              <h2 className="section-title">
                Available Accommodations ({displayGridHotels.length})
              </h2>
            </div>
          </div>

          <HotelGrid
            hotels={displayGridHotels}
            loading={loading}
            onSelectHotel={onSelectHotel}
          />
        </section>
      </main>

      {/* 5. FOOTER */}
      <Footer />
    </div>
  );
};
