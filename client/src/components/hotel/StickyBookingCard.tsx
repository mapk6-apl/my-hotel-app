import React, { useState } from 'react';
import { Calendar, Users, Star, ShieldCheck } from 'lucide-react'; //using Lucide React icons
// @ts-ignore CSS is loaded by the bundler and has no TypeScript module declaration.
import '../../styles/screen3.css';

export type StickyBookingCardProps = {
  startingPrice: number;
  rating: number;
  reviewCount: number;
  onBookNow: (bookingDetails: { checkIn: string; checkOut: string; guests: number; totalAmount: number }) => void;
};

export const StickyBookingCard: React.FC<StickyBookingCardProps> = ({startingPrice, rating, reviewCount, onBookNow}) => {
  //local state management for direct control over date selection and guest count
  const [checkIn, setCheckIn] = useState<string>('2026-10-24');
  const [checkOut, setCheckOut] = useState<string>('2026-10-28');
  const [guests, setGuests] = useState<number>(2);

  //derived calculations are computed dynamically during render
  const nights = 4;
  const roomTotal = startingPrice * nights;
  const cleaningFee = 650;
  const serviceFee = 520;
  const grandTotal = roomTotal + cleaningFee + serviceFee;

  //form submission directly triggers booking flow
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBookNow({ checkIn, checkOut, guests, totalAmount: grandTotal });
  };

  return (
    <div className="sticky-booking-card">
      {/* price and rating header */}
      <div className="sticky-price-header">
        <div>
          <span className="sticky-price-main">R{startingPrice}</span>
          <span className="sticky-price-unit"> / night</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 800 }}>
          <Star size={14} fill="#d97706" color="#d97706" />
          <span>{rating}</span>
          <span style={{ opacity: 0.6, fontWeight: 400 }}>({reviewCount})</span>
        </div>
      </div>

      {/* reservation form */}
      <form onSubmit={handleBookingSubmit}>
        <div className="booking-form-box">
          
          {/* date pickers */}
          <div className="date-picker-row">
            <div className="date-picker-cell">
              <label className="form-mini-label"><Calendar size={10} /><span>Check-In</span></label>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="form-mini-input"/>
            </div>

            <div className="date-picker-cell">
              <label className="form-mini-label"><Calendar size={10} /><span>Check-Out</span></label>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="form-mini-input"/>
            </div>
          </div>

          {/* guest and room count selection*/}
          <div className="guest-select-cell">
            <label className="form-mini-label"><Users size={10} /><span>Guests & Rooms</span></label>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="form-mini-input" style={{ cursor: 'pointer' }}>
              <option value={1}>1 Guest, 1 Room</option>
              <option value={2}>2 Guests, 1 Room</option>
              <option value={3}>3 Guests, 1 Room</option>
              <option value={4}>4 Guests, 2 Rooms</option>
            </select>
          </div>

        </div>

        {/* itemized cost breakdown */}
        <div className="cost-breakdown-list">
          <div className="cost-item-row">
            <span>R{startingPrice} × {nights} nights</span>
            <span>R{roomTotal}</span>
          </div>
          <div className="cost-item-row">
            <span>Cleaning fee</span>
            <span>R{cleaningFee}</span>
          </div>
          <div className="cost-item-row">
            <span>Service & Maintenance fee</span>
            <span>R{serviceFee}</span>
          </div>
          <div className="cost-total-row">
            <span>Total (ZAR)</span>
            <span>R{grandTotal}</span>
          </div>
        </div>

        <button type="submit" className="btn-book-now">Book Now</button>

        <p style={{ textAlign: 'center', fontSize: '0.625rem', opacity: 0.7, marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          <ShieldCheck size={12} color="#656839" />
          <span>You won't be charged yet</span>
        </p>
      </form>

    </div>
  );
};

