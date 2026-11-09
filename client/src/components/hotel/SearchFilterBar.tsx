import React, { useEffect, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { hotelApi } from '../../api/hotelApi.js';
import { setFilters, resetFilters } from '../../store/slices/hotelSlice.js';
import type { RootState, AppDispatch } from '../../store/store.js';
import { useDispatch, useSelector } from 'react-redux';
import '../../styles/screen1.css';

type FilterOptions = {
  amenities: string[];
  maxGuests: number;
  minPrice: number;
  maxPrice: number;
};

export const SearchFilterBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentFilters = useSelector((state: RootState) => state.hotels.filters);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | ''>(currentFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | ''>(currentFilters.maxPrice);
  const [starRating, setStarRating] = useState<number | ''>(currentFilters.starRating);
  const [guests, setGuests] = useState<number | ''>(currentFilters.guests);
  const [amenities, setAmenities] = useState<string[]>(currentFilters.amenities);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    void hotelApi.getHotelFilterOptions()
      .then((response) => {
        if (!response?.success || !response.data || !Array.isArray(response.data.amenities)) {
          throw new Error('The server returned invalid property filter options.');
        }
        if (active) setFilterOptions(response.data as FilterOptions);
      })
      .catch((error: unknown) => {
        if (active) {
          setOptionsError(error instanceof Error ? error.message : 'Unable to load filter options.');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setMinPrice(currentFilters.minPrice);
    setMaxPrice(currentFilters.maxPrice);
    setStarRating(currentFilters.starRating);
    setGuests(currentFilters.guests);
    setAmenities(currentFilters.amenities);
  }, [currentFilters]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(setFilters({ minPrice, maxPrice, starRating, guests, amenities }));
    setExpanded(false);
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setStarRating('');
    setGuests('');
    setAmenities([]);
    dispatch(resetFilters());
    setExpanded(false);
  };

  const toggleAmenity = (name: string) => {
    setAmenities((current) =>
      current.includes(name) ? current.filter((value) => value !== name) : [...current, name]
    );
  };

  return (
    <aside className={`filter-sidebar ${expanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className="filter-mobile-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span><SlidersHorizontal size={17} /> Filters</span>
        <ChevronDown size={17} />
      </button>
      <form className="filter-content" onSubmit={handleSearchSubmit}>
        <div className="filter-header">
          <h2 className="filter-title">Filter properties</h2>
          <button type="button" onClick={handleReset} className="btn-reset">Clear</button>
        </div>

        <div className="filter-group filter-price-inputs">
          <span className="filter-label">Nightly price (ZAR)</span>
          <div className="filter-price-row">
            <label>
              <span>Minimum</span>
              <input
                type="number"
                min={filterOptions?.minPrice ?? 0}
                max={maxPrice || filterOptions?.maxPrice}
                value={minPrice}
                placeholder={String(filterOptions?.minPrice ?? 0)}
                onChange={(event) => setMinPrice(event.target.value ? Number(event.target.value) : '')}
              />
            </label>
            <label>
              <span>Maximum</span>
              <input
                type="number"
                  min={minPrice === '' ? (filterOptions?.minPrice ?? 0) : minPrice}
                max={filterOptions?.maxPrice}
                value={maxPrice}
                placeholder={String(filterOptions?.maxPrice ?? 0)}
                onChange={(event) => setMaxPrice(event.target.value ? Number(event.target.value) : '')}
              />
            </label>
          </div>
          {minPrice !== '' && maxPrice !== '' && minPrice > maxPrice && (
            <p className="filter-error" role="alert">Minimum price cannot exceed maximum price.</p>
          )}
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-guests">Room for</label>
          <select
            id="filter-guests"
            className="filter-input-text"
            value={guests}
            onChange={(event) => setGuests(event.target.value ? Number(event.target.value) : '')}
          >
            <option value="">Any number of guests</option>
            {Array.from({ length: filterOptions?.maxGuests ?? 4 }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>{count} {count === 1 ? 'guest' : 'guests'}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-label">Minimum rating</span>
          <div className="star-rating-grid">
            {[3, 4, 5].map((stars) => (
              <button
                key={stars}
                type="button"
                onClick={() => setStarRating(starRating === stars ? '' : stars)}
                className={`star-btn ${starRating === stars ? 'active' : ''}`}
                aria-pressed={starRating === stars}
              >
                {stars}+ stars
              </button>
            ))}
          </div>
        </div>

        {filterOptions && filterOptions.amenities.length > 0 && (
          <fieldset className="filter-group filter-amenities">
            <legend className="filter-label">Amenities</legend>
            {filterOptions.amenities.map((name) => (
              <label className="filter-checkbox" key={name}>
                <input
                  type="checkbox"
                  checked={amenities.includes(name)}
                  onChange={() => toggleAmenity(name)}
                />
                <span>{name.replace(/&amp;/g, '&')}</span>
              </label>
            ))}
          </fieldset>
        )}
        {optionsError && <p className="filter-error" role="alert">{optionsError}</p>}

        <button type="submit" className="btn-search-submit" disabled={minPrice !== '' && maxPrice !== '' && minPrice > maxPrice}>
          Apply filters
        </button>
      </form>
    </aside>
  );
};
