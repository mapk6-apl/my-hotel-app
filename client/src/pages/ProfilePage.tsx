// client/src/pages/ProfilePage.tsx

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { logout, setUser } from '../store/slices/authSlice.js';
import type { RootState, AppDispatch } from '../store/store.js';
import { User, Mail, Calendar, Compass, Shield, LogOut, CheckCircle2, Building, Clock } from 'lucide-react';
import { fetchUserBookings } from '../store/slices/bookingSlice.js';
import axiosClient from '../api/axiosClient.js';
import '../styles/screen5.css';

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { myBookings, loading: bookingsLoading, error: bookingsError } = useSelector((state: RootState) => state.bookings);

  const [activeTab, setActiveTab] = useState<'bookings' | 'settings'>('bookings');
  
  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const confirmLogout = () => {
    dispatch(logout());
    setIsLogoutConfirmOpen(false);
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { message: 'You have been signed out.', type: 'success' },
    }));
    navigate('/', { replace: true });
  };

  useEffect(() => {
    void dispatch(fetchUserBookings());
  }, [dispatch]);

  useEffect(() => {
    setFullName(user?.full_name || '');
    setPhone(user?.phone || '');
  }, [user?.full_name, user?.phone]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    if (!fullName.trim()) {
    setSaveError('Enter your name before saving.');
    return;
    }
    try {
    const response = await axiosClient.put<{ user: NonNullable<typeof user> }>('/users/profile', {
      fullName: fullName.trim(),
      phone: phone.trim(),
      });
      if (!user || !response.data.user) throw new Error('The server did not return the updated account.');
      dispatch(setUser(response.data.user));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: unknown) {
      setSaveError(axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data?.error || error.message
        : error instanceof Error ? error.message : 'Unable to save account settings.');
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
              <p className="profile-user-email">{user?.email || 'Account email unavailable'}</p>
              <div className="profile-user-role-tag">
                <Shield size={12} />
                <span>{user?.role === 'admin' ? 'Administrator' : 'Traveler'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
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
            <span>My Reservations ({myBookings.length})</span>
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
            {bookingsLoading ? (
              <p role="status">Loading your reservations…</p>
            ) : bookingsError ? (
              <div role="alert">
                <p>Your reservations could not be loaded: {bookingsError}</p>
                <button type="button" className="btn-search-submit" onClick={() => void dispatch(fetchUserBookings())}>Try again</button>
              </div>
            ) : myBookings.length > 0 ? (
              <div className="bookings-grid">
                {myBookings.map((b) => (
                  <div key={b.reservation_id} className="booking-card">
                    <div className="booking-card-header">
                      <div>
                        <span className="booking-ref-code">Ref: #{b.reservation_id}</span>
                        <h3 className="booking-hotel-name">{b.hotel_name}</h3>
                      </div>
                      <span className="booking-status-badge">{b.status}</span>
                    </div>

                    <div className="booking-details-list">
                      <div className="booking-detail-row">
                        <Calendar size={14} color="#656839" />
                        <span>Dates: {b.check_in} &rarr; {b.check_out}</span>
                      </div>
                      <div className="booking-detail-row">
                        <Clock size={14} color="#656839" />
                        <span>{b.room_type} · {b.guest_count} travellers</span>
                      </div>
                    </div>

                    <div className="booking-card-footer">
                      <div>
                        <span className="booking-total-label">Reservation total (ZAR)</span>
                        <span className="booking-total-amount">R{Number(b.total_amount).toLocaleString()}</span>
                      </div>
                      <button type="button" className="btn-view-voucher" onClick={() => setExpandedBookingId(expandedBookingId === b.reservation_id ? null : b.reservation_id)}>
                        {expandedBookingId === b.reservation_id ? 'Hide details' : 'View details'}
                      </button>
                    </div>
                    {expandedBookingId === b.reservation_id && (
                      <div className="booking-details-list">
                        <p>Payment status: {b.payment_status}</p>
                        <p>Guest: {b.guest_name} ({b.guest_email})</p>
                        <p>City: {b.city}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty-card">
                <Compass size={48} color="#656839" style={{ margin: '0 auto 1rem' }} />
                <h3 className="empty-title">No Active Reservations</h3>
                <p className="empty-subtitle">
                  You have not made a reservation yet. Browse properties and room rates to get started.
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
              Update your account name and phone number. Email address is managed by your sign-in provider.
              </p>

              {saveSuccess && (
                <div className="settings-success-alert">
                  <CheckCircle2 size={16} />
                  <span>Profile updated successfully!</span>
                </div>
              )}
              {saveError && <p role="alert" className="auth-error-alert">{saveError}</p>}

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
                    <span className="settings-input">{user?.email}</span>
                  </div>
                </div>
                <div className="settings-field-group">
                  <label className="settings-field-label">Phone Number</label>
                  <div className="settings-input-wrapper">
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="settings-input" />
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
      {isLogoutConfirmOpen && (
        <div className="auth-modal-overlay" role="presentation">
          <section className="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="profile-logout-title">
            <h2 id="profile-logout-title" className="auth-title">Sign out?</h2>
            <p className="auth-subtitle">You can sign in again at any time.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn-reset" onClick={() => setIsLogoutConfirmOpen(false)}>Stay signed in</button>
              <button type="button" className="btn-search-submit" onClick={confirmLogout}>Sign out</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
