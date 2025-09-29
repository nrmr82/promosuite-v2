/**
 * Mobile Bottom Navigation
 * Fixed bottom navigation with desktop theme and all desktop features
 */

import React from 'react';
import './BottomNav.css';

const BottomNav = ({ currentView, onNavigate, user }) => {
  if (!user) return null; // Only show for authenticated users

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      onClick: () => onNavigate('dashboard')
    },
    {
      id: 'socialspark',
      label: 'SocialSpark',
      icon: '✨',
      onClick: () => onNavigate('socialspark')
    },
    {
      id: 'flyerpro',
      label: 'FlyerPro',
      icon: '📄',
      onClick: () => onNavigate('flyerpro')
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: '📁',
      onClick: () => onNavigate('collections')
    }
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav__container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-bottom-nav__item ${
              currentView === item.id ? 'mobile-bottom-nav__item--active' : ''
            }`}
            onClick={item.onClick}
            aria-label={item.label}
          >
            <span className="mobile-bottom-nav__icon">
              {item.icon}
            </span>
            <span className="mobile-bottom-nav__label">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;