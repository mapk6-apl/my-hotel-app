import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { adminApi, type AccommodationPayload, type AdminAccommodation } from '../../api/adminApi.js';
import '../../styles/screen2.css';

export type AccommodationModalProps = {
  isOpen: boolean;
  property?: AdminAccommodation | null;
  onClose: () => void;
  onSaved: () => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
};

const emptyForm = {
  name: '',
  city: '',
  address: '',
  description: '',
  starting_price: '',
  star_rating: '4',
  hero_image: '',
  room_type: 'Standard Room',
  capacity: '2',
};

export const AccommodationModal: React.FC<AccommodationModalProps> = ({
  isOpen,
  property,
  onClose,
  onSaved,
  onNotify,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setForm(property ? {
      ...emptyForm,
      name: property.name,
      city: property.city,
      address: property.address,
      description: property.description,
      starting_price: String(property.starting_price),
      star_rating: String(property.star_rating),
      hero_image: property.hero_image ?? '',
    } : emptyForm);
  }, [isOpen, property]);

  if (!isOpen) return null;

  const setField = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload: AccommodationPayload = {
      name: form.name.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      description: form.description.trim(),
      starting_price: Number(form.starting_price),
      star_rating: Number(form.star_rating),
      room_type: form.room_type.trim(),
      capacity: Number(form.capacity),
      ...(form.hero_image.trim() ? { hero_image: form.hero_image.trim() } : {}),
    };

    try {
      if (property) await adminApi.updateAccommodation(property.id, payload);
      else await adminApi.createAccommodation(payload);
      onNotify(property ? 'Property updated.' : 'Property created.', 'success');
      onSaved();
    } catch (requestError: unknown) {
      const message = axios.isAxiosError<{ error?: string }>(requestError)
        ? requestError.response?.data?.error || requestError.message
        : requestError instanceof Error ? requestError.message : 'Unable to save property.';
      setError(message);
      onNotify(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay" role="presentation">
      <section className="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="property-modal-title" style={{ maxWidth: '38rem' }}>
        <button type="button" onClick={onClose} className="auth-close-btn" aria-label="Close Modal"><X size={20} /></button>
        <div className="auth-header">
          <h2 id="property-modal-title" className="auth-title">{property ? 'Edit Accommodation' : 'Add New Accommodation'}</h2>
          <p className="auth-subtitle">Property information and room pricing</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="property-name">Property name</label>
            <input id="property-name" required value={form.name} onChange={(event) => setField('name', event.target.value)} className="auth-input" />
          </div>
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="property-city">City</label>
            <input id="property-city" required value={form.city} onChange={(event) => setField('city', event.target.value)} className="auth-input" />
          </div>
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="property-address">Street address</label>
            <input id="property-address" required value={form.address} onChange={(event) => setField('address', event.target.value)} className="auth-input" />
          </div>
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="property-description">Description</label>
            <textarea id="property-description" required value={form.description} onChange={(event) => setField('description', event.target.value)} className="auth-input" rows={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="property-price">Starting room price (ZAR)</label>
              <input id="property-price" type="number" min="1" step="0.01" required value={form.starting_price} onChange={(event) => setField('starting_price', event.target.value)} className="auth-input" />
            </div>
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="property-rating">Property star rating</label>
              <input id="property-rating" type="number" min="0" max="5" step="0.1" required value={form.star_rating} onChange={(event) => setField('star_rating', event.target.value)} className="auth-input" />
            </div>
          </div>
          {!property && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="property-room-type">Initial room type</label>
                <input id="property-room-type" required value={form.room_type} onChange={(event) => setField('room_type', event.target.value)} className="auth-input" />
              </div>
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="property-capacity">Room capacity</label>
                <input id="property-capacity" type="number" min="1" required value={form.capacity} onChange={(event) => setField('capacity', event.target.value)} className="auth-input" />
              </div>
            </div>
          )}
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="property-image">Hero image URL (optional)</label>
            <input id="property-image" type="url" value={form.hero_image} onChange={(event) => setField('hero_image', event.target.value)} className="auth-input" />
          </div>
          {error && <p role="alert" className="auth-error-alert">{error}</p>}
          <button type="submit" disabled={submitting} className="auth-submit-btn" style={{ marginTop: '1rem' }}>
            {submitting ? 'Saving…' : property ? 'Save changes' : 'Create accommodation'}
          </button>
        </form>
      </section>
    </div>
  );
};
