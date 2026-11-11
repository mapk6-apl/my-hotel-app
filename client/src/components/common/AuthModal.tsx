import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setToken, setUser } from '../../store/slices/authSlice.js';
import { X, Sparkles, User, Mail, Lock } from 'lucide-react';
import { API_BASE_URL } from '../../api/axiosClient.js';
import '../../styles/screen2.css';

export type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
};

type AuthResponse = {
  success: true;
  token: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: 'guest' | 'admin';
    avatar_url: string | null;
  };
};

const isAuthResponse = (value: unknown): value is AuthResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Partial<AuthResponse>;
  return Boolean(
    response.success === true &&
    typeof response.token === 'string' &&
    response.user &&
    typeof response.user.id === 'number' &&
    typeof response.user.email === 'string' &&
    typeof response.user.full_name === 'string' &&
    (response.user.role === 'guest' || response.user.role === 'admin')
  );
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAuthSuccess = (userData: AuthResponse['user'], tokenStr: string) => {
    dispatch(setToken(tokenStr));
    dispatch(setUser({
      ...userData,
      avatar_url: userData.avatar_url ?? '',
    }));
    if (onShowToast) {
      onShowToast(
        isSignUp
          ? `Welcome, ${userData.full_name}! Your account is ready.`
          : `Welcome back, ${userData.full_name}! Signed in successfully.`,
        'success'
      );
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const endpoint = isSignUp
      ? `${API_BASE_URL}/auth/register`
      : `${API_BASE_URL}/auth/login`;

    const payload = isSignUp
      ? { email, password, full_name: fullName }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new Error(`The authentication server returned an invalid response (${response.status}).`);
      }

      if (!response.ok) {
        const serverError =
          data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
            ? data.error
            : `Authentication request failed (${response.status}).`;
        throw new Error(serverError);
      }

      if (!isAuthResponse(data)) {
        throw new Error('The authentication server returned an incomplete user profile.');
      }

      handleAuthSuccess(data.user, data.token);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof TypeError
          ? 'Unable to reach the authentication server. Please try again.'
          : error instanceof Error
            ? error.message
            : 'Authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    try {
      sessionStorage.setItem('breakaway-auth-return-location', JSON.stringify({
        pathname: location.pathname,
        search: location.search,
        state: location.state,
      }));
    } catch {
      setErrorMessage('Your current page could not be saved for sign-in. Please try again.');
      return;
    }
    window.location.assign(`${API_BASE_URL}/auth/google`);
  };

  const handleAppleSignIn = () => {
    setErrorMessage('Apple sign-in is not available yet.');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="auth-close-btn"
          aria-label="Close Auth Modal"
        >
          <X size={20} />
        </button>

        <div className="auth-header">
          <div className="auth-badge">
            <Sparkles size={14} />
            <span>ACCOUNT ACCESS</span>
          </div>
          <h2 className="auth-title">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="auth-subtitle">
            {isSignUp
              ? 'Join Break-Away Hotels & Resorts for exclusive rates and rewards'
              : 'Sign in to manage your bookings and saved favorites'}
          </p>
        </div>

        {errorMessage && (
          <div className="auth-error-alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="auth-input-group">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-icon-wrapper">
                <User size={16} color="#656839" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Kayden"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input-styled"
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-icon-wrapper">
              <Mail size={16} color="#656839" />
              <input
                type="email"
                required
                placeholder="kayden@example.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-styled"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-icon-wrapper">
              <Lock size={16} color="#656839" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-styled"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? 'Processing...' : isSignUp ? 'SIGN UP' : 'SIGN IN'}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">Or continue with</span>
        </div>

        <div className="sso-grid">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="sso-btn sso-btn-google"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleAppleSignIn}
            className="sso-btn sso-btn-apple"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.12-1.95.99-3.08-1 .04-2.22.67-2.93 1.5-.64.74-1.2 1.91-1.05 3.03 1.12.09 2.27-.58 2.99-1.45z"/>
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="auth-toggle-container">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="auth-toggle-btn"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
