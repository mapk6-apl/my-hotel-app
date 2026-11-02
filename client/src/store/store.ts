import { configureStore } from '@reduxjs/toolkit'; 
import hotelReducer from './slices/hotelSlice.js'; 
import authReducer from './slices/authSlice.js'; 
import bookingReducer from './slices/bookingSlice.js'; 

export const store = configureStore({ 
    reducer: { 
        hotels: hotelReducer, 
        auth: authReducer, 
        bookings: bookingReducer, 
    }, 
}); 
    
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;