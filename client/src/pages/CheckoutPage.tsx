import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, User, Mail, Phone, ShieldCheck, Calendar, Building } from 'lucide-react';
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

    return (
        <div className="page-container">
            <Navbar onOpenAuthModal={onOpenAuthModal} onNavigateHome={onNavigateHome} />

            <main className="main-content-layout" style={{ flexDirection: 'column' }}>

                {/* progress step bar*/}
                <div className="checkout-steps-bar">
                    <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
                        <span className="step-number-badge">1</span>
                        <span>Reservation & Guest Details</span>
                    </div>

                    <div className="step-connector-line"></div>

                    <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
                        <span className="step-number-badge">2</span>
                        <span>Payment Gateway</span>
                    </div>

                    <div className="step-connector-line"></div>

                    <div className={`step-item ${currentStep === 2 ? 'active' : ''}`}>
                        <span className="step-number-badge">3</span>
                        <span>Confirmation</span>
                    </div>
                </div>

                {/* Step 1: Guest details and payment form */}
                {currentStep === 1 ? (
                    <form onSubmit={handlePaymentSubmit} className="checkout-layout-grid">

                        {/* Left: guest and financial inouts*/}
                        <div>
                            {/* GUEST DETAILS CARD */}
                            <div className="checkout-form-card">
                                <h2 className="checkout-card-header">
                                    <User size={18} color="#656839" />
                                    <span>1. Guest Information</span>
                                </h2>

                                <div className="checkout-form-grid">
                                    <div className="form-full-width">
                                        <label className="filter-label">Full Name</label>
                                        <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="filter-input-text" />
                                    </div>

                                    <div>
                                        <label className="filter-label">Email Address</label>
                                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="filter-input-text" />
                                    </div>

                                    <div>
                                        <label className="filter-label">Phone Number</label>
                                        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="filter-input-text" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Gateway Card*/}
              <div className="checkout-form-card">
                <h2 className="checkout-card-header">
                  <CreditCard size={18} color="#656839" />
                  <span>2. Payment Gateway (Credit / Debit Card)</span>
                </h2>

                <p style={{ fontSize: '0.75rem', color: 'rgba(81, 75, 35, 0.8)', marginBottom: '1rem' }}>
                  Transactions are encrypted with 256-bit SSL security.
                </p>

                <div className="credit-card-inputs-wrapper">
                  <div className="checkout-form-grid">
                    <div className="form-full-width">
                      <label className="filter-label">Cardholder Name</label>
                      <input type="text" required value={cardName} onChange={(e) => setCardName(e.target.value)} className="filter-input-text"/>
                    </div>

                    <div className="form-full-width">
                      <label className="filter-label">Card Number</label>
                      <input type="text" required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="filter-input-text"/>
                    </div>

                    <div>
                      <label className="filter-label">Expiry Date</label>
                      <input type="text" required placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="filter-input-text"/>
                    </div>

                    <div>
                      <label className="filter-label">CVV Code</label>
                      <input type="password" required maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value)} className="filter-input-text"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: order summmary */}
            <div>
              <div className="order-summary-card">
                <h3 className="filter-title" style={{ marginBottom: '1rem' }}>Order Summary</h3>

                {/* Hotel mini preview */}
                <div className="summary-hotel-header">
                  <img src="" alt="Hotel Preview" className="summary-hotel-thumb"/>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.9375rem', margin: 0, color: 'var(--dark-khaki)' }}>Hotel 1</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--olive-leaf)', fontWeight: 700 }}>Polokwane</span>
                    <div style={{ fontSize: '0.6875rem', opacity: 0.8, marginTop: '0.25rem' }}>
                      4 Nights (24 Oct - 28 Oct 2026)
                    </div>
                  </div>
                </div>