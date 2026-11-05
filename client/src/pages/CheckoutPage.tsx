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
                            {/* Guest details card */}
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
                                            <input type="text" required value={cardName} onChange={(e) => setCardName(e.target.value)} className="filter-input-text" />
                                        </div>

                                        <div className="form-full-width">
                                            <label className="filter-label">Card Number</label>
                                            <input type="text" required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="filter-input-text" />
                                        </div>

                                        <div>
                                            <label className="filter-label">Expiry Date</label>
                                            <input type="text" required placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="filter-input-text" />
                                        </div>

                                        <div>
                                            <label className="filter-label">CVV Code</label>
                                            <input type="password" required maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value)} className="filter-input-text" />
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
                                    <img src="" alt="Hotel Preview" className="summary-hotel-thumb" />
                                    <div>
                                        <h4 style={{ fontWeight: 800, fontSize: '0.9375rem', margin: 0, color: 'var(--dark-khaki)' }}>Hotel 1</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--olive-leaf)', fontWeight: 700 }}>Polokwane</span>
                                        <div style={{ fontSize: '0.6875rem', opacity: 0.8, marginTop: '0.25rem' }}>
                                            4 Nights (24 Oct - 28 Oct 2026)
                                        </div>
                                    </div>
                                </div>
                                {/* cost breakdown */}
                                <div className="cost-breakdown-list">
                                    <div className="cost-item-row">
                                        <span>R1,800 × 4 nights</span>
                                        <span>R7,200</span>
                                    </div>
                                    <div className="cost-item-row">
                                        <span>Cleaning Fee</span>
                                        <span>R650</span>
                                    </div>
                                    <div className="cost-item-row">
                                        <span>Service Fee</span>
                                        <span>R520</span>
                                    </div>
                                    <div className="cost-item-row">
                                        <span>VAT (15%)</span>
                                        <span>Included</span>
                                    </div>
                                    <div className="cost-total-row">
                                        <span>Grand Total (ZAR)</span>
                                        <span>R8,370</span>
                                    </div>
                                </div>

                                {/* Pay and Confirm CTA*/}
                                <button type="submit" disabled={isProcessing} className="btn-pay-now">
                                    <Lock size={16} />
                                    <span>{isProcessing ? 'Authorizing Payment...' : 'Pay & Confirm Reservation'}</span>
                                </button>

                                <div style={{ textAlign: 'center', fontSize: '0.625rem', opacity: 0.7, marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                    <ShieldCheck size={12} color="#656839" />
                                    <span>Bank-grade secure checkout</span>
                                </div>
                            </div>
                        </div>

                        </form>
        ) : (
          /* Step 2: confirmation success view*/
          <div className="success-card">
            <CheckCircle2 size={56} color="#656839" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--dark-khaki)', margin: 0 }}>
              Reservation Confirmed!
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--dark-khaki)', marginTop: '0.5rem' }}>
              Thank you, <span style={{ fontWeight: 800 }}>{fullName}</span>. Your stay at <span style={{ fontWeight: 800 }}>Hotel 1</span> has been booked.
            </p>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '1rem', borderRadius: '12px', margin: '1.5rem 0', textAlign: 'left', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ opacity: 0.7 }}>Booking Reference:</span>
                <span style={{ fontWeight: 800 }}>#BA-2026-9812</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ opacity: 0.7 }}>Total Amount Paid:</span>
                <span style={{ fontWeight: 800 }}>R8,370</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Confirmation Sent To:</span>
                <span style={{ fontWeight: 800 }}>{email}</span>
              </div>
            </div>

            <button onClick={onNavigateHome} className="btn-pay-now" style={{ width: 'auto', margin: '0 auto', padding: '0.75rem 2rem' }}>
              Return to Home
            </button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
