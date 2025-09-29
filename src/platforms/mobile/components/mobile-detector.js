// Mobile Detection and App Switcher
// This script automatically detects mobile devices and loads the mobile app

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.innerWidth;
  
  // Check for mobile user agent
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUA = mobileRegex.test(userAgent);
  
  // Check for mobile screen size
  const isMobileScreen = screenWidth <= 768;
  
  return isMobileUA || isMobileScreen;
};

export const loadMobileApp = async () => {
  // Dynamic import of mobile app
  const { default: MobileApp } = await import('./MobileApp');
  return MobileApp;
};

// Auto-detection function that can be called from index.js
export const getMobileAppIfNeeded = () => {
  if (isMobileDevice()) {
    console.log('📱 Mobile device detected - Loading mobile app...');
    return loadMobileApp();
  }
  return null;
};