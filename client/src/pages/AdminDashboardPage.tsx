import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Building, Calendar, Users, Home, ShieldCheck } from 'lucide-react';
import { adminApi, type AdminAccommodation, type AdminBooking, type AdminStatistics } from '../api/adminApi.js';
import { PropertiesTable } from '../components/admin/PropertiesTable.js';
import { ReservationsTable } from '../components/admin/ReservationsTable.js';
import { AccommodationModal } from '../components/admin/AccommodationModal.js';
import '../styles/screen6.css';

export type AdminDashboardPageProps = {
  onNavigateHome: () => void;
};

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'reservations'>('properties');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const [properties, setProperties] = useState<AdminAccommodation[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

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
              Admin Management Portal
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
            onOpenAddModal={() => setIsModalOpen(true)}
            onEditProperty={(id: number) => alert(`Edit property #${id}`)}
            onDeleteProperty={(id: number) => alert(`Delete property #${id}`)}
          />
        ) : (
          <ReservationsTable
            bookings={bookings}
            loading={bookingsLoading}
            error={bookingsError}
            onRefresh={() => void loadBookings()}
          />
        )}

        {/* 3. Add Property Modal */}
        <AccommodationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

      </main>

    </div>
  );
};