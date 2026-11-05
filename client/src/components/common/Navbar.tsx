// client/src/components/common/Navbar.tsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store.js';
import { logout } from '../../store/slices/authSlice.js';
import { Heart, Globe, DollarSign, X } from 'lucide-react';
import '../../styles/screen1.css';

export type NavbarProps = {
    onOpenAuthModal?: () => void;
    onNavigateHome?: () => void;
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal, onNavigateHome }) => {
    const dispatch = useDispatch();

    // Extract user authentication state and favourite property list from Redux
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const { favorites } = useSelector((state: RootState) => state.hotels);

    // Regional settings state (Defaulted for South Africa as requested)
    const [currency, setCurrency] = useState<string>('ZAR (R)');
    const [language, setLanguage] = useState<string>('EN');
    const [isRegionModalOpen, setIsRegionModalOpen] = useState<boolean>(false);

    return (
        <nav className="navbar">
            <div className="nav-container">
                {/* BRAND LOGO: clicking takes user back to home page */}
                <div 
                  className="brand-logo" 
                  onClick={onNavigateHome || (() => { window.location.href = '/'; })}
                >
                    <span className="logo-badge">BA</span>
                    <span>BREAK-AWAY <span className="logo-text-light">HOTELS</span></span>
                </div>

                {/* NAVIGATION LINKS */}
                <div className="nav-links">
                    <a href="/" className="nav-link">HOME</a>
                    <a href="#explore" className="nav-link">EXPLORE</a>
                    <a href="#about" className="nav-link">ABOUT</a>

                    {/* FAVORITES COUNT BADGE */}
                    <a href="/favorites" className="nav-link">
                        <span>FAVORITES</span>
                        {favorites && favorites.length > 0 && (
                            <span className="favorites-counter">{favorites.length}</span>
                        )}
                    </a>

                    {/* ADMIN DASHBOARD LINK (FOR ADMIN USERS) */}
                    {isAuthenticated && user?.role === 'admin' && (
                        <a href="/admin" className="nav-link">ADMIN</a>
                    )}
                </div>

                {/* AUTHENTICATION & REGION CONTROLS */}
                <div className="nav-actions"> 
                    {/* CLICKABLE CURRENCY & LANGUAGE SELECTOR */}
                    <button 
                      type="button"
                      onClick={() => setIsRegionModalOpen(true)}
                      className="currency-tag-btn"
                      title="Change Currency and Language"
                    >
                        <Globe size={13} className="inline mr-1" />
                        <span>{currency} | {language}</span>
                    </button> 
                    
                    {isAuthenticated && user ? ( 
                        <div className="user-profile-summary"> 
                            <a href="/profile" className="user-name">
                                {user.full_name || 'User 1'}
                            </a>  
                            <button onClick={() => dispatch(logout())} className="btn-auth-signin">
                                LOGOUT
                            </button>
                        </div> 
                    ) : (  
                        <button onClick={onOpenAuthModal} className="btn-auth-signin">
                            SIGN IN
                        </button>
                    )} 
                </div>
            </div>

            {/* INTERACTIVE CURRENCY & LANGUAGE REGIONAL MODAL */}
            {isRegionModalOpen && (
                <div className="region-modal-overlay" onClick={() => setIsRegionModalOpen(false)}>
                    <div className="region-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="region-modal-header">
                            <h3>Regional Settings</h3>
                            <button onClick={() => setIsRegionModalOpen(false)} className="region-close-btn">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="region-section">
                            <label className="region-label">Currency (Default: South Africa)</label>
                            <div className="region-options-grid">
                                {['ZAR (R)', 'USD ($)', 'EUR (€)'].map((curr) => (
                                    <button
                                        key={curr}
                                        type="button"
                                        onClick={() => setCurrency(curr)}
                                        className={`region-opt-btn ${currency === curr ? 'active' : ''}`}
                                    >
                                        {curr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="region-section">
                            <label className="region-label">Language</label>
                            <div className="region-options-grid">
                                {[
                                    { code: 'EN', name: 'English' },
                                    { code: 'AF', name: 'Afrikaans' },
                                    { code: 'ZU', name: 'isiZulu' }
                                ].map((lang) => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => setLanguage(lang.code)}
                                        className={`region-opt-btn ${language === lang.code ? 'active' : ''}`}
                                    >
                                        {lang.code} - {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="button" 
                            onClick={() => setIsRegionModalOpen(false)}
                            className="btn-search-submit"
                            style={{ marginTop: '1rem' }}
                        >
                            SAVE REGIONAL SETTINGS
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};
