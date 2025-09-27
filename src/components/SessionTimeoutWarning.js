/**
 * Session Timeout Warning Component
 * Shows a warning when user session is about to expire
 */

import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import './SessionTimeoutWarning.css';

const SessionDebugInfo = () => {
  if (process.env.NODE_ENV !== 'development') return null;

  const sessionData = JSON.parse(sessionStorage.getItem('sessionData') || '{}');
  return (
    <div className="session-debug" style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <pre>{JSON.stringify(sessionData, null, 2)}</pre>
    </div>
  );
};

const SessionTimeoutWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    if (authService.isInGracePeriod()) {
      console.log('🕒 Skipping warning during initial auth');
      return;
    }

    const checkSessionStatus = () => {
      try {
        // Skip checking during grace period
        if (authService.isInGracePeriod()) {
          return;
        }

        const timeInfo = authService.getSessionRemainingTime();
        const isCloseToExpiring = authService.isSessionCloseToExpiring(10); // 10 minutes warning

        console.log('🕒 Session status check:', {
          timeInfo,
          isCloseToExpiring,
          isValid: timeInfo?.isValid
        });

        if (isCloseToExpiring && timeInfo?.isValid) {
          setRemainingTime(timeInfo);
          setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      } catch (error) {
        console.error('Error checking session status:', error);
        // Don't show warning on error
        setShowWarning(false);
      }
    };

    // Check session status every 30 seconds
    const interval = setInterval(checkSessionStatus, 30000); // 30 seconds

    // Initial check after a short delay to allow grace period
    const initialCheck = setTimeout(checkSessionStatus, 5500);

    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval);
      if (initialCheck) clearTimeout(initialCheck);
    };
  }, []);

  const handleExtendSession = () => {
    try {
      authService.extendSession();
      setShowWarning(false);
      console.log('🔄 Session extended by user');
    } catch (error) {
      console.error('Error extending session:', error);
    }
  };

  const handleLogoutNow = () => {
    authService.logout();
  };

  if (!showWarning || !remainingTime) {
    return null;
  }

  return (
    <>
    <div className="session-timeout-warning">
      <div className="session-timeout-overlay">
        <div className="session-timeout-modal">
          <div className="session-timeout-header">
            <h3>⏰ Session Expiring Soon</h3>
          </div>
          
          <div className="session-timeout-content">
            <p>
              Your session will expire in{' '}
              <strong>{remainingTime.remainingMinutes} minute{remainingTime.remainingMinutes !== 1 ? 's' : ''}</strong>{' '}
              due to inactivity or browser closure.
            </p>
            
            <p>
              Would you like to extend your session?
            </p>
          </div>
          
          <div className="session-timeout-actions">
            <button 
              className="session-timeout-btn session-timeout-btn-primary"
              onClick={handleExtendSession}
            >
              Yes, Keep Me Logged In
            </button>
            
            <button 
              className="session-timeout-btn session-timeout-btn-secondary"
              onClick={handleLogoutNow}
            >
              No, Log Me Out
            </button>
          </div>
        </div>
      </div>
    </div>
    {process.env.NODE_ENV === 'development' && <SessionDebugInfo />}
    </>
  );
};

export default SessionTimeoutWarning;