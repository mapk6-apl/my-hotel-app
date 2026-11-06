import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store.js';

//Define explicit TypeScript props for ProtectedRoute
export type ProtectedRouteProps = {
  children: React.ReactNode;
  adminOnly?: boolean; //Optional flag to restrict access exclusively to Admin role
};

// The ProtectedRoute Component guards sensitive application pages and checks Redux state for token/authentication status.
//If unauthenticated, it redirects a user to Home ('/') while preserving original location in state.
//If adminOnly is true, it verifies that user.role === 'admin'.

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const location = useLocation();

  //Extract authentication status and current user profile from Redux store
  const { isAuthenticated, user, token, loading } = useSelector((state: RootState) => state.auth);

  if (loading || (token && !user)) {
    return <div style={{ padding: '1rem', color: '#2f3a2a' }}>Loading your session...</div>;
  }

  // 1. Unauthenticated check: Redirect to home if user is not logged in
  if (!isAuthenticated && !token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Authorization check: If admin route, verify user has admin privileges
  if (adminOnly && user?.role !== 'admin') {
    //If regular traveler attempts to access admin route, redirect to home page
    return <Navigate to="/" replace />;
  }

  // 3. Authorized: Render protected children components
  return <>{children}</>;
};
