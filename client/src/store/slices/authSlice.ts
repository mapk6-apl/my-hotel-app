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

// Async Thunk: Fetch logged-in user details using JWT Token 
export const fetchCurrentUser = createAsyncThunk( 'auth/fetchCurrentUser', 
    async (_, { getState, rejectWithValue }) => { 
        try { 
            const state = getState() as { auth: AuthState }; 
            const token = state.auth.token || localStorage.getItem('token'); 
            
            if (!token) throw new Error('No token found'); 
            
            const response = await fetch('http://localhost:5001/api/auth/me', { 
                headers: { Authorization: `Bearer ${token}` }, 
            }); 
            const data = (await response.json()) as { user: UserProfile; error?: string }; 
            
            if (!response.ok) throw new Error(data.error || 'Failed to fetch user'); 
            return data.user; 
        } catch (err: any) { 
            return rejectWithValue(err.message); 
        } 
    } 
);