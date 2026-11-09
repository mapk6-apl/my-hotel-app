import React from 'react';
import { Edit, Trash2, Plus, Star, MapPin, Images } from 'lucide-react';
import type { AdminAccommodation } from '../../api/adminApi.js';
import '../../styles/screen6.css';

export type PropertiesTableProps = {
    properties: AdminAccommodation[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
    onOpenAddModal: () => void;
    onEditProperty: (hotelId: number) => void;
    onDeleteProperty: (hotelId: number) => void;
    onImportImages: (hotelId: number) => void;
    importingImagesId: number | null;
};

const formatStartingPrice = (price: number | string): string => {
    const amount = Number(price);
    if (!Number.isFinite(amount) || amount <= 0) return 'Not set';
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export const PropertiesTable: React.FC<PropertiesTableProps> = ({
    properties,
    loading,
    error,
    onRetry,
    onOpenAddModal,
    onEditProperty,
    onDeleteProperty,
    onImportImages,
    importingImagesId,
}) => (
    <div className="admin-table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
                <h2 className="filter-title" style={{ fontSize: '1.125rem', margin: 0 }}>
                    Managed Properties ({loading ? '…' : properties.length})
                </h2>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>
                    Database-listed accommodations and their starting room rates.
                </p>
            </div>

            <button onClick={onOpenAddModal} className="btn-search-submit" style={{ width: 'auto', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} />
                <span>Add New Accommodation</span>
            </button>
        </div>

        {error ? (
            <div role="alert" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--dark-khaki)' }}>
                <p>Properties could not be loaded: {error}</p>
                <button type="button" onClick={onRetry} className="btn-search-submit" style={{ width: 'auto' }}>
                    Try again
                </button>
            </div>
        ) : loading ? (
            <div role="status" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--dark-khaki)' }}>
                Loading properties…
            </div>
        ) : properties.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--dark-khaki)' }}>
                No properties found.
            </div>
        ) : (
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Property Name</th>
                        <th>Location</th>
                        <th>Star Rating</th>
                        <th>Starting Nightly Rate</th>
                        <th>Address</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map((property) => (
                        <tr key={property.id}>
                            <td style={{ fontWeight: 800 }}>{property.name}</td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={12} color="#656839" />
                                    <span>{property.city}</span>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <Star size={12} fill="#d97706" color="#d97706" />
                                    <span>{Number(property.star_rating).toFixed(1)} Stars</span>
                                </div>
                            </td>
                            <td style={{ fontWeight: 800 }}>{formatStartingPrice(property.starting_price)}</td>
                            <td>{property.address}</td>
                            <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        aria-label={`Import representative images for ${property.name}`}
                                        title="Import representative Unsplash images"
                                        onClick={() => onImportImages(property.id)}
                                        disabled={importingImagesId === property.id}
                                        className="btn-table-action"
                                    >
                                        <Images size={12} />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Edit ${property.name}`}
                                        onClick={() => onEditProperty(property.id)}
                                        className="btn-table-action"
                                        style={{ backgroundColor: 'var(--olive-leaf)' }}
                                    >
                                        <Edit size={12} />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Delete ${property.name}`}
                                        onClick={() => onDeleteProperty(property.id)}
                                        className="btn-table-action"
                                        style={{ backgroundColor: '#e11d48' }}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);
