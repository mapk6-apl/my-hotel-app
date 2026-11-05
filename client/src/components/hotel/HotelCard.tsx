import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavoriteLocal, type Hotel } from '../../store/slices/hotelSlice.js';
import { type RootState } from '../../store/store.js';
import '../../styles/screen1.css'; 

export type HotelCardProps = {
    hotel: Hotel;
    onViewDetails: (hotelId: number) => void;
};

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onViewDetails }) => {
    const dispatch = useDispatch(); //provides strict typing for async thunks

    // Read favorites from Redux to check if this property is saved 
    const favorites = useSelector((state: RootState) => state.hotels.favorites);
    const isFavorite = favorites.includes(hotel.id);

    return (
        <div className="hotel-card">
            {/* property hero image & badges */}
            <div className="card-image-wrapper">
                <img src={hotel.hero_image || '[]'} //hero image will go here
                    alt={hotel.name} className="card-image" />
                <div className="star-badge">★ {hotel.star_rating} Stars</div>

                {/* favourite toggle button*/}
                <button onClick={() => dispatch(toggleFavoriteLocal(hotel.id))} className="favorite-toggle-btn">
                    <svg
                        className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none stroke-gray-600'}`}
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        style={{ width: '16px', height: '16px' }}>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </button>

                {/* card details */}
                <div className="card-content">
                    <div>
                        <span className="card-location">{hotel.city}</span>
                        <h4 className="card-title">{hotel.name}</h4>
                        <p className="card-description">{hotel.description || 'Luxury break-away accommodation with premium facilities.'}</p>
                    </div>

                    {/* pricing & view details */}
                    <div className="card-footer">
                        <div>
                            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', display: 'block' }}>From</span>
                            <span className="price-amount">R{hotel.starting_price}/night</span>
                        </div>
                        <button onClick={() => onViewDetails(hotel.id)} className="btn-view-details">VIEW DETAILS</button>
                    </div>
                </div>
            </div>
        </div>
    );
};