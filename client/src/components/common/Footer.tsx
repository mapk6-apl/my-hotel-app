import React from 'react';
//import '../../styles/screen1.css'; 

export const Footer: React.FC = () => {
    return (
        <footer className="app-footer">
            <div>
                <p style={{ fontWeight: 800, textTransform: 'uppercase', color: '#ffffff', margin: 0 }}> Break-Away Hotels & Resorts </p>
                <p style={{ color: 'var(--mint-sage)', margin: '0.25rem 0' }}> Premium Lodging across Durban, Pretoria, Cape Town & Sandton. </p>
                <p style={{ opacity: 0.6, fontSize: '0.625rem', margin: 0 }}> © {new Date().getFullYear()} Break-Away App. All rights reserved. </p>
            </div>
        </footer>
    );
};