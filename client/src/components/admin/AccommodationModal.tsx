import React, { useState } from 'react';
import { X, Building, MapPin, DollarSign, Star } from 'lucide-react'; // Using Lucide React icons
import '../../styles/screen2.css'; // Styled with standard modal overlay

export type AccommodationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AccommodationModal: React.FC<AccommodationModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Polokwane');
  const [price, setPrice] = useState(1500);
  const [rating, setRating] = useState(4);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Property "${name}" created successfully!`);
    onClose();
  };