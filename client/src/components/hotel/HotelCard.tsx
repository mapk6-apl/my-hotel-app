import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, Heart, Star, MapPin } from 'lucide-react';
import { toggleFavoriteLocal, type Hotel } from '../../store/slices/hotelSlice.js';
import { type RootState } from '../../store/store.js';
import { getHotelPhotoSet } from '../../api/photoApi.js';
import '../../styles/screen1.css';

export type HotelCardProps = {
  hotel: Hotel;
  onViewDetails: (hotelId: number) => void;
};

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onViewDetails }) => {
  const dispatch = useDispatch();

  const favorites = useSelector((state: RootState) => state.hotels.favorites);
  const isFavorite = favorites.includes(hotel.id);

  // Retrieve unique photo set for this specific hotel
  const photoSet = getHotelPhotoSet(hotel.id);
  const images: string[] = photoSet.gallery;

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="hotel-card">
      {/* CAROUSEL IMAGE CONTAINER */}
      <div className="card-image-wrapper">
        <img
          src={images[currentImageIndex] || photoSet.hero}
          alt={hotel.name + ' Photo ' + (currentImageIndex + 1)}
          className="card-image"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = photoSet.hero;
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
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Heart
            size={16}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>

        {/* CAROUSEL CONTROLS */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="carousel-btn left"
              aria-label="Previous Photo"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={handleNextImage}
              className="carousel-btn right"
              aria-label="Next Photo"
            >
              <ChevronRight size={16} />
            </button>

            {/* DOT INDICATORS */}
            <div className="carousel-dots-row">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={'carousel-dot ' + (idx === currentImageIndex ? 'active' : '')}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                />
              ))}
            </div>
          </>
        )}
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
            {hotel.description || 'Luxury break-away accommodation with premium guest facilities.'}
          </p>
        </div>

        {/* PRICING & VIEW DETAILS CTA */}
        <div className="card-footer">
          <div>
            <span className="price-label">Starting from</span>
            <span className="price-amount">R{hotel.starting_price.toLocaleString()} / night</span>
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
