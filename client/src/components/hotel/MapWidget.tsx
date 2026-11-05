import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import '../../styles/screen3.css';

export type MapWidgetProps = {
  address: string;
  city: string;
};

export const MapWidget: React.FC<MapWidgetProps> = ({ address, city }) => {
  return (
    <div className="info-section-card">
      <h3 className="section-card-title">
        <MapPin size={18} color="#656839" />
        <span>Location & Neighborhood</span>
      </h3>
      
      <p style={{ fontSize: '0.75rem', color: 'rgba(81, 75, 35, 0.8)', marginBottom: '1rem' }}>
        {address}, {city}, South Africa
      </p>

      {/* map placeholder canvas */}
      <div 
        style={{
          width: '100%',
          height: '12rem',
          backgroundColor: '#d1d5db',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          border: '1px solid var(--dry-sage)'
        }}
      >
        <Navigation size={28} color="#514B23" />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#514B23' }}>
          Interactive Map Widget ({city})
        </span>
      </div>
    </div>
  );
};
