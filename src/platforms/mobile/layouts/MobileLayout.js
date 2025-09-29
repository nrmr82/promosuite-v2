/**
 * Mobile Layout Component
 * Mobile-optimized layout that maintains all desktop features and theme
 */

import React, { useState, useRef, useEffect } from 'react';
import BottomNav from '../navigation/BottomNav';
import '../styles/theme.css';
import './MobileLayout.css';

const MobileLayout = ({ children, currentView, onNavigate, user, onLogout }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleUserMenuClick = (action) => {
    setUserDropdownOpen(false);
    if (action === 'logout') {
      onLogout();
    } else {
      onNavigate(action);
    }
  };
  
  return (
    <div className="mobile-layout mobile-app">
      {/* Mobile Header - Desktop Theme */}
      <header className="mobile-header">
        <div className="mobile-header-content mobile-safe-container">
          {/* Desktop Logo Preserved */}
          <div className="mobile-logo">
            <div className="mobile-logo-icon">P</div>
            <div className="mobile-logo-text">
              <div className="mobile-logo-title">PromoSuite</div>
              <div className="mobile-logo-subtitle">AI Marketing</div>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="mobile-user-menu" ref={dropdownRef}>
            {user && (
              <>
                <button 
                  className="mobile-user-button"
                  onClick={() => onNavigate('pricing')}
                >
                  💎
                </button>
                <div className="mobile-user-dropdown-container">
                  <button 
                    className="mobile-user-button mobile-user-avatar"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    {user.profile?.avatar_url ? (
                      <img 
                        src={user.profile.avatar_url} 
                        alt={user.profile?.full_name || user.email}
                        className="mobile-user-avatar-img"
                      />
                    ) : (
                      user.email?.charAt(0).toUpperCase()
                    )}
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="mobile-user-dropdown">
                      <div className="mobile-user-info">
                        <div className="mobile-user-name">
                          {user.profile?.full_name || user.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="mobile-user-email">{user.email}</div>
                      </div>
                      
                      <div className="mobile-dropdown-divider"></div>
                      
                      <button 
                        className="mobile-dropdown-item"
                        onClick={() => handleUserMenuClick('profile')}
                      >
                        <span className="mobile-dropdown-icon">👤</span>
                        <span className="mobile-dropdown-text">Profile</span>
                      </button>
                      
                      <button 
                        className="mobile-dropdown-item"
                        onClick={() => handleUserMenuClick('settings')}
                      >
                        <span className="mobile-dropdown-icon">⚙️</span>
                        <span className="mobile-dropdown-text">Settings</span>
                      </button>
                      
                      <div className="mobile-dropdown-divider"></div>
                      
                      <button 
                        className="mobile-dropdown-item mobile-dropdown-logout"
                        onClick={() => handleUserMenuClick('logout')}
                      >
                        <span className="mobile-dropdown-icon">🚪</span>
                        <span className="mobile-dropdown-text">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area with scroll */}
      <main className="mobile-main-content mobile-scroll-container">
        <div className="mobile-content-wrapper mobile-safe-container">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav 
        currentView={currentView}
        onNavigate={onNavigate}
        user={user}
      />
    </div>
  );
};

export default MobileLayout;