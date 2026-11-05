import React, { useState } from 'react';
import { Building, Calendar, DollarSign, TrendingUp, LogOut, Home, ShieldCheck 
} from 'lucide-react'; // Using Lucide React icons
import { PropertiesTable } from '../components/admin/PropertiesTable.js';
import { ReservationsTable } from '../components/admin/ReservationsTable.js';
import { AccommodationModal } from '../components/admin/AccommodationModal.js';
import '../styles/screen6.css';

export type AdminDashboardPageProps = {
  onNavigateHome: () => void;
};