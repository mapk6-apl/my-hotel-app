import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { SearchFilterBar } from '../components/hotel/SearchFilterBar.js';
import { HotelGrid } from '../components/hotel/HotelGrid.js';
import { Footer } from '../components/common/Footer.js';
import { fetchHotels } from '../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
import { Search, MapPin, Calendar, Users, Sparkles } from 'lucide-react';
import '../styles/screen1.css';

export type LandingPageProps = {
  onOpenAuthModal: () => void;
  onSelectHotel: (hotelId: number) => void;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { hotels, loading, filters } = useSelector((state: RootState) => state.hotels);

  const [destination, setDestination] = useState<string>('');
  const [guests, setGuests] = useState<number>(2);

  useEffect(() => {
    dispatch(fetchHotels(filters));
  }, [dispatch]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const exploreSection = document.getElementById('explore');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="page-container bg-[#F4F9E9] text-[#514B23]">
      <Navbar onOpenAuthModal={onOpenAuthModal} />

      <header className="bg-[#514B23] text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-[#656839] px-4 py-1.5 rounded-full text-xs font-semibold mb-4 text-[#F4F9E9]">
            <Sparkles size={14} />
            <span>Hospitality Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Discover Exceptional Accommodations</h1>
          <p className="mt-3 text-base sm:text-lg text-[#CBD0B9]">Book hotel suites, boutique rooms, and lodging options.</p>

          <form onSubmit={handleHeroSearch} className="mt-8 bg-white p-4 rounded-2xl shadow-xl max-w-3xl mx-auto text-[#514B23] grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            <div className="flex items-center space-x-2 bg-[#F4F9E9] p-2.5 rounded-xl border border-[#CBD0B9]">
              <MapPin size={18} className="text-[#656839]" />
              <input type="text" placeholder="City" value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-transparent text-xs font-semibold w-full focus:outline-none"/>
            </div>

            <div className="flex items-center space-x-2 bg-[#F4F9E9] p-2.5 rounded-xl border border-[#CBD0B9]">
              <Calendar size={18} className="text-[#656839]" />
              <span className="text-xs font-semibold">Select Dates</span>
            </div>

            <div className="flex items-center space-x-2 bg-[#F4F9E9] p-2.5 rounded-xl border border-[#CBD0B9]">
              <Users size={18} className="text-[#656839]" />
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="bg-transparent text-xs font-semibold focus:outline-none">
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={4}>4 Guests</option>
              </select>
            </div>

            <button type="submit" className="bg-[#656839] hover:bg-[#514B23] text-[#F4F9E9] font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-1">
              <Search size={16} />
              <span>SEARCH</span>
            </button>
          </form>
        </div>
      </header>

      <main id="explore" className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-[#514B23] mb-4">Available Accommodations ({hotels.length})</h2>

        <div className="main-content-layout">
          <SearchFilterBar />

          <section style={{ flex: 1 }}>
            <HotelGrid
              hotels={hotels}
              loading={loading}
              onSelectHotel={onSelectHotel}
            />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};