/**
 * PromoSuite V2 - Session Timeout Service
 * Handles automatic session timeout after browser closure + specified time period
 * Features:
 * - Configurable timeout duration
 * - Activity-based session extension
 * - Automatic cleanup on browser close
 * - Session restoration checks
 */

class SessionTimeoutService {
  constructor() {
    // Configuration
    this.config = {
      // Default timeout after browser closure (in minutes, not seconds!)
      timeoutAfterClose: 30, // 30 minutes after browser closure
      // Activity timeout (logout if inactive for this duration in minutes)
      inactivityTimeout: 120, // 2 hours of inactivity
      // Activity check interval (in seconds)
      activityCheckInterval: 60, // Check every minute, not every second
      // Events that count as user activity
      activityEvents: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'],
      // Storage keys
      storageKeys: {
        sessionStart: 'ps_session_start',
        lastActivity: 'ps_last_activity',
        browserCloseTime: 'ps_browser_close_time',
        sessionExpiry: 'ps_session_expiry',
        lastTabId: 'ps_last_tab_id',
        activeTabCount: 'ps_active_tab_count'
      }
    };

    // Internal state
    this.timeoutId = null;
    this.activityCheckId = null;
    this.isActive = true;
    this.lastActivityTime = Date.now();
    this.onTimeoutCallback = null;
    this.activityListeners = [];

    // Bind methods
    this.handleActivity = this.handleActivity.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.checkSessionValidity = this.checkSessionValidity.bind(this);
  }

  /**
   * Initialize session timeout service
   * @param {Function} onTimeout - Callback function to call when session times out
   * @param {Object} options - Configuration options
   */
  initialize(onTimeout, options = {}) {
    // Update configuration
    this.config = { ...this.config, ...options };
    this.onTimeoutCallback = onTimeout;

    console.log('🕒 SessionTimeout: Initializing with config:', {
      timeoutAfterClose: this.config.timeoutAfterClose,
      inactivityTimeout: this.config.inactivityTimeout
    });

    // Check if session is still valid on initialization
    if (!this.checkSessionValidity()) {
      console.log('🕒 SessionTimeout: Session expired, calling timeout callback');
      if (this.onTimeoutCallback) {
        this.onTimeoutCallback('session_expired');
      }
      return false;
    }

    // Start session tracking
    this.startSession();
    return true;
  }

  /**
   * Start session timeout tracking
   */
  startSession() {
    const now = Date.now();
    const tabId = Math.random().toString(36).substring(2);
    
    // Record session start time
    localStorage.setItem(this.config.storageKeys.sessionStart, now.toString());
    localStorage.setItem(this.config.storageKeys.lastActivity, now.toString());
    localStorage.setItem(this.config.storageKeys.lastTabId, tabId);
    
    // Increment active tab count
    const currentCount = parseInt(localStorage.getItem(this.config.storageKeys.activeTabCount) || '0');
    localStorage.setItem(this.config.storageKeys.activeTabCount, (currentCount + 1).toString());
    
    // Calculate session expiry time (for inactivity timeout)
    const inactivityExpiry = now + (this.config.inactivityTimeout * 60 * 1000);
    localStorage.setItem(this.config.storageKeys.sessionExpiry, inactivityExpiry.toString());
    
    // Remove any previous browser close time
    localStorage.removeItem(this.config.storageKeys.browserCloseTime);

    console.log('🕒 SessionTimeout: Session started', {
      sessionStart: new Date(now).toLocaleTimeString(),
      inactivityExpiry: new Date(inactivityExpiry).toLocaleTimeString(),
      tabId,
      activeTabCount: currentCount + 1
    });

    // Set up activity tracking
    this.setupActivityTracking();
    
    // Set up browser event handlers
    this.setupBrowserEventHandlers();
    
    // Start periodic session validity checks
    this.startActivityChecking();
    
    // Clean up on page unload - DISABLED to prevent aggressive logout
    // The session timeout will handle actual timeouts based on time, not page navigation
    window.addEventListener('unload', (event) => {
      const count = parseInt(localStorage.getItem(this.config.storageKeys.activeTabCount) || '1');
      try {
        if (count <= 1) {
          // Mark browser as closed but don't immediately clear user data
          localStorage.setItem('ps_browser_closed', 'true');
          localStorage.setItem('ps_browser_close_time', Date.now().toString());
          // Don't clear user data here - let the timeout service handle it based on time
        } else {
          // Decrement tab count
          localStorage.setItem(this.config.storageKeys.activeTabCount, (count - 1).toString());
        }
      } catch (error) {
        console.error('🕒 Error during unload cleanup:', error);
      }
    }, { capture: true });
  }

  /**
   * Set up activity tracking listeners
   */
  setupActivityTracking() {
    this.config.activityEvents.forEach(eventType => {
      const listener = (event) => this.handleActivity(event);
      document.addEventListener(eventType, listener, { passive: true });
      this.activityListeners.push({ eventType, listener });
    });
  }

  /**
   * Set up browser event handlers for visibility and unload
   */
  setupBrowserEventHandlers() {
    // Track when user switches tabs or minimizes browser
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Track when browser/tab is closing - use capture to ensure execution
    window.addEventListener('beforeunload', this.handleBeforeUnload, { capture: true });
    window.addEventListener('unload', this.handleBeforeUnload, { capture: true });
  }

  /**
   * Start periodic activity checking
   */
  startActivityChecking() {
    this.activityCheckId = setInterval(() => {
      if (!this.checkSessionValidity()) {
        console.log('🕒 SessionTimeout: Session expired during activity check');
        this.handleTimeout('session_expired');
      }
    }, this.config.activityCheckInterval * 1000);
  }

  /**
   * Handle user activity
   */
  handleActivity(event) {
    const now = Date.now();
    this.lastActivityTime = now;
    
    // Update last activity time in storage
    localStorage.setItem(this.config.storageKeys.lastActivity, now.toString());
    
    // Extend session expiry time
    const newExpiry = now + (this.config.inactivityTimeout * 60 * 1000);
    localStorage.setItem(this.config.storageKeys.sessionExpiry, newExpiry.toString());

    // Reset timeout if user was inactive
    if (!this.isActive) {
      console.log('🕒 SessionTimeout: User activity detected, session extended');
      this.isActive = true;
    }
  }

  /**
   * Handle browser visibility change (tab switching, minimize, etc.)
   */
  handleVisibilityChange() {
    if (document.hidden) {
      console.log('🕒 SessionTimeout: Browser tab hidden');
      const now = Date.now();
      localStorage.setItem(this.config.storageKeys.browserCloseTime, now.toString());
      
      // Start more frequent checks while tab is hidden
      this.startHiddenTabChecks();
    } else {
      console.log('🕒 SessionTimeout: Browser tab visible again');
      // Clear frequent check interval
      if (this.hiddenTabInterval) {
        clearInterval(this.hiddenTabInterval);
        this.hiddenTabInterval = null;
      }
      
      // Check if session is still valid
      if (!this.checkSessionValidity()) {
        console.log('🕒 SessionTimeout: Session expired while tab was hidden');
        this.handleTimeout('session_expired');
      } else {
        // Remove browser close time since user is back
        localStorage.removeItem(this.config.storageKeys.browserCloseTime);
      }
    }
  }

  /**
   * Handle browser/tab closing
   */
  handleBeforeUnload() {
    const now = Date.now();
    console.log('🕒 SessionTimeout: Browser closing, recording close time');
    
    try {
      // Use synchronous storage operations to ensure they complete
      localStorage.setItem(this.config.storageKeys.browserCloseTime, now.toString());
      localStorage.setItem('ps_browser_closed', 'true');
      
      // Don't immediately clear auth data - let timeout service handle it
      // The user might just be navigating or refreshing
      
      // Set last tab flag if this is the last tab
      const count = parseInt(localStorage.getItem(this.config.storageKeys.activeTabCount) || '1');
      if (count <= 1) {
        localStorage.setItem('ps_last_tab_closed', 'true');
      }
    } catch (error) {
      console.error('🕒 Error during browser close cleanup:', error);
    }
  }

  handleBrowserClose() {
    console.log('🕒 SessionTimeout: Handling browser close');
    // Force session cleanup
    this.clearSession();
    // Clear local storage
    Object.values(this.config.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    // Clear session storage
    sessionStorage.clear();
    // Set flags to indicate browser was closed - use both storage types for redundancy
    localStorage.setItem('ps_browser_closed', 'true');
    sessionStorage.setItem('ps_browser_closed', 'true');
    // Set timestamp of browser close
    const closeTime = Date.now().toString();
    localStorage.setItem('ps_browser_close_time', closeTime);
    sessionStorage.setItem('ps_browser_close_time', closeTime);
  }

  /**
   * Check if current session is still valid
   * @returns {boolean} - True if session is valid, false if expired
   */
  checkSessionValidity() {
    const now = Date.now();
    const sessionStart = parseInt(localStorage.getItem(this.config.storageKeys.sessionStart) || '0');
    const lastActivity = parseInt(localStorage.getItem(this.config.storageKeys.lastActivity) || '0');
    const browserCloseTime = parseInt(localStorage.getItem(this.config.storageKeys.browserCloseTime) || '0');
    const sessionExpiry = parseInt(localStorage.getItem(this.config.storageKeys.sessionExpiry) || '0');

    // Check for grace period from auth service
    const sessionData = JSON.parse(sessionStorage.getItem('sessionData') || '{}');
    if (sessionData.graceperiod && Date.now() - sessionData.startTime < 5000) {
      console.log('🕒 SessionTimeout: In grace period, session valid');
      return true;
    }

    // If no session data, check if it's a fresh login
    if (!sessionStart || !lastActivity) {
      if (sessionData.startTime && Date.now() - sessionData.startTime < 5000) {
        console.log('🕒 SessionTimeout: New session, initializing timers');
        this.startSession();
        return true;
      }
      console.log('🕒 SessionTimeout: No session data found');
      return false;
    }

    // Check for inactivity timeout
    if (now > sessionExpiry) {
      console.log('🕒 SessionTimeout: Session expired due to inactivity', {
        now: new Date(now).toLocaleTimeString(),
        expiry: new Date(sessionExpiry).toLocaleTimeString()
      });
      return false;
    }

    // Check browser closed flags first
    const wasBrowserClosed = localStorage.getItem('ps_browser_closed') === 'true' || 
                            sessionStorage.getItem('ps_browser_closed') === 'true';
    const wasLastTab = localStorage.getItem('ps_last_tab_closed') === 'true';
    
    if (wasBrowserClosed || wasLastTab) {
      console.log('🕒 SessionTimeout: Browser was closed, enforcing timeout');
      return false;
    }
    
    // If no explicit close flag but we have a close time, check timeout
    if (browserCloseTime > 0) {
      const timeSinceClose = now - browserCloseTime;
      const timeoutAfterCloseMs = this.config.timeoutAfterClose * 60 * 1000; // Convert minutes to ms
      
      if (timeSinceClose > timeoutAfterCloseMs) {
        console.log('🕒 SessionTimeout: Session expired after browser close timeout', {
          timeSinceCloseMinutes: Math.round(timeSinceClose / 60000),
          timeoutMinutes: this.config.timeoutAfterClose
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Handle session timeout
   */
  handleTimeout(reason) {
    console.log('🕒 SessionTimeout: Handling timeout, reason:', reason);
    
    // Clean up session data
    this.clearSession();
    
    // Call timeout callback
    if (this.onTimeoutCallback) {
      this.onTimeoutCallback(reason);
    }
  }

  /**
   * Extend session manually (call this on user login)
   */
  extendSession() {
    const now = Date.now();
    console.log('🕒 SessionTimeout: Manually extending session');
    
    // Update activity and expiry times
    localStorage.setItem(this.config.storageKeys.lastActivity, now.toString());
    const newExpiry = now + (this.config.inactivityTimeout * 60 * 1000);
    localStorage.setItem(this.config.storageKeys.sessionExpiry, newExpiry.toString());
    
    // Remove browser close time
    localStorage.removeItem(this.config.storageKeys.browserCloseTime);
  }

  /**
   * Start more frequent checks while tab is hidden
   */
  startHiddenTabChecks() {
    // Clear any existing interval
    if (this.hiddenTabInterval) {
      clearInterval(this.hiddenTabInterval);
    }

    // Check every second while tab is hidden
    this.hiddenTabInterval = setInterval(() => {
      if (!this.checkSessionValidity()) {
        console.log('🕒 SessionTimeout: Session expired in hidden tab');
        this.handleTimeout('tab_closed');
        // Clear the interval after timeout
        clearInterval(this.hiddenTabInterval);
        this.hiddenTabInterval = null;
      }
    }, 1000); // Check every second
  }

  /**
   * Clear session data and cleanup
   */
  clearSession() {
    console.log('🕒 SessionTimeout: Clearing session data');
    
    // Clear timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    if (this.activityCheckId) {
      clearInterval(this.activityCheckId);
      this.activityCheckId = null;
    }

    // Clear hidden tab interval
    if (this.hiddenTabInterval) {
      clearInterval(this.hiddenTabInterval);
      this.hiddenTabInterval = null;
    }

    // Remove event listeners
    this.activityListeners.forEach(({ eventType, listener }) => {
      document.removeEventListener(eventType, listener);
    });
    this.activityListeners = [];

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('unload', this.handleBeforeUnload);

    // Clear session storage
    Object.values(this.config.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('🕒 SessionTimeout: Config updated:', newConfig);
  }

  /**
   * Get remaining session time
   * @returns {Object} - Object with remaining time information
   */
  getRemainingTime() {
    const now = Date.now();
    const sessionExpiry = parseInt(localStorage.getItem(this.config.storageKeys.sessionExpiry) || '0');
    const browserCloseTime = parseInt(localStorage.getItem(this.config.storageKeys.browserCloseTime) || '0');

    let remainingTime = sessionExpiry - now;
    let timeUntilCloseTimeout = null;

    if (browserCloseTime > 0) {
      const timeoutAfterCloseMs = this.config.timeoutAfterClose * 60 * 1000;
      const timeSinceClose = now - browserCloseTime;
      timeUntilCloseTimeout = Math.max(0, timeoutAfterCloseMs - timeSinceClose);
      
      // If browser close timeout is sooner, use that
      if (timeUntilCloseTimeout < remainingTime) {
        remainingTime = timeUntilCloseTimeout;
      }
    }

    return {
      remainingMs: Math.max(0, remainingTime),
      remainingMinutes: Math.max(0, Math.ceil(remainingTime / 60000)),
      timeUntilCloseTimeout: timeUntilCloseTimeout,
      isValid: remainingTime > 0
    };
  }

  /**
   * Check if session is close to expiring
   * @param {number} warningMinutes - Minutes before expiry to show warning
   * @returns {boolean} - True if session is close to expiring
   */
  isSessionCloseToExpiring(warningMinutes = 5) {
    const remaining = this.getRemainingTime();
    return remaining.isValid && remaining.remainingMinutes <= warningMinutes;
  }
}

// Create and export singleton instance
const sessionTimeoutService = new SessionTimeoutService();
export default sessionTimeoutService;