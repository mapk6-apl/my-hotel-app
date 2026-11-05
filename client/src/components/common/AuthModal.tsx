import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../../store/slices/authSlice.js';
import { X } from 'lucide-react'; 

//Explicit TypeScript type definition for AuthModal props
export type AuthModalProps = {
    isOpen: boolean;    //controls visibility of the authentication popup overlay
    onClose: () => void; //this is the callback function to close the modal
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    //initialize Redux dispatch function to update global user & token state
    const dispatch = useDispatch();

    //we keep local state for inputs so typing is immediate and responsive; useEffects not used to avoid re-rendering of states
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    //if modal is inactive
    if (!isOpen) return null;

    //form submission for Sign In or Sign Up
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); //this will prevent a full page refresh
        setErrorMessage(null);
        setLoading(true);

        const endpoint = isSignUp ? 'http://localhost:5001/api/auth/register' : 'http://localhost:5001/api/auth/login';

        const payload = isSignUp ? { email, password, full_name: fullName } : { email, password };

        try {
            //send authentication request to backend
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication request failed');
            }

            dispatch(setToken(data.token)); //dispatch authentication token to Redux & localStorage

            dispatch(setUser(data.user)); //dispatch user profile details to Redux

            onClose(); //close the modal on success
        } catch (err: any) {
            setErrorMessage(err.message || 'An error occurred during authentication'); //set user-friendly error message if authentication fails
        } finally {
            setLoading(false);
        }
    };

    //this wil redirect a traveler to Google OAuth route on backend port 5001
    const handleGoogleSignIn = () => {
        window.location.href = 'http://localhost:5001/api/auth/google';
    };

    return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        
        {/* this is for the close button; using lucide-react icons */}
        <button onClick={onClose} className="auth-close-btn" aria-label="Close Auth Modal"><X size={20} /></button> /

        {/* modal header */}
        <div className="auth-header">
          <h2 className="auth-title">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">{isSignUp ? 'Join Break-Away Hotels & Resorts to unlock exclusive member rates' : 'Sign in to manage your bookings and saved favorites'}</p>
        </div>

        {/* error notificatoin alert */}
        {errorMessage && (
          <div className="auth-error-alert">
            {errorMessage}
          </div>
        )}

        {/* authentication form */}
         <form onSubmit={handleSubmit} className="auth-form">
          
          {/* Render full name input only during registration */}
          {isSignUp && (
            <div className="auth-input-group">
              <label className="auth-label">Full Name</label>
              <input type="text" required placeholder="ex. Mmaphuti Kgomo" value={fullName} onChange={(e) => setFullName(e.target.value)} className="auth-input"/>
            </div>
          )}

          {/* Eemail address input */}
          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <input type="email" required placeholder="mk@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input"/>
          </div>

          {/* password input */}
          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input"/>
          </div>

          {/* submit button; disabled={loading} prevents the user from clicking the button mu;tiple times while an action is processing */}
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* divider */}
        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">Or continue with</span>
        </div>

        {/* third-party SSO buttons; Single Sign-On (meaning a user doesnt have to create new account on my website but they can just sign in with google) */}
        <div className="sso-grid">
          {/* Google SSO button */}
          <button type="button" onClick={handleGoogleSignIn} className="sso-btn sso-btn-google">
            {/* svg means the Google 'G' logo is written directly in raw svg code (colour too) due to strict company guidelines */}
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google</span>
          </button>

          {/* Apple SSO button */}
          <button type="button" onClick={() => alert('Apple SSO authentication configured for production launch')} className="sso-btn sso-btn-apple">
            <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.12-1.95.99-3.08-1 .04-2.22.67-2.93 1.5-.64.74-1.2 1.91-1.05 3.03 1.12.09 2.27-.58 2.99-1.45z"/>
            </svg>
            <span>Apple</span>
          </button>
        </div>
};          