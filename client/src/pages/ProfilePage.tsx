// client/src/pages/ProfilePage.tsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { logout, setUser } from '../store/slices/authSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
import { User, Mail, Calendar, Compass, Shield, LogOut, CheckCircle2, Building, Clock } from 'lucide-react';
import '../styles/screen5.css';

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const bookings = useSelector((state: RootState) =>
    (state.hotels as RootState['hotels'] & { bookings?: any[] } | undefined)?.bookings ?? []
  );

  const [activeTab, setActiveTab] = useState<'bookings' | 'settings'>('bookings');
  
  const [fullName, setFullName] = useState<string>(user?.full_name || 'Traveler');
  const [email, setEmail] = useState<string>(user?.email || 'traveler@breakaway.co.za');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Filter bookings for current logged-in user
  const userBookings = (bookings || []).filter((b: any) => b.user_id === user?.id || b.userId === user?.id);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      dispatch(setUser({
        ...user,
        full_name: fullName,
        email: email
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="profile-page-wrapper">
        {/* USER PROFILE HEADER BANNER */}
        <header className="profile-banner">
          <div className="profile-user-badge">
            <div className="profile-avatar-circle">
              {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="profile-user-info">
              <h1 className="profile-user-name">{user?.full_name || 'Traveler'}</h1>
              <p className="profile-user-email">{user?.email || 'traveler@breakaway.co.za'}</p>
              <div className="profile-user-role-tag">
                <Shield size={12} />
                <span>{user?.role === 'admin' ? 'Administrator' : 'Verified Traveler'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(logout())}
            className="btn-profile-logout"
          >
            <LogOut size={16} />
            <span>LOGOUT</span>
          </button>
        </header>

        {/* PROFILE TABS (MY BOOKINGS & ACCOUNT SETTINGS) */}
        <div className="profile-tab-bar">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={'profile-tab-btn ' + (activeTab === 'bookings' ? 'active' : '')}
          >
            <Calendar size={16} />
            <span>My Reservations ({userBookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={'profile-tab-btn ' + (activeTab === 'settings' ? 'active' : '')}
          >
            <User size={16} />
            <span>Account Settings</span>
          </button>
        </div>

        {/* TAB 1: RESERVATIONS */}
        {activeTab === 'bookings' && (
          <section className="profile-content-section">
            {userBookings.length > 0 ? (
              <div className="bookings-grid">
                {userBookings.map((b: any, idx: number) => (
                  <div key={b.id || idx} className="booking-card">
                    <div className="booking-card-header">
                      <div>
                        <span className="booking-ref-code">Ref: #{b.id || ('BA-' + (idx + 101))}</span>
                        <h3 className="booking-hotel-name">{b.hotel_name || b.hotelName || 'Luxury Hotel Suite'}</h3>
                      </div>
                      <span className="booking-status-badge">Confirmed</span>
                    </div>

                    <div className="booking-details-list">
                      <div className="booking-detail-row">
                        <Calendar size={14} color="#656839" />
                        <span>Dates: {b.check_in || b.checkIn} &rarr; {b.check_out || b.checkOut}</span>
                      </div>
                      <div className="booking-detail-row">
                        <Clock size={14} color="#656839" />
                        <span>Duration: {b.nights || 3} Nights ({b.guests || 2} Travelers)</span>
                      </div>
                    </div>

                    <div className="booking-card-footer">
                      <div>
                        <span className="booking-total-label">Total Paid (ZAR)</span>
                        <span className="booking-total-amount">R{(b.total_amount || b.totalAmount || 5400).toLocaleString()}</span>
                      </div>
                      <button type="button" className="btn-view-voucher">View Voucher</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty-card">
                <Compass size={48} color="#656839" style={{ margin: '0 auto 1rem' }} />
                <h3 className="empty-title">No Active Reservations</h3>
                <p className="empty-subtitle">
                  Hello {user?.full_name || 'Traveler'}! You haven't made any hotel bookings yet.
                  Explore our luxury suites and resorts across South Africa to plan your next break-away!
                </p>
                <a href="/explore" className="btn-explore-cta">
                  <Building size={16} />
                  <span>EXPLORE ACCOMMODATIONS</span>
                </a>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: ACCOUNT SETTINGS */}
        {activeTab === 'settings' && (
          <section className="profile-content-section">
            <div className="settings-card">
              <h3 className="settings-card-title">Personal Profile Details</h3>
              <p className="settings-card-subtitle">
                Update your registered account name and contact email address.
              </p>

              {saveSuccess && (
                <div className="settings-success-alert">
                  <CheckCircle2 size={16} />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="settings-form">
                <div className="settings-field-group">
                  <label className="settings-field-label">Full Name</label>
                  <div className="settings-input-wrapper">
                    <User size={16} color="#656839" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="settings-input"
                    />
                  </div>
                </div>

                <div className="settings-field-group">
                  <label className="settings-field-label">Email Address</label>
                  <div className="settings-input-wrapper">
                    <Mail size={16} color="#656839" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="settings-input"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-save-settings">
                  Save Changes
                </button>
              </form>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};
