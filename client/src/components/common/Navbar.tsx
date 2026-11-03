import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store.js';
import { logout } from '../../store/slices/authSlice.js';

//callback props ar optional (?) to prevent runtime errors if a parent component doesn't pass them
export type NavbarProps = {
    onOpenAuthModal?: () => void;
    onNavigateHome?: () => void;
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuthModal, onNavigateHome }) => {
    const dispatch = useDispatch(); //initialize Redux dispatch function to trigger actions. ex. logging out.

    // Extract user authentication state and favourite property list from the global Redux store. 
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const { favorites } = useSelector((state: RootState) => state.hotels);

    return (
        <nav className="navbar">
            <div className="nav-container">
                {/* clicking the app logo will take a user back to the home page/view */}
                <div className="brand-logo" onClick={onNavigateHome || (() => { window.location.href = '/'; })}>
                    <span className="logo-badge">BA</span>
                    <span>BREAK-AWAY <span className="logo-text-light">HOTELS</span>
                    </span>
                </div>

                {/* navigation links */}
                <div className="nav-links">
                    <a href="/" className="nav-link">HOME</a>
                    <a href="#explore" className="nav-link">EXPLORE</a>
                    <a href="#about" className="nav-link">ABOUT</a>

                    {/* favourites count badge */}
                    <a href="/favorites" className="nav-link">
                        <span>FAVORITES</span>
                        {favorites.length > 0 && (
                            <span>{favorites.length}</span>
                        )}
                    </a>
                </div>

                {/* authentication & region controls */}
                <div className="nav-actions"> 
                    <span className="currency-tag">ZAR (R) | EN</span> 
                    
                    {isAuthenticated && user ? ( 
                        <div className="user-profile-summary"> 
                        <span className="user-name">{user.full_name || 'User 1'}</span>  
                        
                        <button onClick={() => dispatch(logout())} className="btn-auth-signin">LOGOUT</button>
                        </div> 
                    ) : (  
                        <button onClick={onOpenAuthModal} className="btn-auth-signin">SIGN IN</button>
                    )} </div>
            </div>
        </nav>
    );

};