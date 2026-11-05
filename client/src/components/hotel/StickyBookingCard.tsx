import React, { useState } from 'react';
import { Calendar, Users, Star, ShieldCheck } from 'lucide-react'; //using Lucide React icons
import '../../styles/screen3.css'; 

export type StickyBookingCardProps = {
  startingPrice: number;
  rating: number;
  reviewCount: number;
  onBookNow: (bookingDetails: { checkIn: string; checkOut: string; guests: number; totalAmount: number }) => void;
};
