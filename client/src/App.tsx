import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.js';

import { LandingPage } from './pages/LandingPage.js';
import { HotelDetailsPage } from './pages/HotelDetailsPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { AboutPage } from './pages/AboutPage.js';

import { AuthModal } from './components/common/AuthModal.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { Toast, type ToastType } from './components/common/Toast.js';

export const App: React.FC = () => {
  //Global modal state for Sign In / Sign Up overlay
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  //State to track selected hotel ID for detailed view navigation
  const [selectedHotelId, setSelectedHotelId] = useState<number>(1);

  const handleOpenAuthModal = () => setIsAuthModalOpen(true);
  const handleCloseAuthModal = () => setIsAuthModalOpen(false);
  // Toast notification state
  const [toastState, setToastState] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToastState({ message, type, isVisible: true });
  };

  const handleCloseToast = () => {
    setToastState((prev) => ({ ...prev, isVisible: false }));
  };

 return (
    <Provider store={store}>
      <Router>
        <div className="app-container">
          
          <Routes>
            {/* 1. STANDALONE LANDING HERO PAGE AT "/" */}
            <Route
              path="/"
              element={
                <LandingPage
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  onSelectHotel={(id) => {
                    setSelectedHotelId(id);
                    window.location.href = `/hotel/${id}`;
                  }}
                />
              }
            />

            {/* 2. FAVORITES PAGE AT "/favorites" */}
            <Route
              path="/favorites"
              element={
                <FavoritesPage
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  onSelectHotel={(id) => {
                    setSelectedHotelId(id);
                    window.location.href = `/hotel/${id}`;
                  }}
                />
              }
            />

            {/* 3. ABOUT PAGE AT "/about" */}
            <Route
              path="/about"
              element={
                <AboutPage
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              }
            />

            {/* 4. HOTEL DETAILS PAGE */}
            <Route
              path="/hotel/:id"
              element={
                <HotelDetailsPage
                  hotelId={selectedHotelId}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  onNavigateToCheckout={() => {
                    window.location.href = '/checkout';
                  }}
                />
              }
            />

            {/* 5. PROTECTED CHECKOUT ROUTE */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage
                    onBookingComplete={() => {
                      showToast('Reservation confirmed successfully!', 'success');
                      setTimeout(() => {
                        window.location.href = '/profile';
                      }, 1000);
                    }}
                  />
                </ProtectedRoute>
              }
            />

            {/* 6. PROTECTED USER PROFILE */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* 7. PROTECTED ADMIN DASHBOARD */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* FALLBACK ROUTE */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* GLOBAL AUTHENTICATION MODAL */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />

          {/* GLOBAL TOAST NOTIFICATION */}
          <Toast
            message={toastState.message}
            type={toastState.type}
            isVisible={toastState.isVisible}
            onClose={handleCloseToast}
          />

        </div>
      </Router>
    </Provider>
  );
};

export default App;
