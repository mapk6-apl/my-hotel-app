import React from 'react';
import { Star, MessageSquare } from 'lucide-react'; 
import '../../styles/screen3.css';

export type ReviewsSectionProps = {
  rating: number;
  reviewCount: number;
};

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ rating, reviewCount }) => {
  return (
    <div className="info-section-card">
      <h3 className="section-card-title">
        <MessageSquare size={18} color="#656839" />
        <span>Guest Reviews & Rating</span>
      </h3>

      <div className="reviews-summary-container">
        <div className="review-score-badge">
          {rating}
        </div>
        <div>
          <div className="review-meta-text">Exceptional Hospitality</div>
          <div className="review-meta-subtext">Based on {reviewCount} verified guest reviews</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(81, 75, 35, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.8125rem' }}>Sipho M.</span>
            <div style={{ display: 'flex', gap: '0.1rem' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} fill="#d97706" color="#d97706" />
              ))}
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>
            "Stunning property with peaceful surroundings! Staff were extremely helpful and the amenities exceeded expectations."
          </p>
        </div>

        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(81, 75, 35, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 800, fontSize: '0.8125rem' }}>Anika K.</span>
            <div style={{ display: 'flex', gap: '0.1rem' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={12} fill="#d97706" color="#d97706" />
              ))}
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>
            "The room views were breathtaking. Loved the breakfast spread and fast WiFi."
          </p>
        </div>
      </div>
    </div>
  );
};
