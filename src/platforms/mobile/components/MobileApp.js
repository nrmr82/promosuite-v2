import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import { TemplateProvider } from '../../contexts/TemplateContext';
import { ProductProvider } from '../../contexts/ProductContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import authService from '../../services/authService';
import './mobile.css';

// Lazy load mobile components
const MobileMainLayout = lazy(() => import('./components/MainLayout'));
const MobileDashboard = lazy(() => import('./components/Dashboard'));
const MobileLandingPage = lazy(() => import('./components/LandingPage'));
const MobileFlyerPro = lazy(() => import('./components/FlyerPro'));
const MobileSocialSpark = lazy(() => import('./components/SocialSpark'));

// Mobile versions of all components
const MobileUserCollections = lazy(() => import('./components/UserCollections'));
const MobilePricing = lazy(() => import('./components/Pricing'));
const Templates = lazy(() => import('../../pages/Templates'));
const Profile = lazy(() => import('../../pages/Profile'));
const Settings = lazy(() => import('../../pages/Settings'));
const AuthModal = lazy(() => import('../../components/AuthModal'));

const LoadingSpinner = () => (
  <div className="mobile-loading">
    <div className="loading-spinner"></div>
    <p>Loading PromoSuite...</p>
  </div>
);

function MobileApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');

  // Initialize app and check authentication
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize session timeout service
      authService.initializeSessionTimeout({
        timeoutAfterClose: 30,
        inactivityTimeout: 120,
      });
      
      // Check session validity
      if (!authService.checkInitialSessionValidity()) {
        console.log('🔍 Mobile App: Session expired during initialization');
        setLoading(false);
        return;
      }
      
      // Check for OAuth session
      console.log('🔍 Mobile App: Checking for OAuth session...');
      const userData = await authService.initializeAuth();
      
      if (userData) {
        console.log('🎉 Mobile App: Found session!', userData.email);
        setUser(userData);
        return;
      }
      
      // Clean up demo users
      const existingUser = authService.getCurrentUserSync();
      if (existingUser && (existingUser.id === 'demo-user' || existingUser.id === 'fallback-user' || existingUser.email === 'demo@promosuite.com')) {
        console.log('🧹 Cleaning up demo/fallback user from localStorage');
        localStorage.removeItem('promosuiteUser');
        setUser(null);
      } else if (existingUser) {
        console.log('✅ Found valid existing user:', existingUser.email);
        setUser(existingUser);
      }
      
      // Initialize auth state listener
      const { data: { subscription } } = authService.onAuthStateChange((event, userData) => {
        console.log('Mobile Auth state changed:', event, userData ? 'User logged in' : 'User logged out');
        setUser(userData);
        
        if (userData && loading) {
          setLoading(false);
        }
      });

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Failed to initialize mobile app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    console.log('🎉 Mobile App: User authenticated');
  };

  const handleLogout = async () => {
    console.log('🔐 Mobile App: Logout handler called');
    try {
      await authService.logout();
      setUser(null);
      setCurrentView('home');
      console.log('🔐 Mobile App: Logout complete');
      window.location.href = '/';
    } catch (error) {
      console.error('🔐 Mobile App: Logout failed:', error);
      localStorage.removeItem('promosuiteUser');
      setUser(null);
      setCurrentView('home');
      window.location.href = '/';
    }
  };

  const handleNavigate = (view) => {
    console.log('Mobile: Navigating to view:', view);
    setCurrentView(view);
  };

  const handleNavigateToTool = (toolId) => {
    console.log('Mobile: Navigate to tool:', toolId);
    setCurrentView(toolId);
  };

  const handleUpgrade = (planId, billingCycle) => {
    console.log(`Mobile: Upgrade requested: ${planId} plan (${billingCycle})`);
    alert(`Upgrade to ${planId} plan (${billingCycle}) - Payment integration coming soon!`);
  };

  // Render current view component
  const renderCurrentView = () => {
    switch (currentView) {
      case 'auth':
        return <AuthModal isOpen={true} onClose={() => handleNavigate('socialspark')} onAuthSuccess={handleAuthSuccess} />;
      case 'home':
      case 'dashboard':
        return <MobileDashboard user={user} onNavigateToTool={handleNavigateToTool} />;
      case 'flyerpro':
        return <MobileFlyerPro user={user} />;
      case 'socialspark':
        return <MobileSocialSpark user={user} onOpenAuth={() => handleNavigate('auth')} onToolUsage={() => handleNavigate('socialspark')} />;
      case 'templates':
        return <Templates user={user} />;
      case 'collections':
        return <MobileUserCollections user={user} />;
      case 'pricing':
        return <MobilePricing user={user} onUpgrade={handleUpgrade} />;
      case 'profile':
        return <Profile user={user} onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings user={user} onLogout={handleLogout} />;
      default:
        return <MobileDashboard user={user} onNavigateToTool={handleNavigateToTool} />;
    }
  };

  // Show loading spinner while initializing
  if (loading) {
    return <LoadingSpinner />;
  }

  // If no user is logged in, show mobile landing page
  if (!user) {
    return (
      <ErrorBoundary level="full">
        <AuthProvider>
          <div className="mobile-app mobile-app--unauthenticated">
            <Suspense fallback={<LoadingSpinner />}>
              <MobileLandingPage onAuthSuccess={handleAuthSuccess} />
            </Suspense>
          </div>
        </AuthProvider>
      </ErrorBoundary>
    );
  }

  // Main authenticated mobile app
  return (
    <ErrorBoundary level="full">
      <AuthProvider>
        <TemplateProvider user={user}>
          <ProductProvider>
            <div className="mobile-app mobile-app--authenticated">
              <Suspense fallback={<LoadingSpinner />}>
                <MobileMainLayout
                  currentView={currentView}
                  onNavigate={handleNavigate}
                  user={user}
                  onLogout={handleLogout}
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    {renderCurrentView()}
                  </Suspense>
                </MobileMainLayout>
              </Suspense>
            </div>
          </ProductProvider>
        </TemplateProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MobileApp;