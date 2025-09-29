/**
 * Tablet Platform Main App Component
 * Simple "Coming Soon" page for tablet devices
 */

import React from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
import LandingPage from '../../components/LandingPage';

const TabletApp = ({ 
  user, 
  currentView, 
  onNavigate, 
  onAuthSuccess, 
  onLogout,
  onNavigateToTool,
  onUpgrade,
  loading
}) => {
  
  // Simple coming soon component for tablet
  const ComingSoonPage = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        background: 'rgba(42, 42, 42, 0.8)',
        border: '1px solid rgba(68, 68, 68, 0.5)',
        borderRadius: '16px',
        padding: '3rem',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#e91e63',
          borderRadius: '50%',
          margin: '0 auto 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}>📱</div>
        
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 1rem 0',
          letterSpacing: '-0.02em'
        }}>PromoSuite Tablet</h1>
        
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#e91e63',
          margin: '0 0 1.5rem 0'
        }}>Coming Soon</h2>
        
        <p style={{
          fontSize: '1.1rem',
          color: '#aaaaaa',
          margin: '0 0 2rem 0',
          lineHeight: '1.6'
        }}>We're working on an amazing tablet experience for PromoSuite. For now, please use our mobile app on your phone or the desktop version on your computer.</p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: 'rgba(233, 30, 99, 0.1)',
            border: '1px solid rgba(233, 30, 99, 0.3)',
            borderRadius: '8px',
            padding: '1rem 1.5rem',
            color: '#e91e63',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>📱 Use Mobile App</div>
          
          <div style={{
            background: 'rgba(233, 30, 99, 0.1)',
            border: '1px solid rgba(233, 30, 99, 0.3)',
            borderRadius: '8px',
            padding: '1rem 1.5rem',
            color: '#e91e63',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>🖥️ Use Desktop Version</div>
        </div>
        
        {user && (
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(68, 68, 68, 0.3)'
          }}>
            <p style={{
              fontSize: '0.9rem',
              color: '#666',
              margin: '0 0 1rem 0'
            }}>Signed in as {user.email}</p>
            <button 
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#aaaaaa',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Show tablet loading
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff'
      }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #e91e63',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
      </div>
    );
  }

  // Show tablet landing page for non-authenticated users
  if (!user) {
    return (
      <ErrorBoundary level="tablet">
        <LandingPage onAuthSuccess={onAuthSuccess} />
      </ErrorBoundary>
    );
  }

  // Always show coming soon page for authenticated users
  return (
    <ErrorBoundary level="tablet">
      <ComingSoonPage />
    </ErrorBoundary>
  );
};

export default TabletApp;