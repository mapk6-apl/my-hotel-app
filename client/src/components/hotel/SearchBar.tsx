import React, { useEffect, useRef, useState } from 'react';
import { Calendar, MapPin, Minus, Plus, Search, Users } from 'lucide-react';
import '../../styles/screen1.css';

export type BookingSearch = {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

type SearchBarProps = {
  initialSearch?: Partial<BookingSearch>;
  onSearch: (search: BookingSearch) => void;
};

const dateInputValue = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const normalizeGuestCount = (value: number | undefined): number =>
  typeof value === 'number' && Number.isInteger(value) ? Math.min(8, Math.max(1, value)) : 2;

const dateOffset = (offset: number, from = new Date()): string => {
  const date = new Date(from);
  date.setDate(date.getDate() + offset);
  return dateInputValue(date);
};

const nextDate = (value: string): string => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return dateOffset(2);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);
  return dateInputValue(date);
};

export const SearchBar: React.FC<SearchBarProps> = ({ initialSearch, onSearch }) => {
  const [city, setCity] = useState(initialSearch?.city ?? '');
  const [checkIn, setCheckIn] = useState(initialSearch?.checkIn ?? dateOffset(1));
  const [checkOut, setCheckOut] = useState(initialSearch?.checkOut ?? dateOffset(4));
  const [guests, setGuests] = useState(normalizeGuestCount(initialSearch?.guests));
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const guestPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeGuestPicker = (event: PointerEvent) => {
      if (event.target instanceof Node && !guestPickerRef.current?.contains(event.target)) {
        setIsGuestPickerOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsGuestPickerOpen(false);
    };
    document.addEventListener('pointerdown', closeGuestPicker);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeGuestPicker);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (initialSearch?.city !== undefined) setCity(initialSearch.city);
    if (initialSearch?.checkIn) setCheckIn(initialSearch.checkIn);
    if (initialSearch?.checkOut) setCheckOut(initialSearch.checkOut);
    if (initialSearch?.guests !== undefined) setGuests(normalizeGuestCount(initialSearch.guests));
  }, [initialSearch?.city, initialSearch?.checkIn, initialSearch?.checkOut, initialSearch?.guests]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch({ city: city.trim(), checkIn, checkOut, guests: normalizeGuestCount(guests) });
  };

  return (
    <div className="hero-search-card">
      <form onSubmit={submit} className="hero-search-grid" role="search">
        <div className="hero-input-field">
          <MapPin size={18} color="#656839" aria-hidden="true" />
          <div className="field-content">
            <label className="field-label" htmlFor="property-destination">Destination</label>
            <input
              id="property-destination"
              type="text"
              placeholder="City or destination"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="field-input"
            />
          </div>
        </div>

        <div className="hero-input-field">
          <Calendar size={18} color="#656839" aria-hidden="true" />
          <div className="field-content">
            <span className="field-label">Travel dates</span>
            <div className="hero-date-inputs">
              <input
                aria-label="Check-in date"
                type="date"
                min={dateOffset(0)}
                value={checkIn}
                required
                onChange={(event) => {
                  setCheckIn(event.target.value);
                  if (event.target.value >= checkOut) setCheckOut(nextDate(event.target.value));
                }}
              />
              <input
                aria-label="Check-out date"
                type="date"
                min={nextDate(checkIn)}
                value={checkOut}
                required
                onChange={(event) => setCheckOut(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="hero-input-field">
          <Users size={18} color="#656839" aria-hidden="true" />
          <div className="field-content guest-picker-anchor" ref={guestPickerRef}>
            <span className="field-label">Guests</span>
            <button
              type="button"
              id="property-guests"
              className="guest-picker-trigger"
              aria-haspopup="dialog"
              aria-expanded={isGuestPickerOpen}
              aria-controls="property-guest-picker"
              onClick={() => setIsGuestPickerOpen((open) => !open)}
            >
              {guests} {guests === 1 ? 'guest' : 'guests'}
            </button>
            {isGuestPickerOpen && (
              <div className="guest-picker-popover" id="property-guest-picker" role="dialog" aria-label="Select guests">
                <div>
                  <strong>Guests</strong>
                  <span className="guest-picker-count">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
                </div>
                <div className="guest-picker-controls">
                  <button
                    type="button"
                    className="guest-picker-stepper"
                    aria-label="Remove one guest"
                    disabled={guests <= 1}
                    onClick={() => setGuests((count) => Math.max(1, count - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <output aria-live="polite">{guests}</output>
                  <button
                    type="button"
                    className="guest-picker-stepper"
                    aria-label="Add one guest"
                    disabled={guests >= 8}
                    onClick={() => setGuests((count) => Math.min(8, count + 1))}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button type="button" className="guest-picker-done" onClick={() => setIsGuestPickerOpen(false)}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="hero-search-button">
          <Search size={18} />
          <span>Search stays</span>
        </button>
      </form>
    </div>
  );
};
