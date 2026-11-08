import React from 'react';
import { Calendar, User, RefreshCw } from 'lucide-react';
import type { AdminBooking } from '../../api/adminApi.js';
import '../../styles/screen6.css';

export type ReservationsTableProps = {
  bookings: AdminBooking[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatAmount = (value: number | string): string =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(Number(value));

const getStatusClass = (status: string): string =>
  status.toLowerCase() === 'approved' ? 'available' : 'booked';

export const ReservationsTable: React.FC<ReservationsTableProps> = ({
  bookings,
  loading,
  error,
  onRefresh,
}) => (
  <div className="admin-table-container">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
      <div>
        <h2 className="filter-title" style={{ fontSize: '1.125rem', margin: 0 }}>
          Customer Bookings ({loading ? '…' : bookings.length})
        </h2>
        <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>
          Reservation, guest and payment records from the database.
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="btn-search-submit"
        style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <RefreshCw size={14} />
        <span>{loading ? 'Refreshing…' : 'Refresh bookings'}</span>
      </button>
    </div>

    {error ? (
      <div role="alert" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--dark-khaki)' }}>
        <p>Customer bookings could not be loaded: {error}</p>
        <button type="button" onClick={onRefresh} className="btn-search-submit" style={{ width: 'auto' }}>
          Try again
        </button>
      </div>
    ) : loading ? (
      <div role="status" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--dark-khaki)' }}>
        Loading customer bookings…
      </div>
    ) : bookings.length === 0 ? (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--dark-khaki)' }}>
        No customer bookings found.
      </div>
    ) : (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Booking Reference</th>
            <th>Customer</th>
            <th>Property &amp; Room</th>
            <th>Stay Dates</th>
            <th>Guests</th>
            <th>Booking Amount</th>
            <th>Reservation</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.reservation_id}>
              <td style={{ fontWeight: 800 }}>#{booking.reservation_id}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={12} color="#656839" />
                  <span>{booking.guest_name}</span>
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.75, marginLeft: '1rem' }}>{booking.guest_email}</div>
              </td>
              <td>
                <div>{booking.hotel_name}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>{booking.room_type}</div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} color="#656839" />
                  <span>{formatDate(booking.check_in)} – {formatDate(booking.check_out)}</span>
                </div>
              </td>
              <td>{booking.guest_count}</td>
              <td style={{ fontWeight: 800 }}>{formatAmount(booking.total_amount)}</td>
              <td>
                <span className={`table-status-pill ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </td>
              <td>
                <span className={`table-status-pill ${getStatusClass(booking.payment_status)}`}>
                  {booking.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
