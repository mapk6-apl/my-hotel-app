import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { SearchFilterBar } from '../components/hotel/SearchFilterBar.js';
import { HotelGrid } from '../components/hotel/HotelGrid.js';
import { Footer } from '../components/common/Footer.js';
import { fetchHotels } from '../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
import { MASTER_SOUTH_AFRICAN_HOTELS } from '../data/hotelData.js';
import { Compass, Filter } from 'lucide-react';
import '../styles/screen1.css';

export type ExplorePageProps = {
  onOpenAuthModal?: () => void;
  onSelectHotel?: (hotelId: number) => void;
};

export const ExplorePage: React.FC<ExplorePageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { hotels, loading, filters } = useSelector((state: RootState) => state.hotels);

  useEffect(() => {
    dispatch(fetchHotels(filters));
  }, [dispatch, filters]);

  const activeHotels = hotels && hotels.length > 0 ? hotels : MASTER_SOUTH_AFRICAN_HOTELS;

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

      {/* WORKSPACE LAYOUT (SIDEBAR FILTER LEFT + HOTEL GRID RIGHT) */}
      <main className="main-content-layout">
        <SearchFilterBar />

        <section className="listings-section">
          <div className="listings-header">
            <div className="listings-title-group">
              <Filter size={18} color="#656839" />
              <h2 className="section-title">
                Available Accommodations ({activeHotels.length})
              </h2>
            </div>
          </div>

          <HotelGrid
            hotels={activeHotels}
            loading={loading}
            onSelectHotel={handleSelect}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
};
