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

export const HotelDetailsPage: React.FC<HotelDetailsPageProps> = ({hotelId, onNavigateToCheckout, onOpenAuthModal}) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  return (
    <div className="page-container">
      <Navbar onOpenAuthModal={onOpenAuthModal} />
      <main className="main-content-layout" style={{ flexDirection: 'column' }}>
        <div className="hotel-details-header">
          <div>
            <h1 className="hotel-details-title">HOTEL 1</h1>
            <div className="hotel-details-address">
              <MapPin size={14} color="#656839" />
              <span>62nd Avenue, Bendor, Polokwane, 0700, South Africa</span>
            </div>
          </div>

          {/* action buttons; favourite and share */}
          <div className="action-buttons-group">
            <button onClick={() => setIsFavorite(!isFavorite)} className={`icon-action-btn ${isFavorite ? 'active' : ''}`} aria-label="Save to Favorites">
              <Heart size={18} fill={isFavorite ? '#f43f5e' : 'none'} color={isFavorite ? '#f43f5e' : '#514B23'} />
            </button>

            <button onClick={() => alert('Property link copied to clipboard!')} className="icon-action-btn" aria-label="Share Property">
              <Share2 size={18} />
            </button>
          </div>
        </div>