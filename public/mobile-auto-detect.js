// Mobile Auto-Detection Script
// This script automatically detects mobile devices and loads the mobile app
// Place this in public folder and include in index.html

(function() {
  'use strict';
  
  console.log('🔍 Mobile detection script loaded...');
  
  // Mobile detection function
  function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;
    
    // Check for mobile user agent
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUA = mobileRegex.test(userAgent);
    
    // Check for mobile screen size
    const isMobileScreen = screenWidth <= 768;
    
    // Check for force mobile parameter
    const urlParams = new URLSearchParams(window.location.search);
    const forceMobile = urlParams.get('mobile') === 'true';
    
    return forceMobile || isMobileUA || isMobileScreen;
  }
  
  // Function to load mobile app
  function loadMobileApp() {
    console.log('📱 Loading mobile app...');
    
    // Set flag for mobile app
    window.__PROMOSUITE_MOBILE_MODE__ = true;
    
    // Add mobile CSS
    const mobileCSS = document.createElement('link');
    mobileCSS.rel = 'stylesheet';
    mobileCSS.href = '/static/css/mobile.css';
    document.head.appendChild(mobileCSS);
    
    // Add mobile viewport meta if not exists
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1, user-scalable=no';
      document.head.appendChild(viewport);
    }
    
    // Override the React app when it loads
    const originalCreateRoot = window.ReactDOM?.createRoot;
    if (originalCreateRoot) {
      interceptReactApp();
    } else {
      // Wait for ReactDOM to load
      const checkReactDOM = setInterval(() => {
        if (window.ReactDOM?.createRoot) {
          clearInterval(checkReactDOM);
          interceptReactApp();
        }
      }, 100);
    }
  }
  
  function interceptReactApp() {
    console.log('🔄 Intercepting React app for mobile...');
    
    // Flag to prevent multiple mobile app loads
    let mobileAppLoaded = false;
    
    // Override ReactDOM.createRoot
    const originalCreateRoot = window.ReactDOM.createRoot;
    window.ReactDOM.createRoot = function(container) {
      const root = originalCreateRoot.call(this, container);
      
      // Override render method
      const originalRender = root.render;
      root.render = function(element) {
        if (!mobileAppLoaded && window.__PROMOSUITE_MOBILE_MODE__) {
          console.log('🎯 Replacing desktop app with mobile app...');
          mobileAppLoaded = true;
          
          // Load mobile app instead
          loadMobileAppComponent().then(MobileApp => {
            const mobileElement = window.React.createElement(
              window.React.StrictMode,
              null,
              window.React.createElement(MobileApp)
            );
            originalRender.call(this, mobileElement);
          }).catch(error => {
            console.error('Failed to load mobile app:', error);
            // Fallback to original app
            originalRender.call(this, element);
          });
        } else {
          originalRender.call(this, element);
        }
      };
      
      return root;
    };
  }
  
  async function loadMobileAppComponent() {
    // Dynamic import of mobile app
    const module = await import('/src/designs/mobile/MobileApp.js');
    return module.default;
  }
  
  // Check if mobile and initialize
  if (isMobileDevice()) {
    console.log('📱 Mobile device detected!');
    
    // Load mobile app immediately if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadMobileApp);
    } else {
      loadMobileApp();
    }
    
    // Also intercept on window load as backup
    window.addEventListener('load', () => {
      if (!window.__PROMOSUITE_MOBILE_MODE__) {
        loadMobileApp();
      }
    });
  } else {
    console.log('🖥️ Desktop device detected, using standard app');
  }
  
})();