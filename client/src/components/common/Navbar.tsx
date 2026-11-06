import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store.js';
import { logout } from '../../store/slices/authSlice.js';
import { Heart, Globe, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import '../../styles/screen1.css';

export type NavbarProps = {
  onOpenAuthModal?: () => void;
  onNavigateHome?: () => void;
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal, onNavigateHome }) => {
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { favorites } = useSelector((state: RootState) => state.hotels);

  const [currency, setCurrency] = useState<string>('ZAR (R)');
  const [language, setLanguage] = useState<string>('EN');
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState<boolean>(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* BRAND LOGO */}
        <div 
          className="brand-logo" 
          onClick={onNavigateHome || (() => { window.location.href = '/'; })}
        >
          <span className="logo-badge">BA</span>
          <span>
            BREAK-AWAY <span className="logo-text-light">HOTELS</span>
          </span>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="nav-links">
          <a href="/" className="nav-link">HOME</a>
          <a href="/explore" className="nav-link">EXPLORE</a>
          <a href="/about" className="nav-link">ABOUT</a>

          {/* FAVORITES COUNT BADGE */}
          <a href="/favorites" className="nav-link favorites-link">
            <span>FAVORITES</span>
            {favorites && favorites.length > 0 && (
              <span className="favorites-counter">{favorites.length}</span>
            )}
          </a>

          {/* ADMIN LINK (ONLY VISIBLE FOR ADMIN ROLES) */}
          {isAuthenticated && user?.role === 'admin' && (
            <a href="/admin" className="nav-link admin-nav-tag">
              <Shield size={12} className="inline mr-1" />
              <span>ADMIN</span>
            </a>
          )}
        </div>

        {/* AUTHENTICATION & REGION CONTROLS */}
        <div className="nav-actions">
          {/* CURRENCY & LANGUAGE SELECTOR TAG (PROTOTYPE DESIGN) */}
          <div className="region-selector-wrapper">
            <button
              type="button"
              onClick={() => setIsRegionMenuOpen(!isRegionMenuOpen)}
              className="currency-tag-btn"
            >
              <Globe size={13} color="#CBD0B9" />
              <span>{currency} | {language}</span>
              <ChevronDown size={12} color="#CBD0B9" />
            </button>

            {isRegionMenuOpen && (
              <div className="region-dropdown-popover">
                <div className="popover-section-label">Select Currency</div>
                <div className="popover-btn-group">
                  {['ZAR (R)', 'USD ($)', 'EUR (€)'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setCurrency(c); setIsRegionMenuOpen(false); }}
                      className={'popover-opt-btn ' + (currency === c ? 'active' : '')}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="popover-section-label">Select Language</div>
                <div className="popover-btn-group">
                  {[
                    { code: 'EN', label: 'English' },
                    { code: 'AF', label: 'Afrikaans' },
                    { code: 'ZU', label: 'isiZulu' }
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { setLanguage(l.code); setIsRegionMenuOpen(false); }}
                      className={'popover-opt-btn ' + (language === l.code ? 'active' : '')}
                    >
                      {l.code} - {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* USER AUTH SUMMARY */}
          {isAuthenticated && user ? (
            <div className="user-profile-summary">
              <a href="/profile" className="user-name-link" title="View Profile">
                <User size={14} color="#BDDBD0" />
                <span>{user.full_name || 'Traveler'}</span>
              </a>
              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="btn-auth-logout"
                title="Logout"
              >
                <LogOut size={13} />
                <span>LOGOUT</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="btn-auth-signin"
            >
              SIGN IN
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
