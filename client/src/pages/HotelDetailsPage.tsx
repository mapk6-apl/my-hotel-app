import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Heart, Share2, MapPin, Wifi, Tv, Coffee, Car, ShieldCheck, Sparkles, Compass, Utensils, Flame, Trees, Waves, Check } from 'lucide-react'; //from lucide react
import { Navbar } from '../components/common/Navbar.js';
import { PhotoGallery } from '../components/hotel/PhotoGallery.js';
import { MapWidget } from '../components/hotel/MapWidget.js';
import { ReviewsSection } from '../components/hotel/ReviewsSection.js';
import { StickyBookingCard } from '../components/hotel/StickyBookingCard.js';
import { Footer } from '../components/common/Footer.js';
import { fetchHotels, toggleFavoriteLocal, type Hotel } from '../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
import { getHotelGallery } from '../api/photoApi.js';
import '../styles/screen3.css';

export type HotelDetailsPageProps = {
  hotelId?: number;
  onNavigateToCheckout?: (bookingData?: any) => void;
  onOpenAuthModal?: () => void;
};

const HOTELS_DATABASE: Record<number, Hotel & { gallery: string[]; amenities: string[] }> = {
  1: {
    id: 1,
    name: 'Protea Hotel Break-Away',
    city: 'Polokwane',
    address: '62nd Avenue, Bendor, Polokwane, 0700',
    star_rating: 5,
    starting_price: 1800,
    description: 'Tranquil luxury suites surrounded by lush private gardens, executive conferencing facilities, fine dining, and world-class guest amenities in the heart of Limpopo.',
    hero_image: getHotelPhotoUrl(1, 0),
    gallery: getHotelGallery(1, 5),
    amenities: ['High-Speed WiFi', 'Free Executive Parking', 'Complimentary Buffet Breakfast', 'Smart TV & DSTV', '24/7 Concierge & Security', 'Swimming Pool & Spa']
  },
  2: {
    id: 2,
    name: 'Cape Grace Luxury Resort',
    city: 'Cape Town',
    address: 'West Quay Road, V&A Waterfront, Cape Town, 8001',
    star_rating: 5,
    starting_price: 2400,
    description: 'Waterfront elegance overlooking Table Mountain with private marina views, luxury harborside dining, wellness spa, and executive yacht transfer services.',
    hero_image: getHotelPhotoUrl(2, 0),
    gallery: getHotelGallery(2, 5),
    amenities: ['Marina Waterfront Views', 'High-Speed Fiber WiFi', 'Private Yacht Transfers', 'Luxury Wellness Spa', 'Fine Dining Restaurant', 'Cocktail Lounge']
  },
  3: {
    id: 3,
    name: 'Kruger Safari Lodge',
    city: 'Kruger Park',
    address: 'Paul Kruger Gate, Skukuza, 1242',
    star_rating: 4,
    starting_price: 3200,
    description: 'Immersive African wilderness lodge featuring open-air boma dining, daily guided game drives, infinity pool overlooking riverbeds, and air-conditioned luxury tents.',
    hero_image: getHotelPhotoUrl(3, 0),
    gallery: getHotelGallery(3, 5),
    amenities: ['Daily Guided Game Drives', 'Open-Air Boma Firepit', 'Infinity River Pool', 'All-Inclusive Bush Meals', 'Air-Conditioned Suites', 'Wildlife Viewing Deck']
  },
  4: {
    id: 4,
    name: 'The Oyster Box Hotel',
    city: 'Durban',
    address: '2 Lighthouse Road, Umhlanga Rocks, Durban, 4320',
    star_rating: 5,
    starting_price: 2100,
    description: 'Iconic seaside luxury resort located directly on the vibrant Umhlanga coastline, offering ocean-facing balconies, legendary high tea, and tropical gardens.',
    hero_image: getHotelPhotoUrl(4, 0),
    gallery: getHotelGallery(4, 5),
    amenities: ['Direct Oceanfront Access', 'Lighthouse View Terrace', 'Legendary High Tea', 'Spa & Heated Pools', 'Private Cinema', '24/7 Room Service']
  }
};

export const HotelDetailsPage: React.FC<HotelDetailsPageProps> = ({
  hotelId: propHotelId,
  onNavigateToCheckout,
  onOpenAuthModal,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams<{ id: string }>();

  const activeId = params.id ? parseInt(params.id, 10) : propHotelId || 1;

  const { hotels, favorites } = useSelector((state: RootState) => state.hotels);

  useEffect(() => {
    if (!hotels || hotels.length === 0) {
      dispatch(fetchHotels(undefined as any));
    }
  }, [dispatch, hotels]);

  const reduxHotel = hotels?.find((h) => h.id === activeId);
  const fallbackHotel = HOTELS_DATABASE[activeId] ?? HOTELS_DATABASE[1]!;

  const currentHotel = reduxHotel ?? fallbackHotel;
  const galleryImages = ('images' in currentHotel && Array.isArray(currentHotel.images) && currentHotel.images.length > 0)
    ? currentHotel.images
    : (fallbackHotel.gallery || getHotelGallery(activeId, 5));

  const amenitiesList = fallbackHotel.amenities;

  const isFavorite = favorites.includes(currentHotel.id);

  const handleToggleFavorite = () => {
    dispatch(toggleFavoriteLocal(currentHotel.id));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert();
    } else {
      alert();
    }
  };

  return (
    <div className="page-container">
      <Navbar {...(onOpenAuthModal ? { onOpenAuthModal } : {})} />

      <main className="main-content-layout" style={{ flexDirection: 'column' }}>
        <div className="hotel-details-header">
          <div>
            <h1 className="hotel-details-title">{currentHotel.name}</h1>
            <div className="hotel-details-address">
              <MapPin size={15} color="#656839" />
              <span>{currentHotel.address}, {currentHotel.city}, South Africa</span>
            </div>
          </div>

          <div className="action-buttons-group">
            <button
              onClick={handleToggleFavorite}
              className="icon-action-btn"
              title={isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
            >
              <Heart size={18} fill={isFavorite ? '#f43f5e' : 'none'} color={isFavorite ? '#f43f5e' : '#514B23'} />
            </button>

            <button
              onClick={handleShare}
              className="icon-action-btn"
              title="Share Property Link"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <PhotoGallery images={galleryImages} hotelName={currentHotel.name} />

        <div className="details-content-layout">
          <div>
            <section className="info-section-card">
              <h2 className="section-card-title">About {currentHotel.name}</h2>
              <p className="section-card-body">
                {currentHotel.description}
              </p>
            </section>

            <section className="info-section-card">
              <h2 className="section-card-title">Facilities & Amenities</h2>
              <div className="facilities-grid">
                {amenitiesList.map((amenity, idx) => (
                  <div key={idx} className="facility-item">
                    <Check size={16} color="#656839" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            <MapWidget address={currentHotel.address} city={currentHotel.city} />

            <ReviewsSection rating={currentHotel.star_rating * 1.9 || 9.5} reviewCount={128} />
          </div>

          <div>
            <StickyBookingCard
              startingPrice={currentHotel.starting_price}
              rating={currentHotel.star_rating * 1.9 || 9.5}
              reviewCount={128}
              onBookNow={() => {
                if (onNavigateToCheckout) {
                  onNavigateToCheckout({ hotel: currentHotel });
                } else {
                  window.location.href = '/checkout';
                }
              }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
function getHotelPhotoUrl(arg0: number, arg1: number): string {
  const photos = getHotelGallery(arg0, arg1 + 1);
  return photos[arg1] ?? photos[0] ?? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80';
}

