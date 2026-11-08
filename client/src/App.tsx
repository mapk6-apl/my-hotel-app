import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice.js';
import { setToken } from './store/slices/authSlice.js';
import type { AppDispatch, RootState } from './store/store.js';

// Import Page Components
import { LandingPage } from './pages/LandingPage.js';
import { ExplorePage } from './pages/ExplorePage.js';
import { AboutPage } from './pages/AboutPage.js';
import { FavoritesPage } from './pages/FavoritesPage.js';
import { HotelDetailsPage } from './pages/HotelDetailsPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';

// Import Common Components & Guards
import { AuthModal } from './components/common/AuthModal.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { Toast, type ToastType } from './components/common/Toast.js';
import { API_BASE_URL } from './api/axiosClient.js';

const GoogleAuthCallbackPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  const started = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(location.hash.slice(1));
    const code = params.get('code');
    const callbackError = params.get('error');

    window.history.replaceState(window.history.state, '', `${location.pathname}${location.search}`);

    if (callbackError || !code) {
      setErrorMessage('Google sign-in was cancelled or could not be completed. Please try again.');
      return;
    }

    const completeGoogleSignIn = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/google/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data: unknown = await response.json();

        if (
          !response.ok ||
          !data ||
          typeof data !== 'object' ||
          !('token' in data) ||
          typeof data.token !== 'string'
        ) {
          const serverError =
            data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
              ? data.error
              : 'Unable to complete Google sign-in. Please try again.';
          throw new Error(serverError);
        }

        dispatch(setToken(data.token));
        const user = await dispatch(fetchCurrentUser()).unwrap();
        navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
      } catch (error: unknown) {
        setErrorMessage(
          error instanceof TypeError
            ? 'Unable to reach the authentication server. Please try again.'
            : error instanceof Error
              ? error.message
              : 'Google sign-in failed. Please try again.'
        );
      }
    };

    void completeGoogleSignIn();
  }, [dispatch, location.pathname, location.search, navigate]);

  return (
    <div className="auth-modal-overlay">
      <main className="auth-modal-card" aria-live="polite">
        <div className="auth-header">
          <h1 className="auth-title">{errorMessage ? 'Google Sign-In Unavailable' : 'Signing You In'}</h1>
          <p className="auth-subtitle">
            {errorMessage ? 'Your account has not been changed.' : 'Please wait while we securely verify your account.'}
          </p>
        </div>
        {errorMessage ? (
          <>
            <div className="auth-error-alert">{errorMessage}</div>
            <button type="button" className="auth-submit-btn" onClick={() => navigate('/', { replace: true })}>
              Return to the site
            </button>
          </>
        ) : (
          <div role="status">Verifying Google sign-in…</div>
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user, loading } = useSelector((state: RootState) => state.auth);

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [toastState, setToastState] = useState<{ message: string; type: ToastType; isOpen: boolean }>({
    message: '',
    type: 'success',
    isOpen: false,
  });

  useEffect(() => {
    if (token && !user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, user, loading]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToastState({ message, type, isOpen: true });
  };

  const closeToast = () => {
    setToastState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <Router>
      <div className="app-root">
          <Routes>
            <Route path="/auth/callback" element={<GoogleAuthCallbackPage />} />

            {/* 1. Root / Landing Page */}
            <Route
              path="/"
              element={
                <LandingPage
                  onOpenAuthModal={() => setIsAuthOpen(true)}
                  onSelectHotel={(id) => { window.location.href = `/hotel/${id}`; }}
                />
              }
            />

            {/* 2. Explore Page */}
            <Route
              path="/explore"
              element={
                <ExplorePage
                  onOpenAuthModal={() => setIsAuthOpen(true)}
                  onSelectHotel={(id) => { window.location.href = `/hotel/${id}`; }}
                />
              }
            />

            {/* 3. About Page */}
            <Route
              path="/about"
              element={
                <AboutPage
                  onOpenAuthModal={() => setIsAuthOpen(true)}
                />
              }
            />

            {/* 4. Favorites Page */}
            <Route
              path="/favorites"
              element={
                <FavoritesPage
                  onOpenAuthModal={() => setIsAuthOpen(true)}
                  onSelectHotel={(id) => { window.location.href = `/hotel/${id}`; }}
                />
              }
            />

            {/* 5. Hotel Details Page */}
            <Route
              path="/hotel/:id"
              element={
                <HotelDetailsPage
                  onOpenAuthModal={() => setIsAuthOpen(true)}
                  onNavigateToCheckout={() => { window.location.href = '/checkout'; }}
                />
              }
            />

            {/* 6. Checkout Page */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage
                    onNavigateHome={() => { window.location.href = '/'; }}
                    onOpenAuthModal={() => setIsAuthOpen(true)}
                  />
                </ProtectedRoute>
              }
            />

            {/* 7. Profile & Bookings Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* 8. Admin Control Hub */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboardPage
                    onNavigateHome={() => { window.location.href = '/'; }}
                  />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Auth Modal Overlay */}
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onShowToast={showToast}
          />

          {/* Global Toast Notifications */}
          <Toast
            message={toastState.message}
            type={toastState.type}
            isOpen={toastState.isOpen}
            onClose={closeToast}
          />
        </div>
      </Router>
  );
};

export default App;
