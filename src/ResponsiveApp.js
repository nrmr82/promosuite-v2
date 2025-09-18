import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { ProductProvider } from './contexts/ProductContext';
import ErrorBoundary from './components/ErrorBoundary';
import DeviceIndicator from './components/DeviceIndicator';
import { detectDevice, useDeviceType, DEVICE_TYPES } from './utils/deviceDetection';
import authService from './services/authService';
import './App.css';
import './GlobalBackground.css';

// Lazy load components based on device type
const loadDeviceComponent = (componentName, deviceType) => {
  try {
    // First try device-specific component
    return lazy(() => import(`./designs/${deviceType}/components/${componentName}`));
  } catch {
    // Fallback to desktop version
    try {
      return lazy(() => import(`./designs/desktop/components/${componentName}`));
    } catch {
      // Final fallback to original component
      return lazy(() => import(`./components/${componentName}`));
    }
  }
};

// Loading component
const LoadingSpinner = () => (
  <div className="app-loading">
    <div className="loading-spinner"></div>
    <p>Loading PromoSuite...</p>
  </div>
);

function ResponsiveApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [deviceComponents, setDeviceComponents] = useState(null);
  
  // Get current device type with resize handling
  const deviceType = useDeviceType();

  // Load device-specific components when device type changes
  useEffect(() => {
    const loadComponents = async () => {
      try {
        const components = {};
        
        // Load core layout components
        if (deviceType === DEVICE_TYPES.MOBILE) {
          components.MainLayout = lazy(() => import('./designs/mobile/components/MainLayout'));
          components.Sidebar = lazy(() => import('./designs/mobile/components/Sidebar'));
          // Mobile components can fallback to desktop for pages not yet optimized
          components.Dashboard = lazy(() => import('./designs/desktop/components/Dashboard'));
          components.LandingPage = lazy(() => import('./designs/desktop/components/LandingPage'));
        } else if (deviceType === DEVICE_TYPES.TABLET) {
          // For now, tablets will use desktop components
          // TODO: Create tablet-specific designs later
          components.MainLayout = lazy(() => import('./designs/desktop/components/MainLayout'));
          components.Dashboard = lazy(() => import('./designs/desktop/components/Dashboard'));
          components.LandingPage = lazy(() => import('./designs/desktop/components/LandingPage'));
        } else {
          // Desktop components
          components.MainLayout = lazy(() => import('./designs/desktop/components/MainLayout'));
          components.Dashboard = lazy(() => import('./designs/desktop/components/Dashboard'));
          components.LandingPage = lazy(() => import('./designs/desktop/components/LandingPage'));
        }
        
        // Common components that don't need device-specific versions yet
        components.FlyerPro = lazy(() => import('./components/FlyerPro'));
        components.SocialSpark = lazy(() => import('./components/SocialSpark'));
        components.UserCollections = lazy(() => import('./components/UserCollections'));
        components.Pricing = lazy(() => import('./components/Pricing'));
        components.Templates = lazy(() => import('./pages/Templates'));
        components.Profile = lazy(() => import('./pages/Profile'));
        components.Settings = lazy(() => import('./pages/Settings'));
        
        setDeviceComponents(components);
      } catch (error) {
        console.error('Error loading device components:', error);
        // Fallback to original components
        setDeviceComponents({
          MainLayout: lazy(() => import('./components/MainLayout')),
          Dashboard: lazy(() => import('./components/Dashboard')),
          LandingPage: lazy(() => import('./components/LandingPage')),
          FlyerPro: lazy(() => import('./components/FlyerPro')),
          SocialSpark: lazy(() => import('./components/SocialSpark')),
          UserCollections: lazy(() => import('./components/UserCollections')),
          Pricing: lazy(() => import('./components/Pricing')),
          Templates: lazy(() => import('./pages/Templates')),
          Profile: lazy(() => import('./pages/Profile')),
          Settings: lazy(() => import('./pages/Settings'))
        });
      }
    };

    loadComponents();
  }, [deviceType]);

  // Initialize app and check authentication
  useEffect(() => {
    initializeApp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeApp = async () => {
    try {
      console.log('🔍 App: Checking for OAuth session...');
      const userData = await authService.initializeAuth();
      
      if (userData) {
        console.log('🎉 App: Found session!', userData.email);
        setUser(userData);
        return;
      }
      
      // Clean up any demo/fallback users from localStorage
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
        console.log('Auth state changed:', event, userData ? 'User logged in' : 'User logged out');
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
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    console.log('🔐 App: Logout handler called');
    try {
      console.log('🔐 App: Calling authService.logout()');
      await authService.logout();
      console.log('🔐 App: AuthService logout complete');
      
      setUser(null);
      setCurrentView('home');
      
      console.log('🔐 App: Logout complete - user should be null now');
      window.location.href = '/';
      
    } catch (error) {
      console.error('🔐 App: Logout failed:', error);
      localStorage.removeItem('promosuiteUser');
      setUser(null);
      setCurrentView('home');
      window.location.href = '/';
    }
  };

  const handleNavigate = (view) => {
    console.log('Navigating to view:', view);
    setCurrentView(view);
  };

  const handleNavigateToTool = (toolId) => {
    console.log('Navigate to tool:', toolId);
    setCurrentView(toolId);
  };

  const handleUpgrade = (planId, billingCycle) => {
    console.log(`Upgrade requested: ${planId} plan (${billingCycle})`);
    alert(`Upgrade to ${planId} plan (${billingCycle}) - Payment integration coming soon!`);
  };

  // Render the current view component
  const renderCurrentView = () => {
    if (!deviceComponents) return <LoadingSpinner />;

    const {
      Dashboard,
      FlyerPro,
      SocialSpark,
      Templates,
      UserCollections,
      Pricing,
      Profile,
      Settings
    } = deviceComponents;

    switch (currentView) {
      case 'home':
      case 'dashboard':
        return <Dashboard user={user} onNavigateToTool={handleNavigateToTool} />;
      case 'flyerpro':
        return <FlyerPro user={user} />;
      case 'socialspark':
        return <SocialSpark user={user} />;
      case 'templates':
        return <Templates user={user} />;
      case 'collections':
        return <UserCollections user={user} />;
      case 'pricing':
        return <Pricing user={user} onUpgrade={handleUpgrade} />;
      case 'profile':
        return <Profile user={user} />;
      case 'settings':
        return <Settings user={user} />;
      default:
        return <Dashboard user={user} onNavigateToTool={handleNavigateToTool} />;
    }
  };

  // Show loading spinner while initializing or loading components
  if (loading || !deviceComponents) {
    return <LoadingSpinner />;
  }

  const { MainLayout, LandingPage } = deviceComponents;

  // If no user is logged in, show landing page
  if (!user) {
    return (
      <ErrorBoundary level="full">
        <AuthProvider>
          <div className={`app-unauthenticated device-${deviceType}`}>
            <DeviceIndicator />
            <Suspense fallback={<LoadingSpinner />}>
              <LandingPage onAuthSuccess={handleAuthSuccess} />
            </Suspense>
          </div>
        </AuthProvider>
      </ErrorBoundary>
    );
  }

  // Main authenticated app
  return (
    <ErrorBoundary level="full">
      <AuthProvider>
        <TemplateProvider user={user}>
          <ProductProvider>
            <div className={`app-authenticated device-${deviceType}`}>
              <DeviceIndicator />
              <Suspense fallback={<LoadingSpinner />}>
                <MainLayout
                  currentView={currentView}
                  onNavigate={handleNavigate}
                  user={user}
                  onLogout={handleLogout}
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    {renderCurrentView()}
                  </Suspense>
                </MainLayout>
              </Suspense>
            </div>
          </ProductProvider>
        </TemplateProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default ResponsiveApp;