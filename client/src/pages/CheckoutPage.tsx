import React, { useState } from 'react';
import {CreditCard, Lock, CheckCircle2, User, Mail, Phone, ShieldCheck, Calendar,Building } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import '../styles/screen4.css';

export type CheckoutPageProps = {
  onNavigateHome: () => void;
  onOpenAuthModal: () => void;
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigateHome, onOpenAuthModal }) => {
  //1 = Reservation Details & Payment, 2 = Confirmation Success
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Local form state for guest and payment details
  const [fullName, setFullName] = useState<string>('John Doe');
  const [email, setEmail] = useState<string>('john.doe@example.com');
  const [phone, setPhone] = useState<string>('+27 82 123 4567');
  const [cardName, setCardName] = useState<string>('John Doe');
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8892');
  const [expiry, setExpiry] = useState<string>('08/28');
  const [cvv, setCvv] = useState<string>('342');

  //Payment gateway submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    //simulate backend payment authorization delay (1.5s)
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(2); //transition to Step 2: Confirmation
    }, 1500);
  };