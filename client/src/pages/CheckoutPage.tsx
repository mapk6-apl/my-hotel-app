import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, CreditCard, User } from 'lucide-react';
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

type CheckoutStep = 1 | 2 | 3;

export type CheckoutPageProps = {
  onNavigateHome: () => void;
  onOpenAuthModal: () => void;
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

const formatDate = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  return new Date(year, month - 1, day).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const statusMessage = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'Payment confirmed by the payment service.';
    case 'failed':
      return 'Payment was not completed. The reservation remains recorded with this status.';
    case 'pending':
      return 'Payment is pending. No payment provider is configured, so no charge has been taken.';
    default:
      return `Payment status: ${status || 'unavailable'}.`;
  }
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigateHome, onOpenAuthModal }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const bookingDraft = (location.state as CheckoutLocationState | null)?.bookingDraft;
  const [step, setStep] = useState<CheckoutStep>(1);
  const [reservation, setReservation] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const submissionInProgress = useRef(false);

  const reserve = async (event: React.FormEvent) => {
    event.preventDefault();
    if (reservation) {
      setError(null);
      setStep(2);
      return;
    }
    if (submissionInProgress.current || isProcessing) return;
    if (!bookingDraft) {
      setError('Choose a property, room, and stay dates before continuing.');
      return;
    }
    if (!user) {
      setError('Sign in to save this reservation and continue.');
      onOpenAuthModal();
      return;
    }

    submissionInProgress.current = true;
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
      setStep(2);
    } catch (requestError: unknown) {
      setError(typeof requestError === 'string' ? requestError : 'Unable to save this reservation. Please try again.');
    } finally {
      submissionInProgress.current = false;
      setIsProcessing(false);
    }
  };

  const returnToProperty = () => {
    if (!bookingDraft || reservation) return;
    navigate(`/hotel/${bookingDraft.hotelId}`, {
      state: {
        bookingDraft,
        bookingSearch: {
          checkIn: bookingDraft.checkIn,
          checkOut: bookingDraft.checkOut,
          guests: bookingDraft.guests,
          roomId: bookingDraft.roomId,
        },
      },
    });
  };

  const progressStep = (target: CheckoutStep, label: string) => (
    <button
      type="button"
      className={`step-item ${step === target ? 'active' : ''}`}
      aria-current={step === target ? 'step' : undefined}
      disabled={target > step}
      onClick={() => target < step && setStep(target)}
    >
      <span className="step-number-badge">{target}</span>
      <span>{label}</span>
    </button>
  );

  const propertySummary = bookingDraft && (
    <div className="summary-hotel-header">
      {bookingDraft.heroImage && (
        <img
          src={normalizePropertyImageUrl(bookingDraft.heroImage)}
          alt={`Representative image for ${bookingDraft.hotelName}`}
          className="summary-hotel-thumb"
        />
      )}
      <div>
        <h3>{reservation?.hotel_name || bookingDraft.hotelName}</h3>
        <span>{bookingDraft.city}</span>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <Navbar onOpenAuthModal={onOpenAuthModal} onNavigateHome={onNavigateHome} />
      <main className="main-content-layout" style={{ flexDirection: 'column' }}>
        <nav className="checkout-steps-bar" aria-label="Booking progress">
          {progressStep(1, 'RESERVE')}
          <div className="step-connector-line" />
          {progressStep(2, 'PAY')}
          <div className="step-connector-line" />
          {progressStep(3, 'CONFIRMATION')}
        </nav>

        {!bookingDraft ? (
          <section className="success-card" role="alert">
            <h1>No reservation selected</h1>
            <p>Choose a property, room, and dates before opening checkout.</p>
            <button type="button" className="btn-pay-now" onClick={() => navigate('/explore')}>
              Browse properties
            </button>
          </section>
        ) : step === 1 ? (
          <form onSubmit={reserve} className="checkout-layout-grid">
            <section className="checkout-form-card">
              <h1 className="checkout-card-header">
                <User size={18} color="#656839" />
                <span>Review reservation</span>
              </h1>
              <p><strong>Guest:</strong> {reservation?.guest_name || user?.full_name || 'Account holder'}</p>
              <p><strong>Email:</strong> {reservation?.guest_email || user?.email || 'Account email unavailable'}</p>
              <p><strong>Room:</strong> {reservation?.room_type || bookingDraft.roomType}</p>
              <p><strong>Travellers:</strong> {reservation?.guest_count ?? bookingDraft.guests}</p>
              <p>
                <Calendar size={16} aria-hidden="true" />
                {' '}{formatDate(reservation?.check_in || bookingDraft.checkIn)} – {formatDate(reservation?.check_out || bookingDraft.checkOut)}
                {' '}({bookingDraft.nights} {bookingDraft.nights === 1 ? 'night' : 'nights'})
              </p>
              {reservation ? (
                <p>This reservation has been saved. Your selected property, room, dates, and guest count are retained.</p>
              ) : (
                <p>Continue to save this reservation and review payment availability.</p>
              )}
              <button type="button" className="btn-reset" onClick={returnToProperty} disabled={Boolean(reservation)}>
                {reservation ? 'Reservation saved' : 'Back to property'}
              </button>
              {error && <p role="alert" className="auth-error-alert">{error}</p>}
            </section>

            <aside className="order-summary-card">
              <h2 className="filter-title">Reservation summary</h2>
              {propertySummary}
              <div className="cost-breakdown-list">
                <div className="cost-item-row">
                  <span>{formatCurrency(bookingDraft.startingPrice)} × {bookingDraft.nights} nights</span>
                  <span>{formatCurrency(bookingDraft.startingPrice * bookingDraft.nights)}</span>
                </div>
                <div className="cost-total-row">
                  <span>Estimated total (ZAR)</span>
                  <span>{formatCurrency(bookingDraft.startingPrice * bookingDraft.nights)}</span>
                </div>
              </div>
              <button type="submit" disabled={isProcessing} className="btn-pay-now">
                {isProcessing ? 'Saving reservation…' : !user ? 'Sign in to continue' : 'Continue to payment'}
              </button>
            </aside>
          </form>
        ) : step === 2 && reservation ? (
          <div className="checkout-layout-grid">
            <section className="checkout-form-card">
              <h1 className="checkout-card-header">
                <CreditCard size={18} color="#656839" />
                <span>Payment</span>
              </h1>
              <p>
                Payment options are not available yet. No payment provider is configured, and no card details
                should be entered here.
              </p>
              <div className="payment-option-unavailable" aria-disabled="true">
                <CreditCard size={18} aria-hidden="true" />
                <span>Online card payment</span>
                <strong>Unavailable</strong>
              </div>
              <p className="payment-status-note" role="status">{statusMessage(reservation.payment_status)}</p>
              <div className="checkout-step-actions">
                <button type="button" className="btn-reset" onClick={() => setStep(1)}>Back to reserve</button>
                <button type="button" className="btn-pay-now" onClick={() => setStep(3)}>
                  Continue with {reservation.payment_status.toLowerCase() === 'pending' ? 'payment pending' : 'current status'}
                </button>
              </div>
            </section>

            <aside className="order-summary-card">
              <h2 className="filter-title">Saved reservation</h2>
              {propertySummary}
              <div className="cost-breakdown-list">
                <div className="cost-item-row">
                  <span>Booking reference</span>
                  <span>#{reservation.reservation_id}</span>
                </div>
                <div className="cost-total-row">
                  <span>Actual reservation amount</span>
                  <span>{formatCurrency(Number(reservation.total_amount))}</span>
                </div>
              </div>
              <p>Reservation status: <strong>{reservation.status}</strong></p>
              <p>Payment status: <strong>{reservation.payment_status}</strong></p>
            </aside>
          </div>
        ) : step === 3 && reservation ? (
          <section className="success-card" aria-live="polite">
            <CheckCircle2 size={56} color="#656839" style={{ margin: '0 auto 1rem' }} />
            <h1>Reservation confirmation</h1>
            <p>
              Thank you, <strong>{reservation.guest_name}</strong>. Your reservation at{' '}
              <strong>{reservation.hotel_name}</strong> has been recorded.
            </p>
            <p>{statusMessage(reservation.payment_status)}</p>
            <div className="order-summary-card confirmation-summary">
              <p>Booking reference: <strong>#{reservation.reservation_id}</strong></p>
              <p>Room: <strong>{reservation.room_type}</strong></p>
              <p>Dates: <strong>{formatDate(reservation.check_in)} – {formatDate(reservation.check_out)}</strong></p>
              <p>Travellers: <strong>{reservation.guest_count}</strong></p>
              <p>Total: <strong>{formatCurrency(Number(reservation.total_amount))}</strong></p>
              <p>Guest: <strong>{reservation.guest_name}</strong> ({reservation.guest_email})</p>
              <p>Reservation status: <strong>{reservation.status}</strong></p>
              <p>Payment status: <strong>{reservation.payment_status}</strong></p>
            </div>
            <div className="checkout-step-actions confirmation-actions">
              <button type="button" className="btn-reset" onClick={() => setStep(2)}>Back to payment</button>
              <button type="button" onClick={onNavigateHome} className="btn-pay-now">
                Return to Home
              </button>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};
