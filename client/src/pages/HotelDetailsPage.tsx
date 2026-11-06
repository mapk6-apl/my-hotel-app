import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Share2, MapPin, Wifi, Tv, Coffee, Car, ShieldCheck, Star } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { PhotoGallery } from '../components/hotel/PhotoGallery.js';
import { MapWidget } from '../components/hotel/MapWidget.js';
import { ReviewsSection } from '../components/hotel/ReviewsSection.js';
import { StickyBookingCard } from '../components/hotel/StickyBookingCard.js';
import { Footer } from '../components/common/Footer.js';
import { getHotelById } from '../data/hotelData.js';
import '../styles/screen3.css';

export type HotelDetailsPageProps = {
  hotelId?: number;
  onNavigateToCheckout?: (bookingData?: any) => void;
  onOpenAuthModal?: () => void;
};

export const HotelDetailsPage: React.FC<HotelDetailsPageProps> = ({
  hotelId: propHotelId,
  onNavigateToCheckout,
  onOpenAuthModal,
}) => {
  const { id: urlParamId } = useParams<{ id: string }>();
  const activeId = propHotelId || (urlParamId ? parseInt(urlParamId, 10) : 1);

  const hotel = getHotelById(activeId);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);

  const handleShare = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  const handleBookNow = (bookingDetails: any) => {
    if (onNavigateToCheckout) {
      onNavigateToCheckout({ ...bookingDetails, hotelId: hotel.id, hotelName: hotel.name });
    } else {
      window.location.href = '/checkout';
    }
  };

  return (
    <div className="page-container">
      <Navbar {...(onOpenAuthModal ? { onOpenAuthModal } : {})} />

      <main className="main-content-layout" style={{ flexDirection: 'column' }}>
        {shareToast && (
          <div className="share-toast-alert">
            <span>Link copied to clipboard! Share {hotel.name} with friends.</span>
          </div>
        )}

        {/* PROPERTY HEADER & TITLE */}
        <div className="hotel-details-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="details-star-tag">★ {hotel.star_rating} Stars</span>
              <span className="details-city-tag">{hotel.city}</span>
            </div>
            <h1 className="hotel-details-title">{hotel.name}</h1>
            <div className="hotel-details-address">
              <MapPin size={14} color="#656839" />
              <span>{hotel.address || (hotel.city + ', South Africa')}</span>
            </div>
          </div>

          <div className="action-buttons-group">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={'icon-action-btn ' + (isFavorite ? 'active' : '')}
              aria-label="Save to Favorites"
            >
              <Heart size={18} fill={isFavorite ? '#f43f5e' : 'none'} color={isFavorite ? '#f43f5e' : '#514B23'} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="icon-action-btn"
              aria-label="Share Property"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* PHOTO GALLERY WITH LIGHTBOX */}
        <PhotoGallery images={(hotel as typeof hotel & { images?: string[] }).images ?? []} hotelName={hotel.name} />

        {/* DETAILS & STICKY BOOKING CARD */}
        <div className="details-content-layout">
          <div>
            {/* ABOUT PROPERTY */}
            <section className="info-section-card">
              <h2 className="section-card-title">About Property</h2>
              <p className="section-card-body">
                {hotel.description}
              </p>
            </section>

            {/* FACILITIES & AMENITIES */}
            <section className="info-section-card">
              <h2 className="section-card-title">Facilities & Amenities</h2>
              <div className="facilities-grid">
                <div className="facility-item"><Wifi size={16} color="#656839" /><span>High-Speed Fibre WiFi</span></div>
                <div className="facility-item"><Car size={16} color="#656839" /><span>Free Secure Parking</span></div>
                <div className="facility-item"><Coffee size={16} color="#656839" /><span>Gourmet Breakfast</span></div>
                <div className="facility-item"><Tv size={16} color="#656839" /><span>Smart TV & DSTV</span></div>
                <div className="facility-item"><ShieldCheck size={16} color="#656839" /><span>24/7 Security</span></div>
              </div>
            </section>

            {/* MAP WIDGET */}
            <MapWidget address={hotel.address || hotel.city} city={hotel.city} />

            {/* REVIEWS SECTION */}
            <ReviewsSection rating={4.9} reviewCount={128} />
          </div>

          {/* STICKY BOOKING CARD */}
          <div>
            <StickyBookingCard
              startingPrice={hotel.starting_price}
              rating={4.9}
              reviewCount={128}
              onBookNow={handleBookNow}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
