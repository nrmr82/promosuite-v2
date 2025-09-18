/**
 * Development Notice Component
 * Shows when the application is running in development mode with backend fallbacks
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

const DevelopmentNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if we're in development and if notice was previously dismissed
    const isDev = process.env.NODE_ENV === 'development';
    const dismissed = localStorage.getItem('dev-notice-dismissed');
    
    if (isDev && !dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('dev-notice-dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="development-notice">
      <div className="dev-notice-content">
        <AlertCircle className="dev-notice-icon" />
        <div className="dev-notice-text">
          <strong>Development Mode</strong>
          <span>Backend unavailable - using mock authentication & features</span>
        </div>
        <button 
          className="dev-notice-dismiss" 
          onClick={handleDismiss}
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DevelopmentNotice;
