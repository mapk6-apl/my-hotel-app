// client/src/components/hotel/HotelCard.tsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavoriteLocal, type Hotel } from '../../store/slices/hotelSlice.js';
import { type RootState } from '../../store/store.js';
import { getHotelPhotoUrl, getFallbackSvgDataUri } from '../../api/photoApi.js';
import { ChevronLeft, ChevronRight, Heart, Star, MapPin } from 'lucide-react';
import '../../styles/screen1.css';

export type HotelCardProps = {
  hotel: Hotel;
  onViewDetails: (hotelId: number) => void;
};

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onViewDetails }) => {
  const dispatch = useDispatch();

  // Read favorite properties list from Redux
  const favorites = useSelector((state: RootState) => state.hotels.favorites);
  const isFavorite = favorites.includes(hotel.id);

  // Array of property images for the carousel (uses hotel.images or generates a gallery for hotel.id)
  const hotelImages = (hotel as Hotel & { images?: string[] }).images;
  const images: string[] = hotelImages && hotelImages.length > 0
    ? hotelImages
    : getHotelGallery(hotel.id, 4);

  // Local state for active carousel image index
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Touch swipe state for mobile gesture handling
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Next image handler
  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Previous image handler
  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touchX = e.touches[0]?.clientX ?? null;
    setTouchStartX(touchX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchStartX === null) return;

    const touchEndX = e.changedTouches[0]?.clientX;
    if (touchEndX === undefined) {
      setTouchStartX(null);
      return;
    }

    const diff = touchStartX - touchEndX;

    // Swipe left (next) or right (prev) threshold > 40px
    if (diff > 40) {
      handleNextImage();
    } else if (diff < -40) {
      handlePrevImage();
    }
    setTouchStartX(null);
  };

  return (
    <div className="hotel-card">
      
      {/* CAROUSEL IMAGE CONTAINER */}
      <div 
        className="card-image-wrapper relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentImageIndex]}
          alt={`${hotel.name} - Photo ${currentImageIndex + 1}`}
          className="card-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getFallbackSvgDataUri(hotel.name);
          }}
        />

        {/* STAR RATING BADGE */}
        <div className="star-badge">
          <Star size={12} className="inline mr-1 fill-current" />
          {hotel.star_rating} Stars
        </div>

        {/* FAVORITE TOGGLE BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleFavoriteLocal(hotel.id));
          }}
          className="favorite-toggle-btn"
          aria-label="Toggle Favorite"
        >
          <Heart 
            size={16} 
            className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"} 
          />
        </button>

        {/* CAROUSEL ARROWS & CONTROLS */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="carousel-arrow left-arrow"
              aria-label="Previous Image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="carousel-arrow right-arrow"
              aria-label="Next Image"
            >
              <ChevronRight size={16} />
            </button>

            {/* DOT INDICATORS & IMAGE COUNTER BADGE */}
            <div className="carousel-dots-container">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`carousel-dot ${idx === currentImageIndex ? 'active' : ''}`}
                />
              ))}
            </div>

            <div className="carousel-counter-badge">
              {currentImageIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {/* CARD CONTENT */}
      <div className="card-content">
        <div>
          <span className="card-location">{hotel.city}</span>
          <h4 className="card-title">{hotel.name}</h4>
          <p className="card-description">
            {hotel.description || 'Luxury break-away accommodation with premium facilities.'}
          </p>
        </div>

        {/* PRICING & VIEW DETAILS CTA */}
        <div className="card-footer">
          <div>
            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', display: 'block', color: 'rgba(81, 75, 35, 0.7)' }}>Starting from</span>
            <span className="price-amount">R{hotel.starting_price} / night</span>
          </div>

          <button onClick={() => onViewDetails(hotel.id)} className="btn-view-details">
            VIEW DETAILS
          </button>
        </div>
      </div>

    </div>
  );
};
function getHotelGallery(id: number, imageCount: number): string[] {
  return Array.from({ length: Math.max(0, imageCount) }, (_, index) =>
    getHotelPhotoUrl(id, index),
  );
}

