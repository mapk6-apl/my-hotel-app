import React, { useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux'; 
import { setFilters, resetFilters } from '../../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../../store/store.js'; 
import '../../styles/screen1.css'; 

export const SearchFilterBar: React.FC = () => { 
    // AppDispatch provides strict typing for async thunks like fetchHotels 
    const dispatch = useDispatch<AppDispatch>();

    //here we extract current search filter state from Redux store 
    const currentFilters = useSelector((state: RootState) => 
        state.hotels.filters);

    //local state is managed directly inside input change handlers. 
    //I will not use the useEffect state syncing to avoid redundant double re-renders
    const [maxPrice, setMaxPrice] = useState<number>(
        typeof currentFilters.maxPrice === 'number' ? currentFilters.maxPrice : 4000);
    const [starRating, setStarRating] = useState<number | ''> (currentFilters.starRating || '');

    //Filter changes trigger the page's single fetch effect.
    const handleSearchSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        const updatedFilters = { 
            ...currentFilters, 
            maxPrice: maxPrice, 
            starRating: starRating, 
        }; 
        dispatch(setFilters(updatedFilters)); 
    };

    //Resets local form inputs and restores default unfiltered hotel list 
    const handleReset = () => { 
        setMaxPrice(4000); 
        setStarRating(''); 
        dispatch(resetFilters()); 
    };

    return (
        <aside className="filter-sidebar">
            <form onSubmit={handleSearchSubmit}>
                {/* sidebar header */}
                <div className="filter-header">
                    <h3 className="filter-title">Search & Filter</h3>
                    <button type='button' onClick={handleReset} className='btn-reset'>Reset</button>
                </div>

                {/* budget range slider */}
                <div className="filter-group">
                    <div className="flex justify-between items-center">
                        <label className="filter-label">Max Budget</label>
                        <span className="price-readout">R{maxPrice}/night</span>
                        <input type='range' min='500' max='5000' step='100' value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="filter-slider"/>
                    </div>
                </div>

                {/* star rating buttons */}
                <div className="filter-group">
                    <label className="filter-label">Star Rating</label>
                    <div className="star-rating-grid">
                        {[3,4,5].map((stars) => (
                            <button key={stars} type='button' onClick={() => setStarRating(starRating === stars ? '' : stars)} className={`star-btn ${starRating === stars ? 'active' : ''}`} aria-pressed={starRating === stars}>{stars}</button>
                        ))}
                    </div>
                </div>

                {/* search CTA */}
                <button type='submit' className="btn-search-submit">SEARCH HOTELS</button>
            </form>
        </aside>
    );
};