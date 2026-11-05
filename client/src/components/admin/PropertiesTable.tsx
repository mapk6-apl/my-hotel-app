import React from 'react';
import { Edit, Trash2, Plus, Star, MapPin } from 'lucide-react';
import '../../styles/screen6.css';

export type PropertiesTableProps = {
    onOpenAddModal: () => void;
    onEditProperty: (hotelId: number) => void;
    onDeleteProperty: (hotelId: number) => void;
};

export const PropertiesTable: React.FC<PropertiesTableProps> = ({ onOpenAddModal, onEditProperty, onDeleteProperty }) => {
    const mockProperties = [
        { id: 1, name: 'Hotel 1', city: 'Polokwane', price: 1800, rating: 5, status: 'Available' },
        { id: 2, name: 'Hotel 2', city: 'Durban', price: 2400, rating: 4, status: 'Available' },
        { id: 3, name: 'Hotel 3', city: 'Cape Town', price: 3100, rating: 5, status: 'Booked' },
        { id: 4, name: 'Hotel 4', city: 'Pretoria', price: 1950, rating: 4, status: 'Available' },
        { id: 5, name: 'Hotel 5', city: 'Sandton', price: 2800, rating: 5, status: 'Available' },
    ];

    return (
        <div className="admin-table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                    <h2 className="filter-title" style={{ fontSize: '1.125rem', margin: 0 }}>
                        Managed Properties ({mockProperties.length})
                    </h2>
                    <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>
                        Oversee inventory, pricing, and availability status across South Africa.
                    </p>
                </div>

                <button onClick={onOpenAddModal} className="btn-search-submit" style={{ width: 'auto', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} />
                    <span>Add New Accommodation</span>
                </button>
            </div>
            {/* Properties management table */}
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Property Name</th>
                        <th>Location</th>
                        <th>Star Rating</th>
                        <th>Nightly Rate</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {mockProperties.map((hotel) => (
                        <tr key={hotel.id}>
                            <td style={{ fontWeight: 800 }}>{hotel.name}</td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={12} color="#656839" />
                                    <span>{hotel.city}</span>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <Star size={12} fill="#d97706" color="#d97706" />
                                    <span>{hotel.rating} Stars</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: 800 }}>R{hotel.price}</td>
                            <td>
                                <span className={`table-status-pill ${hotel.status.toLowerCase()}`}>
                                    {hotel.status}
                                </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button onClick={() => onEditProperty(hotel.id)} className="btn-table-action" style={{ backgroundColor: 'var(--olive-leaf)' }} >
                                        <Edit size={12} />
                                    </button>
                                    <button onClick={() => onDeleteProperty(hotel.id)} className="btn-table-action" style={{ backgroundColor: '#e11d48' }}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};