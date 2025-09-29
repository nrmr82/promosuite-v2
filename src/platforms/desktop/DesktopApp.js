/**
 * Desktop Platform Main App Component
 * Entry point for desktop-specific UI and layout
 */

import React from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './components/Dashboard';
import FlyerPro from './components/FlyerPro';
import SocialSpark from './components/SocialSpark';
import UserCollections from './components/UserCollections';
import Pricing from './components/Pricing';
import AuthModal from './modals/AuthModal';
import LandingPage from './components/LandingPage';
import ErrorBoundary from '../../shared/components/ErrorBoundary';

const DesktopApp = ({ 
  user, 
  currentView, 
  onNavigate, 
  onAuthSuccess, 
  onLogout,
  onNavigateToTool,
  onUpgrade,
  loading
}) => {
  
  // Render the current view component for desktop
  const renderCurrentView = () => {
    switch (currentView) {
      case 'auth':
        return (
          <AuthModal 
            isOpen={true} 
            onClose={() => onNavigate('socialspark')} 
            onAuthSuccess={onAuthSuccess} 
          />
        );
      case 'home':
      case 'dashboard':
        return <Dashboard user={user} onNavigateToTool={onNavigateToTool} />;
      case 'flyerpro':
        return <FlyerPro user={user} />;
      case 'socialspark':
        return (
          <SocialSpark 
            user={user} 
            onOpenAuth={() => onNavigate('auth')} 
            onToolUsage={() => onNavigate('socialspark')} 
          />
        );
      case 'collections':
        return <UserCollections user={user} />;
      case 'pricing':
        return <Pricing user={user} onUpgrade={onUpgrade} />;
      default:
        return <Dashboard user={user} onNavigateToTool={onNavigateToTool} />;
    }
  };

  // Show loading spinner while initializing
  if (loading) {
    return (
      <div className="desktop-app-loading">
        <div className="loading-spinner"></div>
        <p>Loading PromoSuite...</p>
      </div>
    );
  }

  // If no user is logged in, show landing page
  if (!user) {
    return (
      <ErrorBoundary level="desktop">
        <div className="desktop-app-unauthenticated">
          <LandingPage onAuthSuccess={onAuthSuccess} />
        </div>
      </ErrorBoundary>
    );
  }

  // Main authenticated desktop app
  return (
    <ErrorBoundary level="desktop">
      <MainLayout
        currentView={currentView}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
      >
        {renderCurrentView()}
      </MainLayout>
    </ErrorBoundary>
  );
};

export default DesktopApp;