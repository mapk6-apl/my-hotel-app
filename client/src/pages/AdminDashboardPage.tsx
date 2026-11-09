import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Building, Calendar, Users, Home, ShieldCheck, LogOut } from 'lucide-react';
import { adminApi, type AdminAccommodation, type AdminBooking, type AdminStatistics } from '../api/adminApi.js';
import { logout } from '../store/slices/authSlice.js';
import type { AppDispatch } from '../store/store.js';
import { PropertiesTable } from '../components/admin/PropertiesTable.js';
import { ReservationsTable } from '../components/admin/ReservationsTable.js';
import { AccommodationModal } from '../components/admin/AccommodationModal.js';
import '../styles/screen6.css';

export type AdminDashboardPageProps = {
  onNavigateHome: () => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
};

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateHome, onNotify }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'properties' | 'reservations'>('properties');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] = useState<AdminAccommodation | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<AdminAccommodation | null>(null);
  const [deletingProperty, setDeletingProperty] = useState(false);
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const [properties, setProperties] = useState<AdminAccommodation[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [importingImagesId, setImportingImagesId] = useState<number | null>(null);

  const confirmLogout = () => {
    dispatch(logout());
    setIsLogoutConfirmOpen(false);
    onNotify('You have been signed out.', 'success');
    navigate('/', { replace: true });
  };

  const getRequestError = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError<{ error?: string }>(error)) {
      return error.response?.data?.error || error.message || fallback;
    }
    return error instanceof Error ? error.message : fallback;
  };

  const loadStatistics = useCallback(async () => {
    setStatisticsLoading(true);
    setStatisticsError(null);
    try {
      const response = await adminApi.getStatistics();
      if (!response.success || !response.data) {
        throw new Error('The server returned incomplete dashboard statistics.');
      }
      setStatistics(response.data);
    } catch (error: unknown) {
      setStatisticsError(getRequestError(error, 'Unable to load dashboard statistics.'));
    } finally {
      setStatisticsLoading(false);
    }
  }, []);

  const loadProperties = useCallback(async () => {
    setPropertiesLoading(true);
    setPropertiesError(null);
    try {
      const response = await adminApi.getAllAccommodations();
      if (!response.success || !Array.isArray(response.data)) {
        throw new Error('The server returned an invalid properties list.');
      }
      setProperties(response.data);
    } catch (error: unknown) {
      setPropertiesError(getRequestError(error, 'Unable to load properties.'));
    } finally {
      setPropertiesLoading(false);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const response = await adminApi.getAllReservations();
      if (!response.success || !Array.isArray(response.data)) {
        throw new Error('The server returned an invalid bookings list.');
      }
      setBookings(response.data);
    } catch (error: unknown) {
      setBookingsError(getRequestError(error, 'Unable to load customer bookings.'));
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const saveBookingStatus = async (reservationId: number, status: string) => {
    try {
      await adminApi.updateBookingStatus(reservationId, status);
      onNotify(`Reservation #${reservationId} updated to ${status}.`, 'success');
      await loadBookings();
    } catch (error: unknown) {
      onNotify(getRequestError(error, 'Unable to update reservation status.'), 'error');
    }
  };

  const importPropertyImages = async (propertyId: number) => {
    setImportingImagesId(propertyId);
    try {
      const result = await adminApi.importPropertyImages(propertyId);
      onNotify(`Imported ${result.count} representative property images.`, 'success');
      await loadProperties();
    } catch (error: unknown) {
      onNotify(getRequestError(error, 'Unable to import property images.'), 'error');
    } finally {
      setImportingImagesId(null);
    }
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    setDeletingProperty(true);
    try {
      await adminApi.deleteAccommodation(propertyToDelete.id);
      onNotify(`${propertyToDelete.name} deleted.`, 'success');
      setPropertyToDelete(null);
      await Promise.all([loadProperties(), loadStatistics()]);
    } catch (error: unknown) {
      onNotify(getRequestError(error, 'Unable to delete property.'), 'error');
    } finally {
      setDeletingProperty(false);
    }
  };

  const openAddProperty = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  const openEditProperty = (id: number) => {
    const property = properties.find((item) => item.id === id);
    if (property) {
      setEditingProperty(property);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    void loadStatistics();
    void loadProperties();
    void loadBookings();
  }, [loadBookings, loadProperties, loadStatistics]);

  const formatCount = (value: number | undefined): string =>
    typeof value === 'number' && Number.isFinite(value)
      ? new Intl.NumberFormat('en-ZA').format(value)
      : 'Unavailable';

  return (
    <div className="admin-layout-container">
      
      {/* Admin Sidebar Navigation */}
      <aside className="admin-sidebar-nav">
        {/* Brand Logo */}
        <div style={{ padding: '0.5rem 0.5rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 900, fontSize: '1.125rem', letterSpacing: '0.05em' }}>
            BREAK-AWAY
          </div>
          <span style={{ fontSize: '0.625rem', color: 'var(--mint-sage)', fontWeight: 800, textTransform: 'uppercase' }}>
            Admin Control Hub
          </span>
        </div>

        <button onClick={() => setActiveTab('properties')} className={`admin-sidebar-link ${activeTab === 'properties' ? 'active' : ''}`}>
          <Building size={18} />
          <span>Properties</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('reservations');
            void loadBookings();
          }}
          className={`admin-sidebar-link ${activeTab === 'reservations' ? 'active' : ''}`}
        >
          <Calendar size={18} />
          <span>Customer Bookings</span>
        </button>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button onClick={() => setIsLogoutConfirmOpen(true)} className="admin-sidebar-link">
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
          <button onClick={onNavigateHome} className="admin-sidebar-link">
            <Home size={18} />
            <span>Public Site Home</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="admin-main-workspace">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--dark-khaki)', margin: 0 }}>
              Admin management
            </h1>
            <p style={{ fontSize: '0.8125rem', opacity: 0.8, color: 'var(--dark-khaki)', margin: '0.25rem 0 0' }}>
              Manage live accommodation records and customer bookings.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--mint-sage)', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--dark-khaki)' }}>
            <ShieldCheck size={16} />
            <span>Administrator Session Active</span>
          </div>
        </div>

        {/* 1. Database-backed dashboard metrics */}
        <div className="analytics-cards-grid">
          {statisticsError ? (
            <div role="alert" style={{ gridColumn: '1 / -1', color: 'var(--dark-khaki)' }}>
              <p>Dashboard statistics could not be loaded: {statisticsError}</p>
              <button type="button" onClick={() => void loadStatistics()} className="btn-search-submit" style={{ width: 'auto' }}>
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="metric-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="metric-card-title">Properties</span>
                  <Building size={16} color="#656839" />
                </div>
                <div className="metric-card-value">
                  {statisticsLoading ? 'Loading…' : formatCount(statistics?.totalHotels)}
                </div>
              </div>

              <div className="metric-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="metric-card-title">Total Bookings</span>
                  <Calendar size={16} color="#656839" />
                </div>
                <div className="metric-card-value">
                  {statisticsLoading ? 'Loading…' : formatCount(statistics?.totalBookings)}
                </div>
              </div>

              <div className="metric-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="metric-card-title">Guest Accounts</span>
                  <Users size={16} color="#656839" />
                </div>
                <div className="metric-card-value">
                  {statisticsLoading ? 'Loading…' : formatCount(statistics?.totalGuests)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. Dynamic Table Section*/}
        {activeTab === 'properties' ? (
          <PropertiesTable
            properties={properties}
            loading={propertiesLoading}
            error={propertiesError}
            onRetry={() => void loadProperties()}
            onOpenAddModal={openAddProperty}
            onEditProperty={openEditProperty}
            onDeleteProperty={(id) => {
              const property = properties.find((item) => item.id === id);
              if (property) setPropertyToDelete(property);
            }}
            onImportImages={(id) => void importPropertyImages(id)}
            importingImagesId={importingImagesId}
          />
        ) : (
          <ReservationsTable
            bookings={bookings}
            loading={bookingsLoading}
            error={bookingsError}
            onRefresh={() => void loadBookings()}
            onUpdateStatus={saveBookingStatus}
          />
        )}

        {/* 3. Add Property Modal */}
        <AccommodationModal
          isOpen={isModalOpen}
          property={editingProperty}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            void Promise.all([loadProperties(), loadStatistics()]);
          }}
          onNotify={onNotify}
        />

      </main>

      {propertyToDelete && (
        <div className="auth-modal-overlay" role="presentation">
          <section className="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-property-title">
            <h2 id="delete-property-title" className="auth-title">Delete property?</h2>
            <p>
              Delete <strong>{propertyToDelete.name}</strong>? Properties with reservation history cannot be deleted.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn-reset" onClick={() => setPropertyToDelete(null)} disabled={deletingProperty}>
                Keep property
              </button>
              <button type="button" className="btn-search-submit" onClick={() => void confirmDeleteProperty()} disabled={deletingProperty}>
                {deletingProperty ? 'Checking…' : 'Delete property'}
              </button>
            </div>
          </section>
        </div>
      )}
      {isLogoutConfirmOpen && (
        <div className="auth-modal-overlay" role="presentation">
          <section className="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="admin-logout-title">
            <h2 id="admin-logout-title" className="auth-title">Sign out?</h2>
            <p className="auth-subtitle">You can sign in again at any time.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn-reset" onClick={() => setIsLogoutConfirmOpen(false)}>Stay signed in</button>
              <button type="button" className="btn-search-submit" onClick={confirmLogout}>Sign out</button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
};