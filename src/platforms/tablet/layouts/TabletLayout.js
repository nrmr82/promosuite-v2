/**
 * Tablet Layout Component
 * Provides tablet-specific layout structure with sidebar navigation
 */

import React from 'react';
import './TabletLayout.css';

const TabletLayout = ({ children, currentView, onNavigate, user, onLogout }) => {
  return (
    <div className="tablet-layout">
      {/* Tablet Sidebar Navigation */}
      {user && (
        <aside className="tablet-sidebar">
          <div className="tablet-sidebar-header">
            <div className="tablet-logo">PromoSuite</div>
          </div>
          
          <nav className="tablet-sidebar-nav">
            <button 
              className={`tablet-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              <span className="tablet-nav-icon">🏠</span>
              <span className="tablet-nav-label">Dashboard</span>
            </button>
            
            <button 
              className={`tablet-nav-item ${currentView === 'socialspark' ? 'active' : ''}`}
              onClick={() => onNavigate('socialspark')}
            >
              <span className="tablet-nav-icon">✨</span>
              <span className="tablet-nav-label">SocialSpark</span>
            </button>
            
            <button 
              className={`tablet-nav-item ${currentView === 'flyerpro' ? 'active' : ''}`}
              onClick={() => onNavigate('flyerpro')}
            >
              <span className="tablet-nav-icon">📄</span>
              <span className="tablet-nav-label">FlyerPro</span>
            </button>
            
            <button 
              className={`tablet-nav-item ${currentView === 'collections' ? 'active' : ''}`}
              onClick={() => onNavigate('collections')}
            >
              <span className="tablet-nav-icon">📁</span>
              <span className="tablet-nav-label">Collections</span>
            </button>
            
            <button 
              className={`tablet-nav-item ${currentView === 'pricing' ? 'active' : ''}`}
              onClick={() => onNavigate('pricing')}
            >
              <span className="tablet-nav-icon">💎</span>
              <span className="tablet-nav-label">Pricing</span>
            </button>
          </nav>

          <div className="tablet-sidebar-footer">
            <div className="tablet-user-info">
              {user.email}
            </div>
            <button 
              className="tablet-logout-button"
              onClick={onLogout}
            >
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`tablet-main-content ${user ? 'with-sidebar' : 'full-width'}`}>
        {/* Tablet Header for unauthenticated users */}
        {!user && (
          <header className="tablet-header">
            <div className="tablet-header-content">
              <div className="tablet-logo">PromoSuite</div>
            </div>
          </header>
        )}
        
        <div className="tablet-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default TabletLayout;