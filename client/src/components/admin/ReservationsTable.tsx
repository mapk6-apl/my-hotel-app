import React from 'react';
import { Calendar, User, CheckCircle, Clock } from 'lucide-react'; 
import '../../styles/screen6.css';

export const ReservationsTable: React.FC = () => {
  const mockBookings = [
    { id: 'BA-9812', guest: 'Keagan Louw', hotel: 'Hotel 1', checkIn: '24 Oct 2026', total: 8370, status: 'Confirmed' },
    { id: 'BA-9744', guest: 'Iain McDonald', hotel: 'Cape Town Bay Resort', checkIn: '10 Nov 2026', total: 12400, status: 'Confirmed' },
    { id: 'BA-9620', guest: 'Onika Mbokazi', hotel: 'Durban Luxury Suites', checkIn: '01 Dec 2026', total: 6800, status: 'Pending' },
  ];

  return (
    <div className="admin-table-container">
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 className="filter-title" style={{ fontSize: '1.125rem', margin: 0 }}>
          Customer Bookings ({mockBookings.length})
        </h2>
        <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>
          Live feed of confirmed customer reservations and pending transactions.
        </p>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Booking Reference</th>
            <th>Guest Name</th>
            <th>Property</th>
            <th>Check-In Date</th>
            <th>Total Paid</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockBookings.map((b) => (
            <tr key={b.id}>
              <td style={{ fontWeight: 800 }}>#{b.id}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={12} color="#656839" />
                  <span>{b.guest}</span>
                </div>
              </td>
              <td>{b.hotel}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} color="#656839" />
                  <span>{b.checkIn}</span>
                </div>
              </td>
              <td style={{ fontWeight: 800 }}>R{b.total}</td>
              <td>
                <span className={`table-status-pill ${b.status === 'Confirmed' ? 'available' : 'booked'}`}>
                  {b.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};