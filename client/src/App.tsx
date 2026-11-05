import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.js';

import { LandingPage } from './pages/LandingPage.js';
import { HotelDetailsPage } from './pages/HotelDetailsPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';

import { AuthModal } from './components/common/AuthModal.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';

export const App: React.FC = () => {
  //Global modal state for Sign In / Sign Up overlay
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  //State to track selected hotel ID for detailed view navigation
  const [selectedHotelId, setSelectedHotelId] = useState<number>(1);

  const handleOpenAuthModal = () => setIsAuthModalOpen(true);
  const handleCloseAuthModal = () => setIsAuthModalOpen(false);

  return (
    <Provider store={store}>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public Routes*/}
            {/* 1. Home Page/Property Listing Grid */}
            <Route 
              path="/" 
              element={
                <LandingPage 
                  onOpenAuthModal={handleOpenAuthModal}
                  onSelectHotel={(id) => {
                    setSelectedHotelId(id);
                    window.location.href = `/hotel/${id}`;
                  }}
                />
              } 
            />

            {/* 2. Hotel Details Page */}
            <Route 
              path="/hotel/:id" 
              element={
               <HotelDetailsPage
                  hotelId={selectedHotelId}
                  onOpenAuthModal={handleOpenAuthModal}
                  onNavigateToCheckout={() => {
                    // Navigate to checkout with state payload
                    window.location.href = '/checkout';
                  }}
                />
              } 
            />

            {/* Protected Routes */}
            {/* 3. Checkout & Payment Gateway (Requires Traveler Login) */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage
                    onNavigateHome={() => { window.location.href = '/'; }}
                    onOpenAuthModal={handleOpenAuthModal}
                  />
                </ProtectedRoute>
              }
            />
            {/* 4. User Profile & My Bookings (Requires Traveler Login) */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage
                    onNavigateHome={() => { window.location.href = '/'; }}
                    onOpenAuthModal={handleOpenAuthModal}
                  />
                </ProtectedRoute>
              } 
            />

            {/* 5. Admin Control Hub (Requires Admin Role) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboardPage onNavigateHome={() => { window.location.href = '/'; }} />
                </ProtectedRoute>
              } 
            />

            {/* Fallback Route: Redirect unknown URLs to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Auth Modal Overlay */}
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={handleCloseAuthModal} 
          />
        </div>
      </Router>
    </Provider>
  );
};

export default App;
