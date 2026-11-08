import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react'; 
import '../../styles/screen3.css';

export type HotelReview = {
  id: number;
  rating: number | string;
  comment: string | null;
  guest_name: string | null;
};

export type ReviewsSectionProps = {
  reviews: HotelReview[];
};

export const getAverageReviewRating = (reviews: HotelReview[]): number | null => {
  const ratings = reviews
    .filter((review) => review.rating !== null && review.rating !== '')
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating) && rating >= 0 && rating <= 5);
  return ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : null;
};

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const averageRating = getAverageReviewRating(reviews)?.toFixed(1) ?? null;
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="info-section-card">
      <h3 className="section-card-title">
        <MessageSquare size={18} color="#656839" />
        <span>Guest Reviews & Rating</span>
      </h3>

      <div className="reviews-summary-container">
        <div className="review-score-badge">
          {averageRating ?? '—'}
        </div>
        <div>
          <div className="review-meta-text">{averageRating ? 'Guest rating' : 'No guest ratings yet'}</div>
          <div className="review-meta-subtext">Based on {reviews.length} guest reviews</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reviews.length === 0 ? (
          <p>No guest reviews are available for this property.</p>
        ) : visibleReviews.map((review) => {
          const rating = Number(review.rating);
          return (
            <div key={review.id} className="property-review">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.8125rem' }}>{review.guest_name || 'Guest'}</span>
                <div style={{ display: 'flex', gap: '0.1rem' }}>
                  {Number.isFinite(rating) && Array.from({ length: Math.max(0, Math.min(5, Math.round(rating))) }, (_, index) => (
                    <Star key={index} size={12} fill="#d97706" color="#d97706" />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0 }}>
                  {review.comment}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {reviews.length > 3 && (
        <button type="button" className="read-reviews-button" onClick={() => setShowAllReviews((show) => !show)}>
          {showAllReviews ? 'Show fewer reviews' : `Read all ${reviews.length} reviews`}
        </button>
      )}
    </div>
  );
};
