// Mobile App Launcher
// This script can be used to launch the mobile app for testing

import React from 'react';
import ReactDOM from 'react-dom/client';
import MobileApp from './MobileApp';

console.log('🚀 Launching PromoSuite Mobile App...');

// Override the desktop app if this script is loaded
const originalApp = window.App;

// Create mobile app instance
const launchMobileApp = () => {
  const root = document.getElementById('root');
  if (root) {
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(<MobileApp />);
    console.log('📱 Mobile App launched successfully!');
  }
};

// Check if we should auto-launch mobile
const shouldLaunchMobile = () => {
  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const forceMobile = urlParams.get('mobile') === 'true';
  
  // Check screen size and user agent
  const isMobileScreen = window.innerWidth <= 768;
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  return forceMobile || (isMobileScreen && isMobileUA);
};

// Auto-launch if conditions are met
if (shouldLaunchMobile()) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', launchMobileApp);
  } else {
    launchMobileApp();
  }
}

// Export for manual launching
export { launchMobileApp, shouldLaunchMobile };
export default MobileApp;