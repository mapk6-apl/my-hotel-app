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
    onOpenAuthModal: () =>void; 
    onSelectHotel: (hotelId: number) => void; 
};

export const HomePage: React.FC<HomePageProps> = ({ onOpenAuthModal, onSelectHotel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { hotels, loading, filters } = useSelector((state: RootState) => state.hotels);

  // Fetch initial hotels on mount 
  useEffect(() => { 
    dispatch(fetchHotels(filters)); 
}, [dispatch]);

