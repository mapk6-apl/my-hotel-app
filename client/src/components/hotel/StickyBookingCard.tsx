import React, { useState, useEffect } from 'react';
import { Calendar, Users, Star, ShieldCheck, Plus, Minus } from 'lucide-react';
import '../../styles/screen3.css';

export type BookingPayload = {
  roomId: number;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  startingPrice: number;
  grandTotal: number;
};

export type BookingRoomOption = {
  id: number;
  room_type: string;
  capacity: number;
  price_per_night: number | string;
  is_available: boolean;
};

export type StickyBookingCardProps = {
  startingPrice: number;
  rating?: number;
  reviewCount?: number;
  rooms?: BookingRoomOption[];
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onBookNow: (bookingDetails: BookingPayload) => void;
};

export const StickyBookingCard: React.FC<StickyBookingCardProps> = ({
  startingPrice,
  rating,
  reviewCount = 0,
  rooms = [],
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  onBookNow,
}) => {
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [checkIn, setCheckIn] = useState<string>(initialCheckIn ?? getTodayString(1));
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut ?? getTodayString(4));
  const [guests, setGuests] = useState<number>(initialGuests ?? 2);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    rooms.find((room) => room.is_available && room.capacity >= 2)?.id ?? null
  );
  const availableRooms = rooms.filter((room) => room.is_available && room.capacity >= guests);
  const selectedRoom = availableRooms.find((room) => room.id === selectedRoomId) ?? availableRooms[0];
  const nightlyPrice = selectedRoom ? Number(selectedRoom.price_per_night) : startingPrice;

  // Compute stay duration dynamically
  const calculateNights = (start: string, end: string): number => {
    const [startYear, startMonth, startDay] = start.split('-').map(Number);
    const [endYear, endMonth, endDay] = end.split('-').map(Number);
    if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) return 1;
    const diffDays = (Date.UTC(endYear, endMonth - 1, endDay) - Date.UTC(startYear, startMonth - 1, startDay)) / 86400000;
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights(checkIn, checkOut);

  const nextDate = (value: string): string => {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return getTodayString(1);
    const next = new Date(year, month - 1, day + 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
  };

  // Ensure checkOut is always after checkIn
  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIn = e.target.value;
    setCheckIn(newIn);
    if (checkOut <= newIn) setCheckOut(nextDate(newIn));
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOut = e.target.value;
    setCheckOut(newOut <= checkIn ? nextDate(checkIn) : newOut);
  };

  const grandTotal = nightlyPrice * nights;
  const roomTotal = grandTotal;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    onBookNow({
      roomId: selectedRoom.id,
      roomType: selectedRoom.room_type,
      checkIn,
      checkOut,
      nights,
      guests,
      startingPrice: nightlyPrice,
      grandTotal
    });
  };

  return (
    <div className="sticky-booking-card">
      {/* PRICE & RATING HEADER */}
      <div className="sticky-price-header">
        <div>
          <span className="sticky-price-main">R{nightlyPrice.toLocaleString()}</span>
          <span className="sticky-price-unit"> / night</span>
        </div>
        {rating !== undefined && reviewCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 800 }}>
            <Star size={14} fill="#d97706" color="#d97706" />
            <span>{rating.toFixed(1)}</span>
            <span style={{ opacity: 0.6, fontWeight: 400 }}>({reviewCount})</span>
          </div>
        )}
      </div>

      {/* RESERVATION FORM */}
      <form onSubmit={handleBookingSubmit}>
        <div className="booking-form-box">
          {rooms.length > 0 && (
            <label className="date-picker-cell">
              <span className="form-mini-label">Room type</span>
              <select
                className="form-mini-input"
                value={selectedRoom?.id ?? ''}
                onChange={(event) => setSelectedRoomId(Number(event.target.value))}
                disabled={availableRooms.length === 0}
                required
              >
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_type} · up to {room.capacity} guests · R{Number(room.price_per_night).toLocaleString()}/night
                  </option>
                ))}
              </select>
              {availableRooms.length === 0 && <span>No available room supports this guest count.</span>}
            </label>
          )}
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
            <span>R{nightlyPrice.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
            <span>R{roomTotal.toLocaleString()}</span>
          </div>
          <div className="cost-total-row">
            <span>Total (ZAR)</span>
            <span>R{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button type="submit" className="btn-book-now" disabled={!selectedRoom}>
          Reserve Stay (R{grandTotal.toLocaleString()})
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.625rem', opacity: 0.7, marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          <ShieldCheck size={12} color="#656839" />
          <span>Payment is not configured; no charge is taken online.</span>
        </p>
      </form>
    </div>
  );
};
