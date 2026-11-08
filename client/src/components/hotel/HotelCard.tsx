import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Star, MapPin } from 'lucide-react';
import { toggleFavoriteLocal, type Hotel } from '../../store/slices/hotelSlice.js';
import { type RootState } from '../../store/store.js';
import { getFallbackSvgDataUri, normalizePropertyImageUrl } from '../../api/photoApi.js';
import '../../styles/screen1.css';

export type HotelCardProps = {
  hotel: Hotel;
  onViewDetails: (hotelId: number) => void;
};

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onViewDetails }) => {
  const dispatch = useDispatch();

  const favorites = useSelector((state: RootState) => state.hotels.favorites);
  const isFavorite = favorites.includes(hotel.id);

  const placeholderImage = getFallbackSvgDataUri(hotel.name);

  return (
    <div className="hotel-card">
      {/* CAROUSEL IMAGE CONTAINER */}
      <div className="card-image-wrapper">
        <img
          src={hotel.hero_image ? normalizePropertyImageUrl(hotel.hero_image) : placeholderImage}
          alt={hotel.name}
          className="card-image"
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
          }}
        />

        {/* STAR RATING BADGE */}
        <div className="star-badge">
          <Star size={11} className="inline mr-1 fill-current" />
          <span>{hotel.star_rating} Stars</span>
        </div>

        {/* FAVORITE TOGGLE BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleFavoriteLocal(hotel.id));
          }}
          className="favorite-toggle-btn"
          aria-pressed={isFavorite}
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Heart
            size={16}
            fill={isFavorite ? '#f43f5e' : 'none'}
            color={isFavorite ? '#f43f5e' : '#4b5563'}
          />
        </button>

      </div>

      {/* CARD CONTENT */}
      <div className="card-content">
        <div>
          <div className="card-location-row">
            <MapPin size={12} color="#656839" />
            <span className="card-location">{hotel.city}</span>
          </div>
          <h4 className="card-title">{hotel.name}</h4>
          <p className="card-description">
            {hotel.description || 'No property description is available.'}
          </p>
        </div>

        {/* PRICING & VIEW DETAILS CTA */}
        <div className="card-footer">
          <div>
            <span className="price-label">Starting from</span>
            <span className="price-amount">
              {hotel.starting_price > 0
                ? `R${hotel.starting_price.toLocaleString()} / night`
                : 'Pricing unavailable'}
            </span>
          </div>

          <button
            type="button"
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
