import React from 'react';
import { HotelCard } from './HotelCard.js';
import { type Hotel } from '../../store/slices/hotelSlice.js';
import '../../styles/screen1.css';

export type HotelGridProps = {
    hotels: Hotel[];
    loading: boolean;
    onSelectHotel: (hotelId: number) => void;
};

export const HotelGrid: React.FC<HotelGridProps> = ({ hotels, loading, onSelectHotel }) => {
    //early return for loading state
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '5rem 0', fontWeight: 'bold' }}>Loading Break-Away Properties...</div>;
    }
    //early return for empty search results
    if (hotels.length === 0) {
        return (
            <div style={{ backgroundColor: 'var(--ash-grey', padding: '2.5rem', borderRadius: '16px', textAlign: 'center' }}> No properties matched your search parameters. Try resetting your search filters. </div>
        );
    }

    return (
        <div className="hotel-grid-container">
            {hotels.map((hotel) => (
                <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onViewDetails={onSelectHotel} />
            ))}
        </div>
    );
};