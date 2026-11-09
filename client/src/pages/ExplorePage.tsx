import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.js';
import { SearchFilterBar } from '../components/hotel/SearchFilterBar.js';
import { SearchBar, type BookingSearch } from '../components/hotel/SearchBar.js';
import { HotelGrid } from '../components/hotel/HotelGrid.js';
import { Footer } from '../components/common/Footer.js';
import { fetchHotels } from '../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
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
  const searchDetails = (location.state as { bookingSearch?: BookingSearch } | null)?.bookingSearch;

  useEffect(() => {
    dispatch(fetchHotels(filters));
  }, [dispatch, filters]);

  const handleSelect = (id: number) => {
    if (onSelectHotel) {
      onSelectHotel(id);
    } else {
      navigate(`/hotel/${id}`, { state: searchDetails ? { bookingSearch: searchDetails } : undefined });
    }
  };

  const handleSearch = (search: BookingSearch) => {
    dispatch(setFilters({
      city: search.city,
      guests: search.guests,
      checkIn: search.checkIn,
      checkOut: search.checkOut,
    }));
    navigate('/explore', { replace: true, state: { bookingSearch: search } });
  };

  return (
    <div className="page-container">
      <Navbar {...(onOpenAuthModal ? { onOpenAuthModal } : {})} />

      <header className="explore-header-banner">
        <div className="explore-header-content">
          <h1 className="explore-main-title">Explore properties</h1>
          <p className="explore-sub-title">
            Search the full Break-Away Hotels catalogue.
          </p>
        </div>
      </header>

      <section className="explore-search-section">
        <SearchBar
          initialSearch={{
            city: filters.city,
            ...(searchDetails?.checkIn || filters.checkIn
              ? { checkIn: searchDetails?.checkIn || filters.checkIn }
              : {}),
            ...(searchDetails?.checkOut || filters.checkOut
              ? { checkOut: searchDetails?.checkOut || filters.checkOut }
              : {}),
            ...(searchDetails
              ? { guests: searchDetails.guests }
              : typeof filters.guests === 'number' ? { guests: filters.guests } : {}),
          }}
          onSearch={handleSearch}
        />
      </section>

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
