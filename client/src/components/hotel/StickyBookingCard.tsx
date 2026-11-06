import React, { useState, useEffect } from 'react';
import { Calendar, Users, Star, ShieldCheck, Plus, Minus } from 'lucide-react';
import '../../styles/screen3.css';

export type BookingPayload = {
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  startingPrice: number;
  grandTotal: number;
};

export type StickyBookingCardProps = {
  startingPrice?: number;
  rating?: number;
  reviewCount?: number;
  onBookNow: (bookingDetails: BookingPayload) => void;
};

export const StickyBookingCard: React.FC<StickyBookingCardProps> = ({
  startingPrice = 1800,
  rating = 4.9,
  reviewCount = 128,
  onBookNow,
}) => {
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0] ?? '';
  };

  const [checkIn, setCheckIn] = useState<string>(getTodayString(1));
  const [checkOut, setCheckOut] = useState<string>(getTodayString(4));
  const [guests, setGuests] = useState<number>(2);

  // Compute stay duration dynamically
  const calculateNights = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 1;
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights(checkIn, checkOut);

  // Ensure checkOut is always after checkIn
  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIn = e.target.value;
    setCheckIn(newIn);
    if (new Date(checkOut) <= new Date(newIn)) {
      const nextDay = new Date(newIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0] ?? '');
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOut = e.target.value;
    if (new Date(newOut) <= new Date(checkIn)) {
      const nextDay = new Date(checkIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0] ?? '');
    } else {
      setCheckOut(newOut);
    }
  };

  const roomTotal = startingPrice * nights;
  const cleaningFee = 650;
  const serviceFee = Math.round(roomTotal * 0.08);
  const grandTotal = roomTotal + cleaningFee + serviceFee;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBookNow({
      checkIn,
      checkOut,
      nights,
      guests,
      startingPrice,
      grandTotal
    });
  };

  return (
    <div className="sticky-booking-card">
      {/* PRICE & RATING HEADER */}
      <div className="sticky-price-header">
        <div>
          <span className="sticky-price-main">R{startingPrice.toLocaleString()}</span>
          <span className="sticky-price-unit"> / night</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 800 }}>
          <Star size={14} fill="#d97706" color="#d97706" />
          <span>{rating}</span>
          <span style={{ opacity: 0.6, fontWeight: 400 }}>({reviewCount})</span>
        </div>
      </div>

      {/* RESERVATION FORM */}
      <form onSubmit={handleBookingSubmit}>
        <div className="booking-form-box">
          {/* DATE PICKERS */}
          <div className="date-picker-row">
            <div className="date-picker-cell">
              <label className="form-mini-label">
                <Calendar size={12} color="#656839" />
                <span>Check-In</span>
              </label>
              <input
                type="date"
                min={getTodayString(0)}
                value={checkIn}
                onChange={handleCheckInChange}
                className="form-mini-input"
              />
            </div>

            <div className="date-picker-cell">
              <label className="form-mini-label">
                <Calendar size={12} color="#656839" />
                <span>Check-Out</span>
              </label>
              <input
                type="date"
                min={checkIn}
                value={checkOut}
                onChange={handleCheckOutChange}
                className="form-mini-input"
              />
            </div>
          </div>

          {/* GUEST COUNT SELECTION */}
          <div className="guest-select-cell">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-mini-label">
                <Users size={12} color="#656839" />
                <span>Travelers</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                  className="stepper-btn"
                  disabled={guests <= 1}
                >
                  <Minus size={12} />
                </button>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#514B23', minWidth: '1.25rem', textAlign: 'center' }}>
                  {guests}
                </span>
                <button
                  type="button"
                  onClick={() => setGuests(prev => Math.min(8, prev + 1))}
                  className="stepper-btn"
                  disabled={guests >= 8}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ITEMIZED COST BREAKDOWN */}
        <div className="cost-breakdown-list">
          <div className="cost-item-row">
            <span>R{startingPrice.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
            <span>R{roomTotal.toLocaleString()}</span>
          </div>
          <div className="cost-item-row">
            <span>Cleaning fee</span>
            <span>R{cleaningFee.toLocaleString()}</span>
          </div>
          <div className="cost-item-row">
            <span>Service & Maintenance fee</span>
            <span>R{serviceFee.toLocaleString()}</span>
          </div>
          <div className="cost-total-row">
            <span>Total (ZAR)</span>
            <span>R{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button type="submit" className="btn-book-now">
          Reserve Stay (R{grandTotal.toLocaleString()})
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.625rem', opacity: 0.7, marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          <ShieldCheck size={12} color="#656839" />
          <span>You won't be charged until review</span>
        </p>
      </form>
    </div>
  );
};
