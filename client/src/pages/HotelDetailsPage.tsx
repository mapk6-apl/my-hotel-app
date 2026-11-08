import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, Share2, MapPin, ShieldCheck, Star } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { PhotoGallery } from '../components/hotel/PhotoGallery.js';
import { MapWidget } from '../components/hotel/MapWidget.js';
import { ReviewsSection } from '../components/hotel/ReviewsSection.js';
import { StickyBookingCard } from '../components/hotel/StickyBookingCard.js';
import { Footer } from '../components/common/Footer.js';
import { hotelApi } from '../api/hotelApi.js';
import '../styles/screen3.css';

type PropertyDetails = {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  star_rating: number;
  starting_price: number;
  images: string[];
  amenities: string[];
  reviews: PropertyReview[];
};

type PropertyReview = {
  id: number;
  rating: number | string;
  comment: string | null;
  guest_name: string | null;
};

type PropertyDetailsResponse = Omit<PropertyDetails, 'starting_price' | 'images' | 'amenities'> & {
  rooms?: { price_per_night: number | string }[];
  images?: { image_url: string }[];
  amenities?: { name: string }[];
  reviews?: PropertyReview[];
};

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
  const activeId = propHotelId ?? (urlParamId ? Number.parseInt(urlParamId, 10) : Number.NaN);
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    setHotel(null);

    if (!Number.isInteger(activeId) || activeId <= 0) {
      setLoadError('The requested property could not be found.');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const loadProperty = async () => {
      try {
        const response = await hotelApi.getHotelById(activeId);
        const property = response?.data as PropertyDetailsResponse | undefined;
        if (!response?.success || !property || property.id !== activeId) {
          throw new Error('The requested property could not be found.');
        }

        const roomPrices = (property.rooms ?? [])
          .map((room) => Number(room.price_per_night))
          .filter((price) => Number.isFinite(price) && price > 0);

        if (active) {
          setHotel({
            ...property,
            star_rating: Number(property.star_rating),
            starting_price: roomPrices.length > 0 ? Math.min(...roomPrices) : 0,
            images: (property.images ?? []).map((image) => image.image_url),
            amenities: (property.amenities ?? []).map((amenity) => amenity.name),
            reviews: property.reviews ?? [],
          });
        }
      } catch (error: unknown) {
        if (active) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load this property.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProperty();
    return () => {
      active = false;
    };
  }, [activeId]);

  const handleShare = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  const handleBookNow = (bookingDetails: any) => {
    if (!hotel) return;
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
        {loading ? (
          <div role="status" style={{ padding: '4rem', textAlign: 'center', color: 'var(--dark-khaki)' }}>
            Loading property details…
          </div>
        ) : loadError || !hotel ? (
          <div role="alert" style={{ padding: '4rem', textAlign: 'center', color: 'var(--dark-khaki)' }}>
            <p>{loadError || 'The requested property could not be found.'}</p>
            <button type="button" className="btn-search-submit" onClick={() => navigate('/explore')}>
              Return to properties
            </button>
          </div>
        ) : (
          <>
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
        <PhotoGallery images={hotel.images} hotelName={hotel.name} />

        {/* DETAILS & STICKY BOOKING CARD */}
        <div className="details-content-layout">
          <div>
            {/* ABOUT PROPERTY */}
            <section className="info-section-card">
              <h2 className="section-card-title">About Property</h2>
              <p className="section-card-body">
                {hotel.description || 'No property description is available.'}
              </p>
            </section>

            {/* FACILITIES & AMENITIES */}
            <section className="info-section-card">
              <h2 className="section-card-title">Facilities & Amenities</h2>
              <div className="facilities-grid">
                {hotel.amenities.length > 0 ? hotel.amenities.map((amenity) => (
                  <div className="facility-item" key={amenity}>
                    <ShieldCheck size={16} color="#656839" />
                    <span>{amenity}</span>
                  </div>
                )) : <p>No amenities are listed for this property.</p>}
              </div>
            </section>

            {/* MAP WIDGET */}
            <MapWidget address={hotel.address || hotel.city} city={hotel.city} />

            {/* REVIEWS SECTION */}
            <ReviewsSection reviews={hotel.reviews} />
          </div>

          {/* STICKY BOOKING CARD */}
          <div>
            {hotel.starting_price > 0 ? (
              <StickyBookingCard
                startingPrice={hotel.starting_price}
                rating={hotel.star_rating}
                reviewCount={hotel.reviews.length}
                onBookNow={handleBookNow}
              />
            ) : (
              <p role="status">Pricing is not currently available for this property.</p>
            )}
          </div>
        </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};
