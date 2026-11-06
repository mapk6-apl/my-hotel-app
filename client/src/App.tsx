import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.js';

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

export const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [toastState, setToastState] = useState<{ message: string; type: ToastType; isOpen: boolean }>({
    message: '',
    type: 'success',
    isOpen: false,
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToastState({ message, type, isOpen: true });
  };

  const closeToast = () => {
    setToastState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <Provider store={store}>
      <Router>
        <div className="app-root">
          <Routes>
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
    </Provider>
  );
};

export default App;
