import React from 'react'; 
import { useSelector, useDispatch } from 'react-redux'; 
import type { RootState } from '../../store/store.js'; 
import type { logout } from '../../store/slices/authSlice.js';

//callback props ar optional (?) to prevent runtime errors if a parent component doesn't pass them
export type NavbarProps = { 
    onOpenAuthModal?: () => void; 
    onNavigateHome?: () => void; 
};