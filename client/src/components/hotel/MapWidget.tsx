import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import '../../styles/screen3.css';

export type MapWidgetProps = {
  address: string;
  city: string;
};

export const MapWidget: React.FC<MapWidgetProps> = ({ address, city }) => {
  const location = [address, city, 'South Africa'].filter(Boolean).join(', ');
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  return (
    <section className="info-section-card">
      <h3 className="section-card-title">
        <MapPin size={18} color="#656839" />
        <span>Location &amp; Neighbourhood</span>
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'rgba(81, 75, 35, 0.8)', marginBottom: '1rem' }}>
        {location}
      </p>
      <a href={mapUrl} target="_blank" rel="noreferrer" className="property-map-link">
        <Navigation size={16} aria-hidden="true" />
        <span>Open this location in Google Maps</span>
      </a>
    </section>
  );
};
