import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'; 

export interface UserProfile { 
    id: number; 
    email: string; 
    full_name: string; 
    avatar_url: string; 
    role: 'guest' | 'admin'; 
} 

interface AuthState { 
    token: string | null; 
    user: UserProfile | null; 
    isAuthenticated: boolean; 
    loading: boolean; 
    error: string | null; 
}

const initialState: AuthState = { 
    token: localStorage.getItem('token'), 
    user: null, 
    isAuthenticated: !!localStorage.getItem('token'), 
    loading: false, error: null, 
};