import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { toggleFavoriteLocal, type Hotel, type PropertyImage } from '../../store/slices/hotelSlice.js';
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
  const gallery: PropertyImage[] = hotel.gallery_images?.length
    ? hotel.gallery_images.map((image) => typeof image === 'string' ? { image_url: image } : image)
    : hotel.hero_image ? [{ image_url: hotel.hero_image }] : [];
  const [imageIndex, setImageIndex] = useState(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('hotel-card-image-indices') || '{}');
      if (stored && typeof stored === 'object' && hotel.id in stored) {
        const index = (stored as Record<number, unknown>)[hotel.id];
        if (typeof index === 'number' && Number.isInteger(index) && index >= 0) return index;
      }
    } catch {
      localStorage.removeItem('hotel-card-image-indices');
    }
    return 0;
  });

  useEffect(() => {
    if (imageIndex >= gallery.length && imageIndex !== 0) setImageIndex(0);
  }, [gallery.length, imageIndex]);

  const changeImage = (offset: number) => {
    const nextIndex = (imageIndex + offset + gallery.length) % gallery.length;
    setImageIndex(nextIndex);
    try {
      const stored = JSON.parse(localStorage.getItem('hotel-card-image-indices') || '{}') as Record<string, number>;
      localStorage.setItem('hotel-card-image-indices', JSON.stringify({ ...stored, [hotel.id]: nextIndex }));
    } catch {
      localStorage.setItem('hotel-card-image-indices', JSON.stringify({ [hotel.id]: nextIndex }));
    }
  };

  return (
    <div className="hotel-card">
      {/* CAROUSEL IMAGE CONTAINER */}
      <div className="card-image-wrapper">
        <img
          loading="lazy"
          decoding="async"
          src={gallery.length ? normalizePropertyImageUrl(gallery[imageIndex]?.image_url || gallery[0]?.image_url || '') : placeholderImage}
          alt={gallery[imageIndex]?.alt_text || `Representative image for ${hotel.name}`}
          className="card-image"
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
          }}
        />
        {gallery[imageIndex]?.attribution_name && (
          <div className="card-image-credit">
            <a href={gallery[imageIndex]?.attribution_url || undefined} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
              Photo by {gallery[imageIndex]?.attribution_name}
            </a>
            {gallery[imageIndex]?.source_url && (
              <> on <a href={gallery[imageIndex].source_url!} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>{gallery[imageIndex]?.source_name}</a></>
            )}
          </div>
        )}
        {gallery.length > 1 && (
          <>
            <button type="button" className="carousel-btn left" aria-label={`Previous image for ${hotel.name}`} onClick={() => changeImage(-1)}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className="carousel-btn right" aria-label={`Next image for ${hotel.name}`} onClick={() => changeImage(1)}>
              <ChevronRight size={16} />
            </button>
            <div className="carousel-dots-row" aria-label="Property image selection">
              {gallery.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  className={`carousel-dot ${imageIndex === index ? 'active' : ''}`}
                  aria-label={`Show property image ${index + 1}`}
                  aria-current={imageIndex === index ? 'true' : undefined}
                  onClick={() => changeImage(index - imageIndex)}
                />
              ))}
            </div>
          </>
        )}

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
