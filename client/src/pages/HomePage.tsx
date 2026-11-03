import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { SearchFilterBar } from '../components/hotel/SearchFilterBar.js';
import { HotelGrid } from '../components/hotel/HotelGrid.js';
import { Footer } from '../components/common/Footer.js';
import { fetchHotels } from '../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
//import '../styles/screen1.css';

export type HomePageProps = {
    onOpenAuthModal: () => void;
    onSelectHotel: (hotelId: number) => void;
};

export const HomePage: React.FC<HomePageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { hotels, loading, filters } = useSelector((state: RootState) => state.hotels);

    // Fetch initial hotels on mount 
    useEffect(() => {
        dispatch(fetchHotels(filters));
    }, [dispatch]);

    return (
        <div className="page-container">
            {/* 1. header */}
            <Navbar onOpenAuthModal={onOpenAuthModal} />

            {/* 2. hero banner */}
            <header className="hero-header">
                <h1 className="hero-title">Find Your Perfect Break-Away Lodging</h1>
                <p className="hero-subtitle"> Discover luxury suites, boutique rooms, and holiday resorts in South Africa. </p>
            </header>

            {/* 3. main layout */}
            <main className="main-content-layout">
                <SearchFilterBar />

                <section style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', textTransform: 'uppercase' }}>Available Properties ({hotels.length})</h2>

                    <HotelGrid
                        hotels={hotels}
                        loading={loading}
                        onSelectHotel={onSelectHotel}
                    />
                </section>
            </main>

            {/* 4. footer */}
            <footer />
        </div>
    );
};