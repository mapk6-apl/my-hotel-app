import React, { useState } from 'react';
import { Calendar, Heart, User, Settings, LogOut, Clock, MapPin, CreditCard } from 'lucide-react'; // Using Lucide React icons
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { logout } from '../store/slices/authSlice.js';
import { type RootState } from '../store/store.js';
import '../styles/screen5.css';

export type ProfilePageProps = {
  onNavigateHome: () => void;
  onOpenAuthModal: () => void;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigateHome, onOpenAuthModal }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { favorites } = useSelector((state: RootState) => state.hotels);

  //Active Tab state (bookings, favorites, settings)
  const [activeTab, setActiveTab] = useState<'bookings' | 'favorites' | 'account'>('bookings');

  return (
    <div className="page-container">
      <Navbar onOpenAuthModal={onOpenAuthModal} onNavigateHome={onNavigateHome} />

      <main className="main-content-layout">
        
        {/* Left: profile tabs sidebar */}
        <aside style={{ width: '100%' }} className="lg:w-64 shrink-0">
          
          {/* Profile user header card */}
          <div className="profile-header-card" style={{ flexDirection: 'column', textAlign: 'center', padding: '1.5rem' }}>
            <div className="profile-avatar-circle" style={{ margin: '0 auto' }}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="profile-name" style={{ fontSize: '1.125rem' }}>{user?.full_name || 'User 1'}</h2>
              <p className="profile-email">{user?.email || 'user1@example.com'}</p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="profile-tabs-sidebar">
            <button onClick={() => setActiveTab('bookings')} className={`profile-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} >
              <Calendar size={18} />
              <span>My Bookings</span>
            </button>

            <button onClick={() => setActiveTab('favorites')}  className={`profile-tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}>
              <Heart size={18} />
              <span>Favourites ({favorites.length})</span>
            </button>

            <button onClick={() => setActiveTab('account')} className={`profile-tab-btn ${activeTab === 'account' ? 'active' : ''}`}>
              <User size={18} />
              <span>Account Settings</span>
            </button>

            <button onClick={() => dispatch(logout())} className="profile-tab-btn" style={{ color: '#e11d48', marginTop: '1rem' }}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

        </aside>

        {/* Right: main tab content*/}
        <section style={{ flex: 1 }}>
          
          {/* Tab 1: My Booking History*/}
          {activeTab === 'bookings' && (
            <div>
              <h2 className="filter-title" style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}> Reservation History</h2>

              {/* Upcoming stay card */}
              <div className="booking-history-card">
                <div>
                  <span className="status-tag confirmed">Upcoming Stay</span>
                  <h3 style={{ fontWeight: 800, fontSize: '1.125rem', margin: '0.35rem 0 0.1rem', color: 'var(--dark-khaki)' }}>
                    Hotel 1
                  </h3>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={12} color="#656839" />
                    <span>Polokwane, South Africa</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={12} color="#656839" />
                    <span>24 Oct 2026 - 28 Oct 2026 (4 Nights)</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--dark-khaki)', display: 'block' }}>
                    R8,370
                  </span>
                  <button className="btn-view-details" style={{ marginTop: '0.5rem' }}>
                    View Voucher
                  </button>
                </div>
              </div>

              {/* Past stay card*/}
              <div className="booking-history-card">
                <div>
                  <span className="status-tag completed">Completed Stay</span>
                  <h3 style={{ fontWeight: 800, fontSize: '1.125rem', margin: '0.35rem 0 0.1rem', color: 'var(--dark-khaki)' }}>
                    Cape Town Bay Resort
                  </h3>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={12} color="#656839" />
                    <span>Cape Town, South Africa</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={12} color="#656839" />
                    <span>10 Aug 2026 - 14 Aug 2026 (4 Nights)</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--dark-khaki)', display: 'block' }}>
                    R12,400
                  </span>
                  <button className="btn-view-details" style={{ marginTop: '0.5rem', backgroundColor: 'var(--dark-khaki)' }}>
                    Book Again
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Tab 2: Favorites */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="filter-title" style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
                Saved Properties ({favorites.length})
              </h2>
              {favorites.length === 0 ? (
                <div style={{ backgroundColor: 'var(--ash-grey)', padding: '2.5rem', borderRadius: '16px', textAlign: 'center' }}>
                  You haven't saved any break-away properties yet.
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: 'var(--dark-khaki)' }}>
                  You have {favorites.length} property saved to your favorites.
                </div>
              )}
            </div>
          )}