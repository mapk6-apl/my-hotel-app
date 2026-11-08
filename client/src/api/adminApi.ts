import axiosClient from './axiosClient.js';

export interface AdminAccommodation {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  star_rating: number | string;
  hero_image: string | null;
  starting_price: number | string;
}

export interface AdminBooking {
  reservation_id: number;
  check_in: string;
  check_out: string;
  guest_count: number;
  total_amount: number | string;
  payment_status: string;
  status: string;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  hotel_name: string | null;
  room_type: string | null;
}

export interface AdminStatistics {
  totalBookings: number;
  totalHotels: number;
  totalGuests: number;
}

interface ApiListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

interface ApiDataResponse<T> {
  success: boolean;
  data: T;
}

//TypeScript definitions for creating or updating a property
export interface AccommodationPayload {
  name: string;
  city: string;
  address: string;
  description: string;
  starting_price: number;
  star_rating: number;
  room_type: string;
  capacity: number;
  hero_image?: string;
}

export const adminApi = {
  // Uses the existing public endpoint, which returns database-backed accommodation records.
  getAllAccommodations: async (): Promise<ApiListResponse<AdminAccommodation>> => {
    const response = await axiosClient.get<ApiListResponse<AdminAccommodation>>('/hotels');
    return response.data;
  },

  getStatistics: async (): Promise<ApiDataResponse<AdminStatistics>> => {
    const response = await axiosClient.get<ApiDataResponse<AdminStatistics>>('/admin/stats');
    return response.data;
  },

  //Adds a new property listing to the database.
  createAccommodation: async (data: AccommodationPayload) => {
    const response = await axiosClient.post('/admin/hotels', data);
    return response.data;
  },

  //Updates an existing property record by ID.
  updateAccommodation: async (id: number, data: Partial<AccommodationPayload>) => {
    const response = await axiosClient.put(`/admin/hotels/${id}`, data);
    return response.data;
  },

  //Deletes a property record from the system.
  deleteAccommodation: async (id: number) => {
    const response = await axiosClient.delete(`/admin/hotels/${id}`);
    return response.data;
  },

  //Fetches all guest reservations from the existing admin bookings endpoint.
  getAllReservations: async (): Promise<ApiListResponse<AdminBooking>> => {
    const response = await axiosClient.get<ApiListResponse<AdminBooking>>('/admin/bookings');
    return response.data;
  },

  updateBookingStatus: async (id: number, status: string) => {
    const response = await axiosClient.patch(`/admin/bookings/${id}/status`, { status });
    return response.data;
  },
};
