// client/src/components/hotel/HotelCard.tsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavoriteLocal, type Hotel } from '../../store/slices/hotelSlice.js';
import { type RootState } from '../../store/store.js';
import { getHotelPhotoUrl, getFallbackSvgDataUri } from '../../api/photoApi.js';
import { Heart, Star, MapPin } from 'lucide-react';
import '../../styles/screen1.css';

export type HotelCardProps = {
  hotel: Hotel;
  onViewDetails: (hotelId: number) => void;
};

/**
 * HotelCard Component (Screen 1 Individual Property Listing Tile)
 * Displays property photo, location, star rating badge, price, favorite button, and VIEW DETAILS action.
 */
export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onViewDetails }) => {
  const dispatch = useDispatch();

  // Read favorites list from Redux
  const favorites = useSelector((state: RootState) => state.hotels.favorites);
  const isFavorite = favorites.includes(hotel.id);

  // Dynamic image resolution using Photo API with automatic fallback
  const initialPhotoUrl = hotel.hero_image && !hotel.hero_image.includes('suspicious')
    ? hotel.hero_image
    : getHotelPhotoUrl(hotel.id, 0);

  const [imgSrc, setImgSrc] = useState<string>(initialPhotoUrl);

  const handleImageError = () => {
    // Fall back to clean SVG Data URI if the external image URL fails to load
    setImgSrc(getFallbackSvgDataUri(hotel.name));
  };

  return (
    <div className="hotel-card">
      
      {/* PROPERTY HERO IMAGE & OVERLAY BADGES */}
      <div className="card-image-wrapper">
        <img
          src={imgSrc}
          alt={hotel.name}
          className="card-image"
          onError={handleImageError}
        />

        {/* STAR RATING BADGE */}
        <div className="star-badge">
          <Star size={11} className="inline fill-current mr-1" />
          <span>{hotel.star_rating} Stars</span>
        </div>

        {/* FAVORITE TOGGLE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleFavoriteLocal(hotel.id));
          }}
          className="favorite-toggle-btn"
          aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart 
            size={16} 
            fill={isFavorite ? "#f43f5e" : "none"} 
            color={isFavorite ? "#f43f5e" : "#514B23"} 
          />
        </button>
      </div>

      {/* CARD CONTENT */}
      <div className="card-content">
        <div>
          <div className="card-location-group">
            <MapPin size={12} color="#656839" />
            <span className="card-location">{hotel.city || 'South Africa'}</span>
          </div>

          <h4 className="card-title">{hotel.name}</h4>
          
          <p className="card-description">
            {hotel.description || 'Luxury break-away accommodation with premium facilities and verified guest reviews.'}
          </p>
        </div>

        {/* PRICING & VIEW DETAILS CTA */}
        <div className="card-footer">
          <div>
            <span className="price-label">Starting from</span>
            <span className="price-amount">R{hotel.starting_price} / night</span>
          </div>

          <button
            onClick={() => onViewDetails(hotel.id)}
            className="btn-view-details"
          >
            VIEW DETAILS
          </button>
        </div>
      </div>

    </div>
  );
};
