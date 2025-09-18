import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './contexts/AuthContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { ProductProvider } from './contexts/ProductContext';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import FlyerPro from './components/FlyerPro';
import SocialSpark from './components/SocialSpark';
import UserCollections from './components/UserCollections';
import Pricing from './components/Pricing';
import Templates from './pages/Templates';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
// AuthCallback removed - using simpler OAuth flow
import authService from './services/authService';
import './App.css';
import './GlobalBackground.css';

// Import debug functions for development
if (process.env.NODE_ENV === 'development') {
  import('./utils/debugDeletion');
  // Make supabase available globally for debugging
  import('./utils/supabase').then((supabaseModule) => {
    window.supabase = supabaseModule.default;
    console.log('🔧 Debug mode: window.supabase is now available');
    console.log('🔧 Try: await window.supabase.auth.getUser()');
  });
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');

  // Simple OAuth handling - let Supabase handle it automatically
  const isOAuthCallback = false; // Disable complex callback handling

  // Initialize app and check authentication
  useEffect(() => {
    initializeApp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeApp = async () => {
    try {
      // Check for OAuth session first (in case we just came back from OAuth)
      console.log('🔍 App: Checking for OAuth session...');
      const userData = await authService.initializeAuth();
      
      if (userData) {
        console.log('🎉 App: Found session!', userData.email);
        setUser(userData);
        return; // Exit early since we found a session
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
        
        // If user logs in via OAuth, make sure we're not showing the loading state
        if (userData && loading) {
          setLoading(false);
        }
      });

      // Clean up subscription on unmount
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
      
      // Force immediate state update
      setUser(null);
      setCurrentView('home');
      
      console.log('🔐 App: Logout complete - user should be null now');
      
      // Force a page refresh to ensure clean state (temporary fix)
      window.location.href = '/';
      
    } catch (error) {
      console.error('🔐 App: Logout failed:', error);
      // Even if auth service fails, clear local state
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
    // Navigate to the specific tool
    setCurrentView(toolId);
  };

  const handleUpgrade = (planId, billingCycle) => {
    console.log(`Upgrade requested: ${planId} plan (${billingCycle})`);
    // TODO: Implement upgrade logic with payment processing
    // For now, just log the upgrade request
    alert(`Upgrade to ${planId} plan (${billingCycle}) - Payment integration coming soon!`);
  };

  // Render the current view component
  const renderCurrentView = () => {
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
        return <Profile user={user} onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings user={user} onLogout={handleLogout} />;
      default:
        return <Dashboard user={user} onNavigateToTool={handleNavigateToTool} />;
    }
  };

  // Handle OAuth callback

  // Show loading spinner while initializing
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading PromoSuite...</p>
        <Analytics />
      </div>
    );
  }

  // If no user is logged in, show landing page
  if (!user) {
    return (
      <ErrorBoundary level="full">
        <AuthProvider>
          <div className="app-unauthenticated">
            <LandingPage onAuthSuccess={handleAuthSuccess} />
          </div>
        </AuthProvider>
        <Analytics />
      </ErrorBoundary>
    );
  }

  // Main authenticated app
  return (
    <ErrorBoundary level="full">
      <AuthProvider>
        <TemplateProvider user={user}>
          <ProductProvider>
            <MainLayout
              currentView={currentView}
              onNavigate={handleNavigate}
              user={user}
              onLogout={handleLogout}
            >
              {renderCurrentView()}
            </MainLayout>
          </ProductProvider>
        </TemplateProvider>
      </AuthProvider>
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;
