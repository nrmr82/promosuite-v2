import React, { useState } from 'react';
import { FaHome, FaPalette, FaVideo, FaCrown, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import useClickOutside from '../hooks/useClickOutside';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ currentView = 'home', onNavigate, user }) => {
  const { signOut } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Hook to handle clicks outside dropdown
  const dropdownRef = useClickOutside(() => {
    setUserDropdownOpen(false);
  });
  
  // Debug logging to see what user data we're receiving
  React.useEffect(() => {
    console.log('🔍 Sidebar: User data received:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      hasProfile: !!user?.profile,
      profileName: user?.profile?.full_name,
      profileEmail: user?.profile?.email,
      provider: user?.profile?.provider || user?.app_metadata?.provider,
      isDemoUser: user?.id === 'demo-user' || user?.email === 'demo@promosuite.com'
    });
  }, [user]);

  const handleNavigation = (view) => {
    if (onNavigate) {
      onNavigate(view);
    }
    setUserDropdownOpen(false);
  };


  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <svg width="180" height="40" viewBox="0 0 180 40" fill="none">
            <defs>
              <linearGradient id="sidebarPinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e91e63" />
                <stop offset="100%" stopColor="#d81b60" />
              </linearGradient>
            </defs>
            
            {/* Circular background - Smaller */}
            <circle cx="20" cy="20" r="14" stroke="url(#sidebarPinkGradient)" strokeWidth="2" fill="none" />
            
            {/* House icon - Smaller */}
            <g transform="translate(12, 12)">
              {/* House roof */}
              <path d="M1 10L8 3L15 10H13.5V14H2.5V10H1Z" stroke="url(#sidebarPinkGradient)" strokeWidth="1.2" fill="none" />
              
              {/* House base */}
              <rect x="2.5" y="10" width="11" height="4" stroke="url(#sidebarPinkGradient)" strokeWidth="1.2" fill="none" />
              
              {/* Play button triangle */}
              <path d="M6 8L10 10L6 12V8Z" fill="url(#sidebarPinkGradient)" />
            </g>
            
            {/* PromoSuite Text - Horizontal, Larger */}
            <text x="42" y="25" fontSize="18" fontWeight="400" fill="rgba(255,255,255,0.9)" letterSpacing="-0.3px">Promo</text>
            <text x="95" y="25" fontSize="18" fontWeight="600" fill="#e91e63" letterSpacing="-0.3px">Suite</text>
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <button 
          className={`sidebar__nav-item ${currentView === 'home' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => handleNavigation('home')}
        >
          <span className="sidebar__nav-icon"><FaHome /></span>
          <span className="sidebar__nav-text">Dashboard</span>
        </button>
        
        <button 
          className={`sidebar__nav-item ${currentView === 'flyerpro' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => handleNavigation('flyerpro')}
        >
          <span className="sidebar__nav-icon"><FaPalette /></span>
          <span className="sidebar__nav-text">FlyerPro</span>
        </button>
        
        <button 
          className={`sidebar__nav-item ${currentView === 'socialspark' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => handleNavigation('socialspark')}
        >
          <span className="sidebar__nav-icon"><FaVideo /></span>
          <span className="sidebar__nav-text">SocialSpark</span>
        </button>
        
        
        
        <button 
          className={`sidebar__nav-item ${currentView === 'pricing' ? 'sidebar__nav-item--active' : ''}`}
          onClick={() => handleNavigation('pricing')}
        >
          <span className="sidebar__nav-icon"><FaCrown /></span>
          <span className="sidebar__nav-text">Pricing</span>
        </button>
      </nav>

      {/* User Profile Footer */}
      {user && (
        <div className="sidebar__footer">
          <div 
            className="sidebar__user sidebar__user--dropdown"
            ref={dropdownRef}
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          >
            <div className="sidebar__user-main">
              <div className="sidebar__user-avatar">
                {user.profile?.avatar_url ? (
                  <img src={user.profile.avatar_url} alt={user.profile?.full_name || user.email} />
                ) : (
                  <span>{(user.profile?.full_name || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="sidebar__user-info">
                <div className="sidebar__user-name">{user.profile?.full_name || user.email?.split('@')[0] || 'User'}</div>
                <div className="sidebar__user-email">{user.email}</div>
              </div>
            </div>
            
            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="sidebar__user-dropdown">
                <button 
                  className={`sidebar__dropdown-item ${currentView === 'profile' ? 'sidebar__dropdown-item--active' : ''}`}
                  onClick={() => handleNavigation('profile')}
                >
                  <span className="sidebar__dropdown-icon"><FaUser /></span>
                  <span className="sidebar__dropdown-text">Profile</span>
                </button>
                
                <button 
                  className={`sidebar__dropdown-item ${currentView === 'settings' ? 'sidebar__dropdown-item--active' : ''}`}
                  onClick={() => handleNavigation('settings')}
                >
                  <span className="sidebar__dropdown-icon"><FaCog /></span>
                  <span className="sidebar__dropdown-text">Settings</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={async () => {
              console.log('🔐 Sidebar: Logout button clicked');
              await signOut();
            }}
            style={{
              background: '#e91e63',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '0.75rem',
              width: '100%',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.background = '#d81b60'}
            onMouseLeave={e => e.target.style.background = '#e91e63'}
          >
            <FaSignOutAlt style={{ marginRight: '0.5rem' }} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};


export default Sidebar;

