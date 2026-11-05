import React, { useState } from 'react';
// @ts-ignore -- suppress missing type/module diagnostics when router dependencies are not installed.
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.js';

import { HomePage } from './pages/HomePage.js';
import { HotelDetailsPage } from './pages/HotelDetailsPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';

import { AuthModal } from './components/common/AuthModal.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';

export const App: React.FC = () => {
  //Global modal state for Sign In / Sign Up overlay
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  return (
    <Provider store={store}>
      <Router>
        <div className="app-root">
          <Routes>
            {/* Public Routes*/}
            {/* 1. Home Page/Property Listing Grid */}
            <Route 
              path="/" 
              element={
                <HomePage 
                  onOpenAuthModal={() => setIsAuthOpen(true)}
                  onSelectHotel={(id) => window.location.href = `/hotel/${id}`}
                />
              } 
            />

            {/* 2. Hotel Details Page */}
            <Route 
              path="/hotel/:id" 
              element={
                <HotelDetailsPage 
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
                    onOpenAuthModal={() => setIsAuthOpen(true)}
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
                    onOpenAuthModal={() => setIsAuthOpen(true)}
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
            isOpen={isAuthOpen} 
            onClose={() => setIsAuthOpen(false)} 
          />
        </div>
      </Router>
    </Provider>
  );
};

export default App;
