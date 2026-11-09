import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Heart, Share2, MapPin, ShieldCheck, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { PhotoGallery } from '../components/hotel/PhotoGallery.js';
import { MapWidget } from '../components/hotel/MapWidget.js';
import { getAverageReviewRating, ReviewsSection } from '../components/hotel/ReviewsSection.js';
import { StickyBookingCard } from '../components/hotel/StickyBookingCard.js';
import type { BookingPayload } from '../components/hotel/StickyBookingCard.js';
import { Footer } from '../components/common/Footer.js';
import { hotelApi } from '../api/hotelApi.js';
import { toggleFavoriteLocal } from '../store/slices/hotelSlice.js';
import type { PropertyImage } from '../store/slices/hotelSlice.js';
import type { RootState } from '../store/store.js';
import '../styles/screen3.css';

type PropertyDetails = {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  star_rating: number;
  starting_price: number;
  images: PropertyImage[];
  amenities: string[];
  reviews: PropertyReview[];
  rooms: PropertyRoom[];
};

type PropertyReview = {
  id: number;
  rating: number | string;
  comment: string | null;
  guest_name: string | null;
};

type PropertyRoom = {
  id: number;
  room_type: string;
  capacity: number;
  price_per_night: number | string;
  is_available: boolean;
};

type PropertyDetailsResponse = Omit<PropertyDetails, 'starting_price' | 'images' | 'amenities' | 'rooms'> & {
  rooms?: PropertyRoom[];
  images?: PropertyImage[];
  amenities?: { name: string }[];
  reviews?: PropertyReview[];
};

type CheckoutBookingDraft = BookingPayload & {
  hotelId: number;
  hotelName: string;
  city: string;
  heroImage: string | null;
};

const pendingBookingKey = 'breakaway-pending-booking';
const pendingBookingMaxAge = 30 * 60 * 1000;

const readPendingBooking = (hotelId: number): CheckoutBookingDraft | undefined => {
  try {
    const stored = sessionStorage.getItem(pendingBookingKey);
    if (!stored) return undefined;
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || !('draft' in parsed) || !('createdAt' in parsed)) {
      sessionStorage.removeItem(pendingBookingKey);
      return undefined;
    }
    const entry = parsed as { draft?: CheckoutBookingDraft; createdAt?: number };
    const draft = entry.draft;
    if (
      typeof entry.createdAt !== 'number' ||
      Date.now() - entry.createdAt > pendingBookingMaxAge ||
      !draft ||
      draft.hotelId !== hotelId ||
      !Number.isInteger(draft.roomId) ||
      !Number.isInteger(draft.guests) ||
      draft.guests < 1 ||
      !Number.isFinite(draft.startingPrice) ||
      !Number.isFinite(draft.grandTotal) ||
      !draft.checkIn ||
      !draft.checkOut
    ) {
      sessionStorage.removeItem(pendingBookingKey);
      return undefined;
    }
    return draft;
  } catch {
    return undefined;
  }
};

export type HotelDetailsPageProps = {
  hotelId?: number;
  onOpenAuthModal?: () => void;
};

export const HotelDetailsPage: React.FC<HotelDetailsPageProps> = ({
  hotelId: propHotelId,
  onOpenAuthModal,
}) => {
  const { id: urlParamId } = useParams<{ id: string }>();
  const activeId = propHotelId ?? (urlParamId ? Number.parseInt(urlParamId, 10) : Number.NaN);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const isFavorite = useSelector((state: RootState) => state.hotels.favorites.includes(activeId));
  const locationState = location.state as {
    bookingSearch?: { checkIn: string; checkOut: string; guests: number };
    bookingDraft?: CheckoutBookingDraft;
  } | null;
  const bookingSearch = locationState?.bookingSearch;
  const restoredBooking = locationState?.bookingDraft ?? readPendingBooking(activeId);
  const initialCheckIn = restoredBooking?.checkIn ?? bookingSearch?.checkIn;
  const initialCheckOut = restoredBooking?.checkOut ?? bookingSearch?.checkOut;
  const initialGuests = restoredBooking?.guests ?? bookingSearch?.guests;

  const [hotel, setHotel] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
            images: property.images ?? [],
            amenities: (property.amenities ?? []).map((amenity) => amenity.name),
            reviews: property.reviews ?? [],
            rooms: property.rooms ?? [],
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

  const handleShare = async () => {
    const shareData = { title: hotel?.name ?? 'Property', url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        window.dispatchEvent(new CustomEvent('app-toast', {
          detail: { message: 'Property link copied to clipboard.', type: 'success' },
        }));
      } else {
        window.dispatchEvent(new CustomEvent('app-toast', {
          detail: { message: 'Sharing is not available in this browser.', type: 'error' },
        }));
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Unable to share this property. Please try again.', type: 'error' },
      }));
    }
  };

  const handleBookNow = (bookingDetails: BookingPayload) => {
    if (!hotel) return;
    const bookingDraft: CheckoutBookingDraft = {
      ...bookingDetails,
      hotelId: hotel.id,
      hotelName: hotel.name,
      city: hotel.city,
      heroImage: hotel.images[0]?.image_url ?? null,
    };
    try {
      sessionStorage.setItem(pendingBookingKey, JSON.stringify({
        draft: bookingDraft,
        createdAt: Date.now(),
      }));
    } catch {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Your booking can continue, but this browser could not save a recovery copy.', type: 'error' },
      }));
    }
    navigate('/checkout', {
      state: { bookingDraft },
    });
  };

  const guestReviewRating = hotel ? getAverageReviewRating(hotel.reviews) : null;

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
              onClick={() => dispatch(toggleFavoriteLocal(hotel.id))}
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
                    <span>{amenity.replace(/&amp;/g, '&')}</span>
                  </div>
                )) : <p>No amenities are listed for this property.</p>}
              </div>
            </section>

            {/* MAP WIDGET */}
            <MapWidget address={hotel.address} city={hotel.city} />

            {/* REVIEWS SECTION */}
            <ReviewsSection reviews={hotel.reviews} />
          </div>

          {/* STICKY BOOKING CARD */}
          <div>
            {hotel.starting_price > 0 ? (
              <StickyBookingCard
                startingPrice={hotel.starting_price}
                rooms={hotel.rooms}
                {...(initialCheckIn ? { initialCheckIn } : {})}
                {...(initialCheckOut ? { initialCheckOut } : {})}
                {...(initialGuests !== undefined ? { initialGuests } : {})}
                {...(restoredBooking ? { initialRoomId: restoredBooking.roomId } : {})}
                {...(guestReviewRating !== null ? { rating: guestReviewRating } : {})}
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
