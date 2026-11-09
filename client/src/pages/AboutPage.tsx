import React from 'react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { ArrowRight, Building2 } from 'lucide-react';
import '../styles/screen1.css';

export type AboutPageProps = {
  onOpenAuthModal: () => void;
};

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenAuthModal }) => (
  <div className="page-container">
    <Navbar onOpenAuthModal={onOpenAuthModal} />

    <header className="about-page-header">
      <div className="hero-badge">
        <Building2 size={14} />
        <span>ABOUT BREAK-AWAY HOTELS</span>
      </div>
      <h1 className="hero-title">A clearer way to plan your next stay.</h1>
      <p className="hero-subtitle">
        Explore South African properties with the details you need to choose a stay that suits your trip.
      </p>
    </header>

    <main className="about-page-content">
      <section className="about-intro">
        <div>
          <span className="about-eyebrow">About Break-Away Hotels</span>
          <h2>Make the important details easy to find.</h2>
        </div>
        <p>
          Browse accommodation listings, compare available room rates, and review each property's
          location, amenities, images, and guest feedback where available. Information is shown
          from the property's current listing rather than a sample catalogue.
        </p>
      </section>

      <section className="about-planning" aria-label="Planning a reservation">
        <h2>Plan with confidence</h2>
        <div className="about-planning-steps">
          <article>
            <span>01</span>
            <h3>Find a property</h3>
            <p>Search by destination and narrow the catalogue by your preferred price and rating.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Review your stay</h3>
            <p>Choose an available room and check the dates, guest capacity, and current nightly rate.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Save a reservation</h3>
            <p>Your reservation is recorded with its status. Online payment is not currently available.</p>
          </article>
        </div>
      </section>

      <a href="/explore" className="about-explore-link">
        <span>Explore properties</span>
        <ArrowRight size={17} />
      </a>
    </main>

    <Footer />
  </div>
);
