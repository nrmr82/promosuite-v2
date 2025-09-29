/**
 * Device Detection Utility
 * Determines the current device type and returns appropriate platform
 */

export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
};

/**
 * Get current device type based on window width and user agent
 * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
 */
export const getDeviceType = () => {
  // Check if we're in a server environment
  if (typeof window === 'undefined') {
    return DEVICE_TYPES.DESKTOP;
  }

  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();

  // Mobile detection (0-767px)
  if (width < 768) {
    return DEVICE_TYPES.MOBILE;
  }
  
  // Tablet detection (768-1023px)
  if (width >= 768 && width < 1024) {
    return DEVICE_TYPES.TABLET;
  }

  // Additional mobile/tablet checks via user agent
  if (userAgent.includes('mobile') || userAgent.includes('android')) {
    return width < 1024 ? DEVICE_TYPES.MOBILE : DEVICE_TYPES.TABLET;
  }

  if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
    return DEVICE_TYPES.TABLET;
  }

  // Desktop by default (1024px+)
  return DEVICE_TYPES.DESKTOP;
};

/**
 * Check if current device is mobile
 * @returns {boolean}
 */
export const isMobile = () => {
  return getDeviceType() === DEVICE_TYPES.MOBILE;
};

/**
 * Check if current device is tablet
 * @returns {boolean}
 */
export const isTablet = () => {
  return getDeviceType() === DEVICE_TYPES.TABLET;
};

/**
 * Check if current device is desktop
 * @returns {boolean}
 */
export const isDesktop = () => {
  return getDeviceType() === DEVICE_TYPES.DESKTOP;
};

/**
 * Get platform-specific component path
 * @param {string} componentName - Name of the component
 * @param {string} componentType - Type: 'components', 'modals', 'layouts'
 * @returns {string} Platform-specific path
 */
export const getPlatformPath = (componentName, componentType = 'components') => {
  const deviceType = getDeviceType();
  return `platforms/${deviceType}/${componentType}/${componentName}`;
};

/**
 * React hook for device type detection with responsive updates
 * Note: Import React in component files that use this hook
 */
export const useDeviceDetection = () => {
  // This hook should be used in React components that import React
  // const [deviceType, setDeviceType] = React.useState(() => getDeviceType());
  
  // For now, return static detection - implement hook in components as needed
  return {
    deviceType: getDeviceType(),
    isMobile: getDeviceType() === DEVICE_TYPES.MOBILE,
    isTablet: getDeviceType() === DEVICE_TYPES.TABLET,
    isDesktop: getDeviceType() === DEVICE_TYPES.DESKTOP
  };
};
