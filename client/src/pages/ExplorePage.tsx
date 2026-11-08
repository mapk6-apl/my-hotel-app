import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.js';
import { SearchFilterBar } from '../components/hotel/SearchFilterBar.js';
import { HotelGrid } from '../components/hotel/HotelGrid.js';
import { Footer } from '../components/common/Footer.js';
import { fetchHotels } from '../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
import { Compass, Search } from 'lucide-react';
import { setFilters } from '../store/slices/hotelSlice.js';
import '../styles/screen1.css';

export type ExplorePageProps = {
  onOpenAuthModal?: () => void;
  onSelectHotel?: (hotelId: number) => void;
};

export const ExplorePage: React.FC<ExplorePageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { hotels, loading, error, filters } = useSelector((state: RootState) => state.hotels);
  const [cityInput, setCityInput] = useState(filters.city);
  const searchDetails = (location.state as { bookingSearch?: { checkIn: string; checkOut: string; guests: number } } | null)?.bookingSearch;

  useEffect(() => {
    dispatch(fetchHotels(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    setCityInput(filters.city);
  }, [filters.city]);

  const handleSelect = (id: number) => {
    if (onSelectHotel) {
      onSelectHotel(id);
    } else {
      navigate(`/hotel/${id}`, { state: searchDetails ? { bookingSearch: searchDetails } : undefined });
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(setFilters({ city: cityInput.trim() }));
  };

  return (
    <div className="page-container">
      <Navbar {...(onOpenAuthModal ? { onOpenAuthModal } : {})} />

      {/* DEDICATED EXPLORE HEADER BANNER */}
      <header className="explore-header-banner">
        <div className="explore-header-content">
          <div className="explore-badge">
            <Compass size={14} />
            <span>EXPLORE LODGING PORTAL</span>
          </div>
          <h1 className="explore-main-title">Explore Accommodations</h1>
          <p className="explore-sub-title">
            Browse our full catalog of luxury hotels, safari lodges, and waterfront resorts in South Africa.
          </p>
        </div>
      </header>

      <form onSubmit={handleSearch} className="explore-search-bar" role="search">
        <label className="sr-only" htmlFor="explore-destination">Destination or city</label>
        <Search size={18} aria-hidden="true" />
        <input
          id="explore-destination"
          value={cityInput}
          onChange={(event) => setCityInput(event.target.value)}
          placeholder="Search destination or city"
        />
        <button type="submit" className="btn-search-submit">Search</button>
      </form>

      {/* WORKSPACE LAYOUT (SIDEBAR FILTER LEFT + HOTEL GRID RIGHT) */}
      <main className="main-content-layout">
        <SearchFilterBar />

        <section className="listings-section">
          <div className="listings-header">
            <p aria-live="polite">{loading ? 'Searching properties…' : `${hotels.length} properties`}</p>
          </div>

          <HotelGrid
            hotels={hotels}
            loading={loading}
            error={error}
            onRetry={() => dispatch(fetchHotels(filters))}
            onSelectHotel={handleSelect}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
};
