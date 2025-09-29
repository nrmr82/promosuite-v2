/**
 * Mobile Platform Main App Component
 * Simple placeholder - uses desktop components for now
 */

import React from 'react';
// Import mobile components and layout
import MobileLayout from './layouts/MobileLayout';
import MobileLandingPage from './components/LandingPage';
import MobileDashboard from './components/Dashboard';
import MobileSocialSpark from './components/SocialSpark';
import MobileAuthModal from './modals/AuthModal';
// Import desktop components temporarily for missing mobile components
import ErrorBoundary from '../../components/ErrorBoundary';
import FlyerPro from '../../components/FlyerPro';
import UserCollections from '../../components/UserCollections';
import Pricing from '../../components/Pricing';

const MobileApp = ({ 
  user, 
  currentView, 
  onNavigate, 
  onAuthSuccess, 
  onLogout,
  onNavigateToTool,
  onUpgrade,
  loading
}) => {
  
  // Mobile-specific rendering logic
  const renderMobileView = () => {
    switch (currentView) {
      case 'auth':
        return (
          <MobileAuthModal 
            isOpen={true} 
            onClose={() => onNavigate('socialspark')} 
            onAuthSuccess={onAuthSuccess} 
          />
        );
      case 'home':
      case 'dashboard':
        return <MobileDashboard user={user} onNavigateToTool={onNavigateToTool} />;
      case 'flyerpro':
        return <FlyerPro user={user} />; // TODO: Create MobileFlyerPro
      case 'socialspark':
        return (
          <MobileSocialSpark 
            user={user} 
            onOpenAuth={() => onNavigate('auth')} 
            onToolUsage={() => onNavigate('socialspark')} 
          />
        );
      case 'collections':
        return <UserCollections user={user} />; // TODO: Create MobileCollections
      case 'pricing':
        return <Pricing user={user} onUpgrade={onUpgrade} />; // TODO: Create MobilePricing
      default:
        return <MobileDashboard user={user} onNavigateToTool={onNavigateToTool} />;
    }
  };

  // Show mobile loading
  if (loading) {
    return (
      <div className="mobile-app-loading" style={{ padding: '20px', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p>Loading PromoSuite Mobile...</p>
      </div>
    );
  }

  // Show mobile landing page with mobile layout
  if (!user) {
    return (
      <ErrorBoundary level="mobile">
        <MobileLayout
          currentView={currentView}
          onNavigate={onNavigate}
          user={user}
          onLogout={onLogout}
        >
          <MobileLandingPage onAuthSuccess={onAuthSuccess} />
        </MobileLayout>
      </ErrorBoundary>
    );
  }

  // Main mobile app with proper mobile layout and desktop theme
  return (
    <ErrorBoundary level="mobile">
      <MobileLayout
        currentView={currentView}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
      >
        
        {renderMobileView()}
      </MobileLayout>
    </ErrorBoundary>
  );
};

export default MobileApp;