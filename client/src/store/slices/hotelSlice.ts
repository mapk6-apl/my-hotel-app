import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../api/axiosClient.js';

export interface Hotel {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    star_rating: number;
    hero_image: string | null;
    starting_price: number;
}

export interface SearchFilters {
    city: string;
    minPrice: number | '';
    maxPrice: number | '';
    starRating: number | '';
}

export interface HotelState {
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
        starRating: '',
    },
    favorites: (() => {
        const stored = localStorage.getItem('favorite-property-ids');
        if (!stored) return [];
        try {
            const parsed: unknown = JSON.parse(stored);
            return Array.isArray(parsed)
                ? parsed.filter((id): id is number => Number.isInteger(id) && id > 0)
                : [];
        } catch {
            localStorage.removeItem('favorite-property-ids');
            return [];
        }
    })(),
    loading: false,
    error: null,
};

// Async Thunk: Fetch filtered hotel listings from the backend
export const fetchHotels = createAsyncThunk(
    'hotels/fetchHotels',
    async (filters: SearchFilters, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (filters.city) params.append('city', filters.city);
            if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
            if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
            if (filters.starRating) params.append('starRating', String(filters.starRating));

            const response = await fetch(`${API_BASE_URL}/hotels?${params.toString()}`);
            const data = await response.json() as { error?: string; data?: Hotel[] };

            if (!response.ok) throw new Error(data.error || 'Failed to fetch hotels');
            if (!Array.isArray(data.data)) throw new Error('The server returned an invalid property list.');
            return data.data.map((hotel) => ({
                ...hotel,
                star_rating: Number(hotel.star_rating),
                starting_price: Number(hotel.starting_price),
            }));
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// Async Thunk: Fetch detailed single hotel branch view export 
const fetchHotelById = createAsyncThunk(
    'hotels/fetchHotelById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/hotels/${id}`);
            const data = await response.json() as { error?: string; data: Hotel };

            if (!response.ok) throw new Error(data.error || 'Hotel not found');
            return data.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const hotelSlice = createSlice({
    name: 'hotels',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
        toggleFavoriteLocal: (state, action: PayloadAction<number>) => {
            const hotelId = action.payload;
            if (state.favorites.includes(hotelId)) {
                state.favorites = state.favorites.filter((id) => id !== hotelId);
            } else {
                state.favorites.push(hotelId);
            }
            localStorage.setItem('favorite-property-ids', JSON.stringify(state.favorites));
        },
    },
extraReducers: (builder) => { 
    builder 
    .addCase(fetchHotels.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
    }) 
    .addCase(fetchHotels.fulfilled, (state, action) => { 
        state.loading = false; 
        state.hotels = action.payload; 
    })
    .addCase(fetchHotels.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
    })
    .addCase(fetchHotelById.pending, (state) => { 
        state.loading = true; 
        state.selectedHotel = null; 
    })
    .addCase(fetchHotelById.fulfilled, (state, action) => { 
        state.loading = false; 
        state.selectedHotel = action.payload; 
    })
    .addCase(fetchHotelById.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
    }); 
    }, 
});

export const { setFilters, resetFilters, toggleFavoriteLocal } = 
hotelSlice.actions; 
export default hotelSlice.reducer;
