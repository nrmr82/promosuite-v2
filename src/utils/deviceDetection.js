import React from 'react';

/**
 * Device Detection Utility
 * Detects device type and provides appropriate component imports
 */

// Device types
export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
};

// Breakpoints (in pixels)
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024
};

/**
 * Detect device type based on screen width and user agent
 * @returns {string} Device type (mobile, tablet, desktop)
 */
export const detectDevice = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return DEVICE_TYPES.DESKTOP;
  }

  const screenWidth = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for mobile devices first
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUA = mobileRegex.test(userAgent);

  // Screen width based detection
  if (screenWidth < BREAKPOINTS.mobile) {
    return DEVICE_TYPES.MOBILE;
  } else if (screenWidth < BREAKPOINTS.tablet) {
    // Check if it's a tablet based on user agent and screen size
    if (userAgent.includes('ipad') || 
        userAgent.includes('tablet') || 
        (screenWidth >= 768 && screenWidth < 1024 && isMobileUA)) {
      return DEVICE_TYPES.TABLET;
    }
    return DEVICE_TYPES.MOBILE; // Small laptop screens
  } else {
    // For larger screens, check if it's a tablet with large screen
    if (userAgent.includes('ipad') && screenWidth >= 1024) {
      return DEVICE_TYPES.TABLET;
    }
    return DEVICE_TYPES.DESKTOP;
  }
};

/**
 * Hook to get current device type with window resize listener
 * @returns {string} Current device type
 */
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = React.useState(detectDevice);

  React.useEffect(() => {
    const handleResize = () => {
      const newDeviceType = detectDevice();
      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [deviceType]);

  return deviceType;
};

/**
 * Get the appropriate design path for the current device
 * @param {string} componentName - Name of the component
 * @param {string} deviceType - Device type (optional, will detect if not provided)
 * @returns {string} Path to the appropriate design component
 */
export const getDesignPath = (componentName, deviceType = null) => {
  const device = deviceType || detectDevice();
  return `../designs/${device}/components/${componentName}`;
};

/**
 * Dynamic component loader that loads the appropriate design based on device type
 * @param {string} componentName - Name of the component to load
 * @returns {Promise} Component module
 */
export const loadResponsiveComponent = async (componentName) => {
  const deviceType = detectDevice();
  
  try {
    // Try to load device-specific component first
    const module = await import(`../designs/${deviceType}/components/${componentName}`);
    return module.default;
  } catch (error) {
    try {
      // Fallback to desktop version if device-specific doesn't exist
      const fallbackModule = await import(`../designs/desktop/components/${componentName}`);
      return fallbackModule.default;
    } catch (fallbackError) {
      // Final fallback to original components
      try {
        const originalModule = await import(`../components/${componentName}`);
        return originalModule.default;
      } catch (originalError) {
        console.error(`Failed to load component ${componentName}:`, originalError);
        return null;
      }
    }
  }
};

/**
 * Get device-specific CSS class names
 * @param {string} baseClassName - Base CSS class name
 * @param {string} deviceType - Device type (optional)
 * @returns {string} Device-specific CSS class names
 */
export const getDeviceClasses = (baseClassName, deviceType = null) => {
  const device = deviceType || detectDevice();
  return `${baseClassName} ${baseClassName}--${device}`;
};

/**
 * Check if current device is mobile
 * @returns {boolean}
 */
export const isMobile = () => detectDevice() === DEVICE_TYPES.MOBILE;

/**
 * Check if current device is tablet
 * @returns {boolean}
 */
export const isTablet = () => detectDevice() === DEVICE_TYPES.TABLET;

/**
 * Check if current device is desktop
 * @returns {boolean}
 */
export const isDesktop = () => detectDevice() === DEVICE_TYPES.DESKTOP;

/**
 * Get viewport dimensions
 * @returns {object} Viewport width and height
 */
export const getViewportDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: 1200, height: 800 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

export default {
  DEVICE_TYPES,
  detectDevice,
  useDeviceType,
  getDesignPath,
  loadResponsiveComponent,
  getDeviceClasses,
  isMobile,
  isTablet,
  isDesktop,
  getViewportDimensions
};