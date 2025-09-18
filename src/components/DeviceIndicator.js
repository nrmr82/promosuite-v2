import React from 'react';
import { useDeviceType, DEVICE_TYPES } from '../utils/deviceDetection';
import './DeviceIndicator.css';

const DeviceIndicator = () => {
  const deviceType = useDeviceType();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getDeviceInfo = () => {
    switch (deviceType) {
      case DEVICE_TYPES.MOBILE:
        return { icon: '📱', label: 'Mobile', color: '#10b981' };
      case DEVICE_TYPES.TABLET:
        return { icon: '📊', label: 'Tablet', color: '#f59e0b' };
      case DEVICE_TYPES.DESKTOP:
        return { icon: '💻', label: 'Desktop', color: '#6366f1' };
      default:
        return { icon: '❓', label: 'Unknown', color: '#6b7280' };
    }
  };

  const { icon, label, color } = getDeviceInfo();

  return (
    <div className="device-indicator" style={{ backgroundColor: color }}>
      <span className="device-icon">{icon}</span>
      <span className="device-label">{label}</span>
    </div>
  );
};

export default DeviceIndicator;