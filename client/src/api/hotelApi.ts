import axiosClient from './axiosClient.js';

//TypeScript definitions for filter query parameters
export interface FilterParams {
  city?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  starRating?: number | string;
  guests?: number | string;
  checkIn?: string;
  checkOut?: string;
  amenities?: string[];
}

//TypeScript definitions for booking requests
export interface BookingPayload {
  hotel_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
}

export interface PayFastPaymentResponse {
  success: boolean;
  action: string;
  fields: Record<string, string>;
}

export const hotelApi = {
  //Fetches property listings from backend matching active search filters.
  getHotels: async (params?: FilterParams) => {
    const query = new URLSearchParams();
    if (params?.city) query.set('city', params.city);
    if (params?.minPrice) query.set('minPrice', String(params.minPrice));
    if (params?.maxPrice) query.set('maxPrice', String(params.maxPrice));
    if (params?.starRating) query.set('starRating', String(params.starRating));
    if (params?.guests) query.set('guests', String(params.guests));
    if (params?.checkIn) query.set('checkIn', params.checkIn);
    if (params?.checkOut) query.set('checkOut', params.checkOut);
    params?.amenities?.forEach((amenity) => query.append('amenity', amenity));
    const response = await axiosClient.get(`/hotels?${query.toString()}`);
    return response.data;
  },

  getHotelFilterOptions: async () => {
    const response = await axiosClient.get('/hotels/filters');
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

  createPayFastPayment: async (reservationId: number) => {
    const response = await axiosClient.post<PayFastPaymentResponse>(`/bookings/${reservationId}/payfast`);
    return response.data;
  },

  getPayFastPaymentStatus: async (reservationId: number, paymentReference: string) => {
    const response = await axiosClient.get(`/bookings/${reservationId}/payfast/${encodeURIComponent(paymentReference)}`);
    return response.data;
  },

  //Fetches all past and upcoming stays for the authenticated traveler.
  getUserBookings: async () => {
    const response = await axiosClient.get('/bookings/my-bookings');
    return response.data;
  },
};
