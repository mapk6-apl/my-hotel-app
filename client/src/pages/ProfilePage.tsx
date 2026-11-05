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