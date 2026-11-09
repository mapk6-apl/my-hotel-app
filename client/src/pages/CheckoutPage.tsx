import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, CreditCard, User } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { createReservation, type Booking } from '../store/slices/bookingSlice.js';
import type { AppDispatch, RootState } from '../store/store.js';
import { normalizePropertyImageUrl } from '../api/photoApi.js';
import { hotelApi } from '../api/hotelApi.js';
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
      return 'Payment is pending. The reservation is not confirmed until the payment service verifies it.';
    case 'cancelled':
      return 'Payment was cancelled. The reservation remains unpaid; you can retry payment.';
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
  const searchParams = new URLSearchParams(location.search);
  const returnReservationId = Number(searchParams.get('reservation_id'));
  const returnPaymentReference = searchParams.get('payment_ref') || '';
  const paymentResult = searchParams.get('payment_result');
  const isPaymentReturn = Number.isInteger(returnReservationId) && returnReservationId > 0 &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(returnPaymentReference);
  const [step, setStep] = useState<CheckoutStep>(1);
  const [reservation, setReservation] = useState<Booking | null>(null);
  const [restoredDraft, setRestoredDraft] = useState<BookingDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentReturnMessage, setPaymentReturnMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(isPaymentReturn);
  const submissionInProgress = useRef(false);
  const paymentInProgress = useRef(false);
  const activeBookingDraft = bookingDraft || restoredDraft;

  useEffect(() => {
    if (!isPaymentReturn) return;
    let cancelled = false;

    const restorePayment = async () => {
      if (!user) {
        setError('Sign in to view this reservation payment.');
        setIsCheckingPayment(false);
        return;
      }

      setIsCheckingPayment(true);
      setError(null);
      try {
        for (let attempt = 0; attempt < 6; attempt += 1) {
          const response = await hotelApi.getPayFastPaymentStatus(returnReservationId, returnPaymentReference);
          const data = response.data?.data as (Booking & { room_id: number }) | undefined;
          if (!data) throw new Error('The payment service did not return this reservation.');
          if (cancelled) return;

          setReservation(data);
          const nights = Math.max(1, Math.round(
            (new Date(`${data.check_out}T00:00:00Z`).getTime() - new Date(`${data.check_in}T00:00:00Z`).getTime()) /
            (24 * 60 * 60 * 1000)
          ));
          setRestoredDraft({
            roomId: data.room_id,
            roomType: data.room_type,
            checkIn: data.check_in,
            checkOut: data.check_out,
            nights,
            guests: data.guest_count,
            startingPrice: Number(data.price_per_night),
            grandTotal: Number(data.total_amount),
            hotelId: data.accommodation_id,
            hotelName: data.hotel_name,
            city: data.city,
            heroImage: data.hero_image,
          });

          if (data.payment_status.toLowerCase() === 'paid') {
            setStep(3);
            setPaymentReturnMessage('Payment verified. Your reservation is confirmed.');
            return;
          }
          setStep(2);
          if (data.payment_status.toLowerCase() !== 'pending' || attempt === 5) break;
          await new Promise((resolve) => window.setTimeout(resolve, 3000));
          if (cancelled) return;
        }

        if (!cancelled) {
          setPaymentReturnMessage(
            paymentResult === 'cancelled'
              ? 'The payment was cancelled. It has not been marked as paid; you can retry.'
              : 'Payment has not been verified yet. Confirmation will appear only after the server verifies the PayFast notification.'
          );
        }
      } catch (requestError: unknown) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to retrieve payment status.');
        }
      } finally {
        if (!cancelled) setIsCheckingPayment(false);
      }
    };

    void restorePayment();
    return () => {
      cancelled = true;
    };
  }, [isPaymentReturn, paymentResult, returnPaymentReference, returnReservationId, user?.id]);

  const startPayFastPayment = async () => {
    if (!reservation || paymentInProgress.current || isProcessing) return;
    paymentInProgress.current = true;
    setIsProcessing(true);
    setError(null);
    try {
      const payment = await hotelApi.createPayFastPayment(reservation.reservation_id);
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payment.action;
      form.style.display = 'none';
      for (const [name, value] of Object.entries(payment.fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (requestError: unknown) {
      const responseError = typeof requestError === 'object' && requestError !== null && 'response' in requestError
        ? (requestError as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      setError(responseError || (requestError instanceof Error ? requestError.message : 'Unable to open PayFast Sandbox.'));
      paymentInProgress.current = false;
      setIsProcessing(false);
    }
  };

  const reserve = async (event: React.FormEvent) => {
    event.preventDefault();
    if (reservation) {
      setError(null);
      setStep(2);
      return;
    }
    if (submissionInProgress.current || isProcessing) return;
    if (!activeBookingDraft) {
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
        roomId: activeBookingDraft.roomId,
        checkIn: activeBookingDraft.checkIn,
        checkOut: activeBookingDraft.checkOut,
        guestCount: activeBookingDraft.guests,
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
    if (!activeBookingDraft || reservation) return;
    navigate(`/hotel/${activeBookingDraft.hotelId}`, {
      state: {
        bookingDraft: activeBookingDraft,
        bookingSearch: {
          checkIn: activeBookingDraft.checkIn,
          checkOut: activeBookingDraft.checkOut,
          guests: activeBookingDraft.guests,
          roomId: activeBookingDraft.roomId,
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

  const propertySummary = activeBookingDraft && (
    <div className="summary-hotel-header">
      {activeBookingDraft.heroImage && (
        <img
          src={normalizePropertyImageUrl(activeBookingDraft.heroImage)}
          alt={`Representative image for ${activeBookingDraft.hotelName}`}
          className="summary-hotel-thumb"
        />
      )}
      <div>
        <h3>{reservation?.hotel_name || activeBookingDraft.hotelName}</h3>
        <span>{activeBookingDraft.city}</span>
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

        {isCheckingPayment ? (
          <section className="success-card" role="status">
            <h1>Checking payment status</h1>
            <p>We are checking the verified status of your reservation with the server.</p>
          </section>
        ) : !activeBookingDraft && !reservation ? (
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
              <p><strong>Room:</strong> {reservation?.room_type || activeBookingDraft!.roomType}</p>
              <p><strong>Travellers:</strong> {reservation?.guest_count ?? activeBookingDraft!.guests}</p>
              <p>
                <Calendar size={16} aria-hidden="true" />
                {' '}{formatDate(reservation?.check_in || activeBookingDraft!.checkIn)} – {formatDate(reservation?.check_out || activeBookingDraft!.checkOut)}
                {' '}({activeBookingDraft!.nights} {activeBookingDraft!.nights === 1 ? 'night' : 'nights'})
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
                  <span>{formatCurrency(activeBookingDraft!.startingPrice)} × {activeBookingDraft!.nights} nights</span>
                  <span>{formatCurrency(activeBookingDraft!.startingPrice * activeBookingDraft!.nights)}</span>
                </div>
                <div className="cost-total-row">
                  <span>Estimated total (ZAR)</span>
                  <span>{formatCurrency(activeBookingDraft!.grandTotal)}</span>
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
              <p>PayFast Sandbox handles payment details. Break-Away Hotels does not collect or store card details.</p>
              <div className="payment-option-unavailable">
                <CreditCard size={18} aria-hidden="true" />
                <span>PayFast Sandbox</span>
                <strong>Sandbox</strong>
              </div>
              <p className="payment-status-note" role="status">{statusMessage(reservation.payment_status)}</p>
              {paymentReturnMessage && <p className="payment-status-note" role="status">{paymentReturnMessage}</p>}
              {error && <p role="alert" className="auth-error-alert">{error}</p>}
              <div className="checkout-step-actions">
                <button type="button" className="btn-reset" onClick={() => setStep(1)}>Back to reserve</button>
                <button
                  type="button"
                  className="btn-pay-now"
                  onClick={() => void startPayFastPayment()}
                  disabled={isProcessing || reservation.payment_status.toLowerCase() === 'paid'}
                >
                  {isProcessing ? 'Opening PayFast…' : 'Pay with PayFast Sandbox'}
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
