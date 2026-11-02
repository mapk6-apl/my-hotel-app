import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

export interface Hotel { 
    id: number; 
    name: string; 
    description: string; 
    address: string; 
    city: string; 
    star_rating: number; 
    hero_image: string; 
    starting_price: number; 
}

export interface SearchFilters { 
    city: string;
    minPrice: number | ''; 
    maxPrice: number | ''; 
    starRating: number | ''; 
}

interface HotelState { 
    hotels: Hotel[]; 
    selectedHotel: any | null; 
    filters: SearchFilters; 
    favorites: number[]; 
    loading: boolean; 
    error: string | null; 
} 

const initialState: HotelState = { 
    hotels: [], 
    selectedHotel: null, 
    filters: { 
        city: '', 
        minPrice: '', 
        maxPrice: '', 
        starRating: '', }, 
        favorites: [], 
        loading: false, 
        error: null, 
};

// Async Thunk: Fetch filtered hotel listings from backend (Port 5001)
 export const fetchHotels = createAsyncThunk( 
    'hotels/fetchHotels', 
    async (filters: SearchFilters, { rejectWithValue }) => { 
        try { 
            const params = new URLSearchParams(); 
            if (filters.city) params.append('city', filters.city); 
            if (filters.minPrice) params.append('minPrice', String(filters.minPrice)); 
            if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice)); 
            if (filters.starRating) params.append('starRating', String(filters.starRating)); 
            
            const response = await fetch(`http://localhost:5001/api/hotels?${params.toString()}`); 
            const data = await response.json() as { error?: string; data: Hotel[] }; 
            
            if (!response.ok) throw new Error(data.error || 'Failed to fetch hotels'); 
            return data.data; 
        } catch (err: any) { 
            return rejectWithValue(err.message); 
        } 
    } 
);

