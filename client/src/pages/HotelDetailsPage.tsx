import React, { useState } from 'react';
import { Heart, Share2, MapPin, Wifi, Tv, Coffee, Car, ShieldCheck } from 'lucide-react'; //from lucide react
import { Navbar } from '../components/common/Navbar.js';
import { PhotoGallery } from '../components/hotel/PhotoGallery.js';
import { MapWidget } from '../components/hotel/MapWidget.js';
import { ReviewsSection } from '../components/hotel/ReviewsSection.js';
import { StickyBookingCard } from '../components/hotel/StickyBookingCard.js';
import { Footer } from '../components/common/Footer.js';
import '../styles/screen3.css';

export type HotelDetailsPageProps = {
  hotelId: number;
  onNavigateToCheckout: () => void;
  onOpenAuthModal: () => void;
};