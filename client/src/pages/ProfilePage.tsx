import React, { useState } from 'react';
import { Calendar, Heart, User, Settings, LogOut, Clock, MapPin, CreditCard } from 'lucide-react'; // Using Lucide React icons
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { logout } from '../store/slices/authSlice.js';
import { type RootState } from '../store/store.js';
import '../styles/screen5.css';

export type ProfilePageProps = {
  onNavigateHome: () => void;
  onOpenAuthModal: () => void;
};