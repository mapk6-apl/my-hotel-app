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

const initialState: BookingState = { 
    myBookings: [], 
    loading: false, 
    error: null, 
    successMessage: null, 
};

