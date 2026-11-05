import React, { useState } from 'react';
import { X, Building, MapPin, DollarSign, Star } from 'lucide-react'; // Using Lucide React icons
import '../../styles/screen2.css'; // Styled with standard modal overlay

export type AccommodationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AccommodationModal: React.FC<AccommodationModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Polokwane');
  const [price, setPrice] = useState(1500);
  const [rating, setRating] = useState(4);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Property "${name}" created successfully!`);
    onClose();
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card" style={{ maxWidth: '32rem' }}>
        
        <button onClick={onClose} className="auth-close-btn" aria-label="Close Modal"><X size={20} /></button>

        <div className="auth-header">
          <h2 className="auth-title">Add New Accommodation</h2>
          <p className="auth-subtitle">Add a luxury property listing to the Break-Away platform</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label className="auth-label">Property Name</label>
            <input type="text" required placeholder="ex. Kruger Safari Lodge" value={name} onChange={(e) => setName(e.target.value)} className="auth-input"/>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Location/City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="auth-input" style={{ cursor: 'pointer' }}>
              <option value="Durban">Durban</option>
              <option value="Pretoria">Pretoria</option>
              <option value="Cape Town">Cape Town</option>
              <option value="Sandton">Sandton</option>
              <option value="Polokwane">Polokwane</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="auth-input-group">
              <label className="auth-label">Starting Price (ZAR)</label>
              <input type="number" required value={price} onChange={(e) => setPrice(Number(e.target.value))} className="auth-input"/>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Star Rating</label>
              <input type="number" min={1} max={5} required value={rating} onChange={(e) => setRating(Number(e.target.value))} className="auth-input"/>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" style={{ marginTop: '1rem' }}>
            Save & Publish Listing
          </button>
        </form>

      </div>
    </div>
  );
};