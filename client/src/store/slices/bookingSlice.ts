import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosClient from '../../api/axiosClient.js';

export interface Booking {
  reservation_id: number;
  guest_name: string;
  guest_email: string;
  accommodation_id: number;
  hotel_name: string;
  city: string;
  room_type: string;
  price_per_night: number | string;
  check_in: string;
  check_out: string;
  guest_count: number;
  total_amount: number | string;
  payment_status: string;
  status: string;
  hero_image: string | null;
  created_at: string;
}

export interface BookingState {
  myBookings: Booking[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

interface BookingApiResponse {
  message?: string;
  error?: string;
  data: Booking;
}

const initialState: BookingState = {
  myBookings: [],
  loading: false,
  error: null,
  successMessage: null,
};

export const createReservation = createAsyncThunk(
  'bookings/createReservation',
  async (
    bookingData: { roomId: number; checkIn: string; checkOut: string; guestCount: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosClient.post<BookingApiResponse>('/bookings', bookingData);
      if (!response.data.data) throw new Error('The server did not return the saved reservation.');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError<{ error?: string }>(error)
          ? error.response?.data?.error || error.message
          : error instanceof Error ? error.message : 'Booking failed. Please try again.'
      );
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<{ data: Booking[] }>('/bookings/my-bookings');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(
        axios.isAxiosError<{ error?: string }>(error)
          ? error.response?.data?.error || error.message
          : error instanceof Error ? error.message : 'Failed to fetch bookings.'
      );
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookingMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = `Reservation #${action.payload.reservation_id} saved.`;
        state.myBookings = [action.payload, ...state.myBookings];
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBookingMessages } = bookingSlice.actions;
export default bookingSlice.reducer;
