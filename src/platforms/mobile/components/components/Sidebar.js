import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ user, onLogout, credits }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      section: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'collections', label: 'My Collections', icon: '🗂️', path: '/collections' }
      ]
    },
    {
      section: 'Tools',
      items: [
        { id: 'flyerpro', label: 'FlyerPro', icon: '🎨', path: '/flyerpro', badge: 'New' },
        { id: 'socialspark', label: 'SocialSpark', icon: '📱', path: '/socialspark', badge: 'New' }
      ]
    },
    {
      section: 'Account',
      items: [
        { id: 'pricing', label: 'Upgrade', icon: '⭐', path: '/pricing', badge: 'Pro' }
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false); // Close mobile menu after navigation
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="mobile-sidebar-overlay" 
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar sidebar--mobile ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="logo-icon">PS</div>
            <div className="logo-text">
              <h1 className="logo-title">PromoSuite</h1>
              <p className="logo-subtitle">V2</p>
            </div>
          </div>
          <button 
            className="sidebar__close" 
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar__nav">
          {navigationItems.map((section) => (
            <div key={section.section} className="nav-section">
              <h3 className="section-title">{section.section}</h3>
              <ul className="nav-list">
                {section.items.map((item) => (
                  <li key={item.id} className="nav-item">
                    <button
                      className={`sidebar__nav-item ${
                        location.pathname === item.path ? 'sidebar__nav-item--active' : ''
                      }`}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <span className="sidebar__nav-icon">{item.icon}</span>
                      <span className="sidebar__nav-text">{item.label}</span>
                      {item.badge && (
                        <span className={`nav-badge nav-badge--${item.badge.toLowerCase()}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Credits section */}
        <div className="credits-section">
          <div className="credits-title">Credits</div>
          <div className="credits-amount">{credits || 0}</div>
          <button 
            className="add-credits-btn" 
            onClick={() => handleNavigation('/pricing')}
          >
            Add Credits
          </button>
        </div>

        {/* User section */}
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="avatar-image" />
              ) : (
                user?.email?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="sidebar__user-email">{user?.email || 'No email'}</p>
            </div>
          </div>
          <button 
            className="sidebar__logout-btn"
            onClick={onLogout}
            title="Sign out"
          >
            🚪
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;