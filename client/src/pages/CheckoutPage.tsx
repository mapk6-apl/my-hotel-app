import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, User } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { createReservation, type Booking } from '../store/slices/bookingSlice.js';
import type { AppDispatch, RootState } from '../store/store.js';
import { normalizePropertyImageUrl } from '../api/photoApi.js';
import '../styles/screen4.css';

type BookingDraft = {
  roomId: number;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  startingPrice: number;
  grandTotal: number;
  hotelId: number;
  hotelName: string;
  city: string;
  heroImage: string | null;
};

type CheckoutLocationState = {
  bookingDraft?: BookingDraft;
};

export type CheckoutPageProps = {
  onNavigateHome: () => void;
  onOpenAuthModal: () => void;
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

const formatDate = (date: string): string =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigateHome, onOpenAuthModal }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const bookingDraft = (location.state as CheckoutLocationState | null)?.bookingDraft;
  const [reservation, setReservation] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingDraft) {
      setError('Choose a property, room, and stay dates before continuing.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const savedReservation = await dispatch(createReservation({
        roomId: bookingDraft.roomId,
        checkIn: bookingDraft.checkIn,
        checkOut: bookingDraft.checkOut,
        guestCount: bookingDraft.guests,
      })).unwrap();
      setReservation(savedReservation);
    } catch (requestError: unknown) {
      setError(typeof requestError === 'string' ? requestError : 'Unable to save this reservation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const returnToProperty = () => {
    if (bookingDraft) {
      navigate(`/hotel/${bookingDraft.hotelId}`, {
        state: {
          bookingSearch: {
            checkIn: bookingDraft.checkIn,
            checkOut: bookingDraft.checkOut,
            guests: bookingDraft.guests,
          },
        },
      });
    }
    else navigate('/explore');
  };

  const currentStep = reservation ? 2 : 1;

  return (
    <div className="page-container">
      <Navbar onOpenAuthModal={onOpenAuthModal} onNavigateHome={onNavigateHome} />
      <main className="main-content-layout" style={{ flexDirection: 'column' }}>
        <div className="checkout-steps-bar">
          <button type="button" className={`step-item ${currentStep === 1 ? 'active' : ''}`} onClick={returnToProperty}>
            <span className="step-number-badge">1</span>
            <span>Review reservation</span>
          </button>
          <div className="step-connector-line" />
          <div className={`step-item ${currentStep === 2 ? 'active' : ''}`}>
            <span className="step-number-badge">2</span>
            <span>Confirmation</span>
          </div>
        </div>

        {!bookingDraft ? (
          <section className="success-card" role="alert">
            <h1>No reservation selected</h1>
            <p>Choose a property, room, and dates before opening checkout.</p>
            <button type="button" className="btn-pay-now" onClick={() => navigate('/explore')}>
              Browse properties
            </button>
          </section>
        ) : reservation ? (
          <section className="success-card" aria-live="polite">
            <CheckCircle2 size={56} color="#656839" style={{ margin: '0 auto 1rem' }} />
            <h1>Reservation saved</h1>
            <p>
              Thank you, <strong>{reservation.guest_name || user?.full_name || 'Guest'}</strong>.
              Your reservation at <strong>{reservation.hotel_name || bookingDraft.hotelName}</strong> is recorded.
            </p>
            <p>Payment has not been taken. Payment status: <strong>{reservation.payment_status}</strong>.</p>
            <div className="order-summary-card" style={{ textAlign: 'left', margin: '1.5rem auto' }}>
              <p>Booking reference: <strong>#{reservation.reservation_id}</strong></p>
              <p>Room: <strong>{reservation.room_type || bookingDraft.roomType}</strong></p>
              <p>Dates: <strong>{formatDate(reservation.check_in)} – {formatDate(reservation.check_out)}</strong></p>
              <p>Travellers: <strong>{reservation.guest_count}</strong></p>
              <p>Total: <strong>{formatCurrency(Number(reservation.total_amount))}</strong></p>
              <p>Guest: <strong>{reservation.guest_name || user?.full_name}</strong> ({reservation.guest_email || user?.email})</p>
              <p>Reservation status: <strong>{reservation.status}</strong></p>
            </div>
            <button type="button" onClick={onNavigateHome} className="btn-pay-now" style={{ width: 'auto', margin: '0 auto', padding: '0.75rem 2rem' }}>
              Return to Home
            </button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="checkout-layout-grid">
            <section className="checkout-form-card">
              <h1 className="checkout-card-header">
                <User size={18} color="#656839" />
                <span>Review guest and stay details</span>
              </h1>
              <p><strong>Guest:</strong> {user?.full_name || 'Account holder'}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Room:</strong> {bookingDraft.roomType}</p>
              <p><strong>Travellers:</strong> {bookingDraft.guests}</p>
              <p><Calendar size={16} aria-hidden="true" /> {formatDate(bookingDraft.checkIn)} – {formatDate(bookingDraft.checkOut)} ({bookingDraft.nights} {bookingDraft.nights === 1 ? 'night' : 'nights'})</p>
              <p>This reservation will be saved with payment pending. No card is charged because a payment provider is not configured.</p>
              <button type="button" className="btn-reset" onClick={returnToProperty}>Back to property</button>
            </section>

            <aside className="order-summary-card">
              <h2 className="filter-title">Reservation summary</h2>
              <div className="summary-hotel-header">
                {bookingDraft.heroImage && (
                  <img
                    src={normalizePropertyImageUrl(bookingDraft.heroImage)}
                    alt={bookingDraft.hotelName}
                    className="summary-hotel-thumb"
                  />
                )}
                <div>
                  <h3>{bookingDraft.hotelName}</h3>
                  <span>{bookingDraft.city}</span>
                </div>
              </div>
              <div className="cost-breakdown-list">
                <div className="cost-item-row">
                  <span>{formatCurrency(bookingDraft.startingPrice)} × {bookingDraft.nights} nights</span>
                  <span>{formatCurrency(bookingDraft.startingPrice * bookingDraft.nights)}</span>
                </div>
                <div className="cost-total-row">
                  <span>Amount due (payment pending)</span>
                  <span>{formatCurrency(bookingDraft.startingPrice * bookingDraft.nights)}</span>
                </div>
              </div>
              {error && <p role="alert" className="auth-error-alert">{error}</p>}
              <button type="submit" disabled={isProcessing} className="btn-pay-now">
                {isProcessing ? 'Saving reservation…' : 'Save reservation'}
              </button>
            </aside>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};
