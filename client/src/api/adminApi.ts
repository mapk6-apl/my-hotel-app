import axiosClient from './axiosClient.js';

//TypeScript definitions for creating or updating a property
export interface AccommodationPayload {
  name: string;
  city: string;
  address: string;
  description: string;
  starting_price: number;
  star_rating: number;
  hero_image?: string;
}

export const adminApi = {
   //Fetches all properties in the system for administrative oversight.
  getAllAccommodations: async () => {
    const response = await axiosClient.get('/admin/hotels');
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

  //Fetches all guest reservations across the entire system.
  getAllReservations: async () => {
    const response = await axiosClient.get('/admin/reservations');
    return response.data;
  },
};
