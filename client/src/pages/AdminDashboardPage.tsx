import React, { useState } from 'react';
import { Building, Calendar, DollarSign, TrendingUp, LogOut, Home, ShieldCheck 
} from 'lucide-react'; // Using Lucide React icons
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

        <button onClick={() => setActiveTab('reservations')} className={`admin-sidebar-link ${activeTab === 'reservations' ? 'active' : ''}`}>
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
              System Status: Connected to Node.ts & PostgreSQL Database
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--mint-sage)', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--dark-khaki)' }}>
            <ShieldCheck size={16} />
            <span>Administrator Session Active</span>
          </div>
        </div>

        {/* 1. Analytics Metrics Card */}
        <div className="analytics-cards-grid">
          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-card-title">Total Revenue</span>
              <DollarSign size={16} color="#656839" />
            </div>
            <div className="metric-card-value">R148,500</div>
          </div>

          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-card-title">Active Properties</span>
              <Building size={16} color="#656839" />
            </div>
            <div className="metric-card-value">8 Lodgings</div>
          </div>

          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-card-title">Total Bookings</span>
              <Calendar size={16} color="#656839" />
            </div>
            <div className="metric-card-value">42 Stays</div>
          </div>

          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-card-title">Occupancy Rate</span>
              <TrendingUp size={16} color="#656839" />
            </div>
            <div className="metric-card-value">84%</div>
          </div>
        </div>

        {/* 2. Dynamic Table Section*/}
        {activeTab === 'properties' ? (
          <PropertiesTable
            onOpenAddModal={() => setIsModalOpen(true)}
            onEditProperty={(id) => alert(`Edit property #${id}`)}
            onDeleteProperty={(id) => alert(`Delete property #${id}`)}
          />
        ) : (
          <ReservationsTable />
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