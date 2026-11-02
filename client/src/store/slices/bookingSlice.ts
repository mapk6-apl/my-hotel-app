import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Booking {
    reservation_id: number;
    hotel_name: string;
    city: string;
    room_type: string;
    check_in: string;
    check_out: string;
    guest_count: number;
    total_amount: number;
    status: string;
    hero_image: string;
}

interface BookingState {
    myBookings: Booking[];
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

interface BookingApiResponse {
    message?: string;
    error?: string;
}

const initialState: BookingState = {
    myBookings: [],
    loading: false,
    error: null,
    successMessage: null,
};

// Async Thunk: Create new reservation 
export const createReservation = createAsyncThunk(
    'bookings/createReservation',
    async (
        bookingData: { roomId: number; checkIn: string; checkOut: string; guestCount: number },
        { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bookingData),
            });
            const data = await response.json() as BookingApiResponse;

            if (!response.ok) throw new Error(data.error || 'Booking failed');
            return data.message;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// Async Thunk: Fetch guest reservation history 
export const fetchUserBookings = createAsyncThunk( 
    'bookings/fetchUserBookings', 
    async (_, { rejectWithValue }) => { 
        try { 
            const token = localStorage.getItem('token'); 
            const response = await fetch('http://localhost:5001/api/bookings/my-bookings', { 
                headers: { Authorization: `Bearer ${token}` }, 
            }); 
            const data = await response.json() as { error?: string; data: Booking[] }; 
            
            if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings'); 
            return data.data; 
        } catch (err: any) { 
            return rejectWithValue(err.message); 
        } 
    } 
);