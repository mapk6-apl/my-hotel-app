import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store.js';
import { logout } from '../../store/slices/authSlice.js';
import { Heart, Globe, User, LogOut, Shield, ChevronDown, Menu, X } from 'lucide-react';
import '../../styles/screen1.css';

export type NavbarProps = {
  onOpenAuthModal?: () => void;
  onNavigateHome?: () => void;
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal, onNavigateHome }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { favorites } = useSelector((state: RootState) => state.hotels);

  const [language, setLanguage] = useState<string>(() => localStorage.getItem('app-language') || 'EN');
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const confirmLogout = () => {
    dispatch(logout());
    setIsLogoutConfirmOpen(false);
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { message: 'You have been signed out.', type: 'success' },
    }));
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className={`nav-container ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
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
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-nav-open' : ''}`}>
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
              <span>ZAR (R) | {language}</span>
              <ChevronDown size={12} color="#CBD0B9" />
            </button>

            {isRegionMenuOpen && (
              <div className="region-dropdown-popover">
                <div className="popover-section-label">Currency</div>
                <p className="popover-opt-btn active">ZAR (R) · currency conversion is not configured</p>

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
                      onClick={() => {
                        setLanguage(l.code);
                        localStorage.setItem('app-language', l.code);
                        document.documentElement.lang = l.code.toLowerCase();
                        setIsRegionMenuOpen(false);
                      }}
                      className={'popover-opt-btn ' + (language === l.code ? 'active' : '')}
                    >
                      {l.code} - {l.label}
                    </button>
                  ))}
                </div>
                <p className="popover-language-note">Language choice is saved, but translated interface text is not available yet.</p>
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
                onClick={() => setIsLogoutConfirmOpen(true)}
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
      {isLogoutConfirmOpen && (
        <div className="auth-modal-overlay" role="presentation">
          <section className="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
            <h2 id="logout-confirm-title" className="auth-title">Sign out?</h2>
            <p className="auth-subtitle">You can sign in again at any time.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn-reset" onClick={() => setIsLogoutConfirmOpen(false)}>Stay signed in</button>
              <button type="button" className="btn-search-submit" onClick={confirmLogout}>Sign out</button>
            </div>
          </section>
        </div>
      )}
    </nav>
  );
};
