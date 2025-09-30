import React, { useState, useEffect } from 'react';
import { useProduct } from '../contexts/ProductContext';
import Sidebar from './Sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../../../components/AppLayout.css';

const AppLayout = ({ 
  children, 
  currentPage = 'home',
  onNavigate,
  className = '',
  hideNavigation = false,
  user 
}) => {
  const { 
    currentProduct, 
    switchProduct, 
    sidebarCollapsed, 
    toggleSidebar 
  } = useProduct();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.sidebar') && !event.target.closest('.mobile-menu-btn')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  // Handle navigation
  const handleNavigate = (path, pageId) => {
    // Close mobile menu when navigating
    setMobileMenuOpen(false);
    
    if (onNavigate) {
      onNavigate(path, pageId);
    } else {
      // Default navigation behavior
      console.log(`Navigate to: ${path} (${pageId})`);
    }
  };

  // Handle product switching
  const handleProductSwitch = (product) => {
    switchProduct(product);
    
    // Navigate to the product's dashboard
    const productRoutes = {
      flyerpro: '/flyerpro',
      socialspark: '/socialspark'
    };
    
    handleNavigate(productRoutes[product], `${product}-dashboard`);
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      toggleSidebar();
    }
  };

  // Don't show sidebar for unauthenticated users or when explicitly hidden
  const shouldShowSidebar = user && !hideNavigation;
  
  return (
    <div className={`app-layout ${className}`}>
      {/* Mobile Header */}
      {shouldShowSidebar && isMobile && (
        <div className="mobile-header">
          <button 
            className="mobile-menu-btn"
            onClick={handleSidebarToggle}
          >
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          
          <div className="mobile-product-info">
            <span className="mobile-product-name">
              {currentProduct === 'flyerpro' ? 'FlyerPro' : 'SocialSpark'}
            </span>
          </div>
          
          <div className="mobile-user-avatar">
            {user?.profile?.avatar_url ? (
              <img 
                src={user.profile.avatar_url} 
                alt={`${user?.name || user?.email || 'User'} profile`} 
              />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar */}
      {shouldShowSidebar && (
        <>
          <Sidebar
            user={user}
            currentProduct={currentProduct}
            currentPage={currentPage}
            isCollapsed={isMobile ? false : sidebarCollapsed}
            onNavigate={handleNavigate}
            onProductSwitch={handleProductSwitch}
            onToggleCollapse={handleSidebarToggle}
          />
          
          {/* Mobile overlay */}
          {isMobile && mobileMenuOpen && (
            <div 
              className="mobile-overlay"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          
          {/* Sidebar class application */}
          <div className={`sidebar-backdrop ${
            isMobile 
              ? (mobileMenuOpen ? 'mobile-open' : 'mobile-closed')
              : (sidebarCollapsed ? 'collapsed' : 'expanded')
          }`} />
        </>
      )}

      {/* Main Content */}
      <main className={`main-content ${
        shouldShowSidebar 
          ? (isMobile 
              ? 'with-mobile-header' 
              : (sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded')
            )
          : 'full-width'
      }`}>
        {children}
      </main>

      {/* Keyboard shortcuts overlay (hidden by default) */}
      <div className="keyboard-shortcuts">
        <div className="shortcuts-content">
          <h4>Keyboard Shortcuts</h4>
          <div className="shortcut-list">
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>B</kbd>
              <span>Toggle Sidebar</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>1</kbd>
              <span>Switch to FlyerPro</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>2</kbd>
              <span>Switch to SocialSpark</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// HOC for pages that need layout
export const withLayout = (Component, options = {}) => {
  return function LayoutWrappedComponent(props) {
    return (
      <AppLayout 
        currentPage={options.currentPage}
        onNavigate={options.onNavigate}
        className={options.className}
        hideNavigation={options.hideNavigation}
      >
        <Component {...props} />
      </AppLayout>
    );
  };
};

export default AppLayout;
