import React from 'react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { Building2, ShieldCheck, Award, MapPin, Phone, Mail, Clock } from 'lucide-react';
import '../styles/screen1.css';

export type AboutPageProps = {
  onOpenAuthModal: () => void;
};

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenAuthModal }) => {
  return (
    <div className="page-container">
      <Navbar onOpenAuthModal={onOpenAuthModal} />

      <header className="hero-header" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#656839', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: '#F4F9E9', marginBottom: '0.75rem' }}>
          <Building2 size={14} />
          <span>ABOUT BREAK-AWAY HOTELS</span>
        </div>
        <h1 className="hero-title">Premier Lodging Network</h1>
        <p className="hero-subtitle">
          Connecting travelers to luxury accommodations, boutique stays, and safari resorts in South Africa.
        </p>
      </header>

      <main className="main-content-layout" style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* BRAND MISSION & VISION */}
        <section style={{ backgroundColor: '#CBD0B9', padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(81,75,35,0.2)', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#514B23', marginBottom: '1rem' }}>Our Story & Mission</h2>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#514B23', opacity: 0.9, marginBottom: '1rem' }}>
            Founded in South Africa, Break-Away Hotels & Resorts provides travelers with a seamless online reservation platform designed to explore curated accommodations—from executive suites in Polokwane and waterfront resorts in Cape Town to safari lodges near Kruger National Park.
          </p>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#514B23', opacity: 0.9 }}>
            Our platform guarantees transparent ZAR (R) pricing, verified traveler reviews, interactive location mapping, and secure instant bookings.
          </p>
        </section>

        {/* CORE PROPOSITIONS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ backgroundColor: '#CBC9AD', padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(81,75,35,0.15)' }}>
            <ShieldCheck size={28} color="#656839" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#514B23', marginBottom: '0.5rem' }}>Best Price Guarantee</h3>
            <p style={{ fontSize: '0.85rem', color: '#514B23', opacity: 0.85, lineHeight: '1.5' }}>
              Direct rates with zero hidden fees. What you see on our booking card is what you pay.
            </p>
          </div>

          <div style={{ backgroundColor: '#CBC9AD', padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(81,75,35,0.15)' }}>
            <Award size={28} color="#656839" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#514B23', marginBottom: '0.5rem' }}>Verified Properties</h3>
            <p style={{ fontSize: '0.85rem', color: '#514B23', opacity: 0.85, lineHeight: '1.5' }}>
              Every hotel listing undergoes quality checks for guest comfort, cleanliness, and security.
            </p>
          </div>

          <div style={{ backgroundColor: '#CBC9AD', padding: '1.75rem', borderRadius: '16px', border: '1px solid rgba(81,75,35,0.15)' }}>
            <Clock size={28} color="#656839" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#514B23', marginBottom: '0.5rem' }}>Instant Confirmation</h3>
            <p style={{ fontSize: '0.85rem', color: '#514B23', opacity: 0.85, lineHeight: '1.5' }}>
              Reservations update instantly in your member profile dashboard with digital booking vouchers.
            </p>
          </div>
        </div>

        {/* CONTACT & HEADQUARTERS */}
        <section style={{ backgroundColor: '#514B23', color: '#F4F9E9', padding: '2.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Customer Support & Operations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#BDDBD0" />
              <span>Polokwane & Johannesburg, South Africa</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={18} color="#BDDBD0" />
              <span>+27 (0) 15 290 1000</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={18} color="#BDDBD0" />
              <span>support@breakawayhotels.co.za</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
