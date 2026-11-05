import React from 'react';
import { Edit, Trash2, Plus, Star, MapPin } from 'lucide-react';
import '../../styles/screen6.css';

export type PropertiesTableProps = {
  onOpenAddModal: () => void;
  onEditProperty: (hotelId: number) => void;
  onDeleteProperty: (hotelId: number) => void;
};

export const PropertiesTable: React.FC<PropertiesTableProps> = ({onOpenAddModal, onEditProperty, onDeleteProperty}) => {

  const mockProperties = [
    { id: 1, name: 'Hotel 1', city: 'Polokwane', price: 1800, rating: 5, status: 'Available' },
    { id: 2, name: 'Hotel 2', city: 'Durban', price: 2400, rating: 4, status: 'Available' },
    { id: 3, name: 'Hotel 3', city: 'Cape Town', price: 3100, rating: 5, status: 'Booked' },
    { id: 4, name: 'Hotel 4', city: 'Pretoria', price: 1950, rating: 4, status: 'Available' },
    { id: 5, name: 'Hotel 5', city: 'Sandton', price: 2800, rating: 5, status: 'Available' },
  ];