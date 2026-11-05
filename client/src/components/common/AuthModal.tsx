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
};          