import React, { useEffect, useState } from 'react';
import { Calendar, User, RefreshCw, Save } from 'lucide-react';
import type { AdminBooking } from '../../api/adminApi.js';
import '../../styles/screen6.css';

export type ReservationsTableProps = {
  bookings: AdminBooking[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onUpdateStatus: (reservationId: number, status: string) => Promise<void>;
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
  onUpdateStatus,
}) => (
  <ReservationsTableContent
    bookings={bookings}
    loading={loading}
    error={error}
    onRefresh={onRefresh}
    onUpdateStatus={onUpdateStatus}
  />
);

const ReservationsTableContent: React.FC<ReservationsTableProps> = ({
  bookings,
  loading,
  error,
  onRefresh,
  onUpdateStatus,
}) => {
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedStatuses(Object.fromEntries(
      bookings.map((booking) => [booking.reservation_id, booking.status])
    ));
  }, [bookings]);

  const saveStatus = async (id: number, currentStatus: string) => {
    const status = selectedStatuses[id] ?? currentStatus;
    if (status === currentStatus) return;
    setSavingId(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setSavingId(null);
    }
  };

  return <div className="admin-table-container">
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
            <th>Manage</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.reservation_id}>
              <td data-label="Booking reference" style={{ fontWeight: 800 }}>#{booking.reservation_id}</td>
              <td data-label="Customer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={12} color="#656839" />
                  <span>{booking.guest_name || 'Guest account unavailable'}</span>
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.75, marginLeft: '1rem' }}>{booking.guest_email || 'Email unavailable'}</div>
              </td>
              <td data-label="Property and room">
                <div>{booking.hotel_name || 'Property unavailable'}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>{booking.room_type || 'Room unavailable'}</div>
              </td>
              <td data-label="Stay dates">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} color="#656839" />
                  <span>{formatDate(booking.check_in)} – {formatDate(booking.check_out)}</span>
                </div>
              </td>
              <td data-label="Guests">{booking.guest_count}</td>
              <td data-label="Amount" style={{ fontWeight: 800 }}>{formatAmount(booking.total_amount)}</td>
              <td data-label="Reservation status">
                <span className={`table-status-pill ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </td>
              <td data-label="Payment status">
                <span className={`table-status-pill ${getStatusClass(booking.payment_status)}`}>
                  {booking.payment_status}
                </span>
              </td>
              <td data-label="Manage">
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <select
                    aria-label={`Reservation status for booking ${booking.reservation_id}`}
                    value={selectedStatuses[booking.reservation_id] ?? booking.status}
                    onChange={(event) => setSelectedStatuses((current) => ({
                      ...current,
                      [booking.reservation_id]: event.target.value,
                    }))}
                  >
                    {['pending', 'approved', 'completed', 'cancelled'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`Save status for booking ${booking.reservation_id}`}
                    disabled={savingId === booking.reservation_id}
                    onClick={() => void saveStatus(booking.reservation_id, booking.status)}
                    className="btn-table-action"
                  >
                    <Save size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>;
};
