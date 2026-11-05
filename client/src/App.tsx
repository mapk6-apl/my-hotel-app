import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store.js';

// Import All Page Components
import { LandingPage } from './pages/LandingPage.js';
import { FavoritesPage } from './pages/FavoritesPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { HotelDetailsPage } from './pages/HotelDetailsPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';

// Import Common Components & Guards
import { AuthModal } from './components/common/AuthModal.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';

export const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [selectedHotelId, setSelectedHotelId] = useState<number>(1);

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
                  onSelectHotel={(id) => {
                    setSelectedHotelId(id);
                    window.location.href = `/hotel/${id}`;
                  }}
                />
              } 
            />

            {/* 2. Favorites Page */}
            <Route 
              path="/favorites" 
              element={
                <FavoritesPage 
                  onOpenAuthModal={() => setIsAuthOpen(true)}
                  onSelectHotel={(id) => {
                    setSelectedHotelId(id);
                    window.location.href = `/hotel/${id}`;
                  }}
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

            {/* 4. Hotel Details Page */}
            <Route 
              path="/hotel/:id" 
              element={
                <HotelDetailsPage 
                  hotelId={selectedHotelId}
                  onOpenAuthModal={() => setIsAuthOpen(true)}
                  onNavigateToCheckout={() => {
                    window.location.href = '/checkout';
                  }}
                />
              } 
            />

            {/* 5. Checkout & Payment Gateway */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <CheckoutPage
                    onNavigateHome={() => {
                      window.location.href = '/';
                    }}
                    onOpenAuthModal={() => setIsAuthOpen(true)}
                  />
                </ProtectedRoute>
              } 
            />

            {/* 6. User Profile & My Bookings */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage
                    onNavigateHome={() => {
                      window.location.href = '/';
                    }}
                    onOpenAuthModal={() => setIsAuthOpen(true)}
                  />
                </ProtectedRoute>
              } 
            />

            {/* 7. Admin Dashboard */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboardPage
                    onNavigateHome={() => {
                      window.location.href = '/';
                    }}
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
          />
        </div>
      </Router>
    </Provider>
  );
};

export default App;