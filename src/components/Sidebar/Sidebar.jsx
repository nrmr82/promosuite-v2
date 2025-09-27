import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiHome, 
  FiLayers, 
  FiImage, 
  FiChevronLeft,
  FiChevronRight,
  FiZap,
  FiVideo,
  FiFolder,
  FiLogOut
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ 
  user,
  currentView,
  onNavigate
}) => {
  const { signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections = [
    {
      title: 'CREATIVE TOOLS',
      items: [
        {
          id: 'home',
          label: 'Home',
          icon: FiHome,
          view: 'home'
        },
        {
          id: 'ai-flyer',
          label: 'AI Flyer',
          icon: FiImage,
          view: 'ai-flyer'
        },
        {
          id: 'social-spark',
          label: 'Social Spark',
          icon: FiVideo,
          view: 'social-spark',
          badge: { text: 'New', type: 'new' }
        },
        {
          id: 'templates',
          label: 'Templates',
          icon: FiFolder,
          view: 'templates'
        }
      ]
    },
    {
      title: 'USER',
      items: [
        {
          id: 'collections',
          label: 'Collections',
          icon: FiFolder,
          view: 'collections'
        },
        {
          id: 'pricing',
          label: 'Pricing',
          icon: FiLayers,
          view: 'pricing',
          badge: { text: 'Discount', type: 'discount' }
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: FiLogOut,
          action: 'logout'
        }
      ]
    }
  ];

  const handleNavigation = async (item) => {
    if (item.action === 'logout') {
      await signOut();
    } else {
      onNavigate(item.view);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="logo-icon">
            <FiZap />
          </div>
          {!isCollapsed && (
            <span className="logo-text">PromoSuite</span>
          )}
        </div>
        
        <button 
          className="sidebar__toggle"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">
            <img 
              src={user.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.profile?.full_name || user.email)}&background=0ea5e9&color=fff`}
              alt={user.profile?.full_name || user.email}
              className="avatar-image"
            />
          </div>
          {!isCollapsed && (
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">
                {user.profile?.full_name || 'User'}
              </div>
              <div className="sidebar__user-email">
                {user.email}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar__nav">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="nav-section">
            <h2 className="section-title">{section.title}</h2>
            <ul className="nav-list">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentView === item.view;
                
                return (
                  <li key={item.id} className="nav-item">
                    <button
                      className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                      onClick={() => handleNavigation(item)}
                      aria-current={isActive ? 'page' : undefined}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <IconComponent className="nav-icon" />
                      {!isCollapsed && (
                        <div className="nav-content">
                          <span className="nav-label">{item.label}</span>
                          {item.badge && (
                            <span className={`nav-badge nav-badge--${item.badge.type}`}>
                              {item.badge.text}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Credits Section */}
      <div className="credits-section">
        <div className="credits-title">Credits</div>
        <div className="credits-amount">500</div>
        <button className="add-credits-btn">
          Add Credits
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
