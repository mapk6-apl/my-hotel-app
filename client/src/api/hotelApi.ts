import axiosClient from './axiosClient.js';

//TypeScript definitions for filter query parameters
export interface FilterParams {
  city?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  starRating?: number | string;
}

//TypeScript definitions for booking requests
export interface BookingPayload {
  hotel_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
}

export const hotelApi = {
  //Fetches property listings from backend matching active search filters.
  getHotels: async (params?: FilterParams) => {
    const response = await axiosClient.get('/hotels', { params });
    return response.data;
  },

  //Fetches full property details by Hotel ID.
  getHotelById: async (id: number) => {
    const response = await axiosClient.get(`/hotels/${id}`);
    return response.data;
  },

  //Submits a new hotel reservation for the current traveler.
  createBooking: async (bookingData: BookingPayload) => {
    const response = await axiosClient.post('/bookings', bookingData);
    return response.data;
  },

  //Fetches all past and upcoming stays for the authenticated traveler.
  getUserBookings: async () => {
    const response = await axiosClient.get('/bookings/my-bookings');
    return response.data;
  },
};
