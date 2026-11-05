import React, { useState } from 'react';
import { Heart, Share2, MapPin, Wifi, Tv, Coffee, Car, ShieldCheck } from 'lucide-react'; //from lucide react
import { Navbar } from '../components/common/Navbar.js';
import { PhotoGallery } from '../components/hotel/PhotoGallery.js';
import { MapWidget } from '../components/hotel/MapWidget.js';
import { ReviewsSection } from '../components/hotel/ReviewsSection.js';
import { StickyBookingCard } from '../components/hotel/StickyBookingCard.js';
import { Footer } from '../components/common/Footer.js';
import '../styles/screen3.css';

export type HotelDetailsPageProps = {
    hotelId: number;
    onNavigateToCheckout: () => void;
    onOpenAuthModal: () => void;
};

export const HotelDetailsPage: React.FC<HotelDetailsPageProps> = ({ hotelId, onNavigateToCheckout, onOpenAuthModal }) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    return (
        <div className="page-container">
            <Navbar onOpenAuthModal={onOpenAuthModal} />
            <main className="main-content-layout" style={{ flexDirection: 'column' }}>
                <div className="hotel-details-header">
                    <div>
                        <h1 className="hotel-details-title">HOTEL 1</h1>
                        <div className="hotel-details-address">
                            <MapPin size={14} color="#656839" />
                            <span>62nd Avenue, Bendor, Polokwane, 0700, South Africa</span>
                        </div>
                    </div>

                    {/* action buttons; favourite and share */}
                    <div className="action-buttons-group">
                        <button onClick={() => setIsFavorite(!isFavorite)} className={`icon-action-btn ${isFavorite ? 'active' : ''}`} aria-label="Save to Favorites">
                            <Heart size={18} fill={isFavorite ? '#f43f5e' : 'none'} color={isFavorite ? '#f43f5e' : '#514B23'} />
                        </button>

                        <button onClick={() => alert('Property link copied to clipboard!')} className="icon-action-btn" aria-label="Share Property">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>

                {/* photo galler grid */}
                <PhotoGallery />

                {/* details and sticky booking card grid */}
                <div className="details-content-layout">

                    {/* Left: Property Info, Facilities, Map & Reviews */}
                    <div>
                        {/* About property */}
                        <section className="info-section-card">
                            <h2 className="section-card-title">About Property</h2>
                            <p className="section-card-body">Experience world-class hospitality in Polokwane with tranquil gardens, luxurious executive suites, and top-tier guest amenities. Perfect for leisure break-aways and business trips alike.</p>
                        </section>

                        {/* Facilities grid */}
                        <section className="info-section-card">
                            <h2 className="section-card-title">Facilities & Amenities</h2>
                            <div className="facilities-grid">
                                <div className="facility-item"><Wifi size={16} color="#656839" /><span>High-Speed WiFi</span></div>
                                <div className="facility-item"><Car size={16} color="#656839" /><span>Free Onsite Parking</span></div>
                                <div className="facility-item"><Coffee size={16} color="#656839" /><span>Complimentary Breakfast</span></div>
                                <div className="facility-item"><Tv size={16} color="#656839" /><span>Smart TV & Streaming</span></div>
                                <div className="facility-item"><ShieldCheck size={16} color="#656839" /><span>24/7 Security</span></div>
                            </div>
                        </section>

                        {/* Map Widget */}
                        <MapWidget address="62nd Avenue, Bendor" city="Polokwane" />

                        {/* Reviews section */}
                        <ReviewsSection rating={9.8} reviewCount={128} />
                    </div>

                    {/* Right: sticky booking card */}
                    <div>
                        <StickyBookingCard startingPrice={1800} rating={9.8} reviewCount={128} onBookNow={() => onNavigateToCheckout()} />
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
};