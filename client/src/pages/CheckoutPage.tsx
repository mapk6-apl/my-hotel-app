import React, { useState } from 'react';
import {CreditCard, Lock, CheckCircle2, User, Mail, Phone, ShieldCheck, Calendar,Building } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import '../styles/screen4.css';

export type CheckoutPageProps = {
  onNavigateHome: () => void;
  onOpenAuthModal: () => void;
};