import { useState, useEffect } from 'react';
import { useTemplate } from '../contexts/TemplateContext';

// Error types
export const ERROR_TYPES = {
  NETWORK_ERROR: 'network_error',
  TEMPLATE_LOAD_ERROR: 'template_load_error',
  AUTH_ERROR: 'auth_error',
  SUBSCRIPTION_ERROR: 'subscription_error',
  VIDEO_ERROR: 'video_error',
  IMAGE_ERROR: 'image_error',
  GENERIC_ERROR: 'generic_error'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error handler class
export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  // Log error with context
  logError(error, context = {}, severity = ERROR_SEVERITY.MEDIUM) {
    const errorEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      message: error.message || error,
      stack: error.stack,
      type: context.type || ERROR_TYPES.GENERIC_ERROR,
      severity,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Add to log
    this.errorLog.unshift(errorEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorEntry);
    }

    // Send to external service in production
    this.reportError(errorEntry);

    return errorEntry.id;
  }

  // Report error to external service
  async reportError(errorEntry) {
    try {
      // In a real app, send to error reporting service (Sentry, LogRocket, etc.)
      if (process.env.NODE_ENV === 'production') {
        // Example: await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorEntry) });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  // Get error history
  getErrorHistory() {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrorLog() {
    this.errorLog = [];
  }

  // Generate unique ID
  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Hook for error handling
export const useErrorHandler = () => {
  const { trackEvent } = useTemplate();

  const handleError = (error, context = {}, severity = ERROR_SEVERITY.MEDIUM) => {
    // Log the error
    const errorId = errorHandler.logError(error, context, severity);

    // Track error analytically
    trackEvent('error_occurred', {
      errorId,
      errorType: context.type || ERROR_TYPES.GENERIC_ERROR,
      errorMessage: error.message || error,
      severity
    });

    return errorId;
  };

  const handleNetworkError = (error, endpoint) => {
    return handleError(error, {
      type: ERROR_TYPES.NETWORK_ERROR,
      endpoint,
      isOnline: navigator.onLine
    }, ERROR_SEVERITY.HIGH);
  };

  const handleTemplateError = (error, templateId) => {
    return handleError(error, {
      type: ERROR_TYPES.TEMPLATE_LOAD_ERROR,
      templateId
    }, ERROR_SEVERITY.MEDIUM);
  };

  const handleAuthError = (error) => {
    return handleError(error, {
      type: ERROR_TYPES.AUTH_ERROR
    }, ERROR_SEVERITY.HIGH);
  };

  return {
    handleError,
    handleNetworkError,
    handleTemplateError,
    handleAuthError,
    getErrorHistory: () => errorHandler.getErrorHistory(),
    clearErrors: () => errorHandler.clearErrorLog()
  };
};

// Network status utilities
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Trigger reconnection logic
        window.dispatchEvent(new CustomEvent('network-reconnected'));
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

// Retry utility
export const createRetryFunction = (fn, maxRetries = 3, delay = 1000) => {
  return async (...args) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.status === 401 || error.status === 403 || error.status === 404) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
        }
      }
    }
    
    throw lastError;
  };
};

// Global error boundary fallback
export const getErrorBoundaryFallback = (error, errorInfo) => {
  errorHandler.logError(error, {
    type: ERROR_TYPES.GENERIC_ERROR,
    componentStack: errorInfo.componentStack
  }, ERROR_SEVERITY.CRITICAL);

  return {
    title: 'Something went wrong',
    message: 'We apologize for the inconvenience. Please try refreshing the page.',
    actionText: 'Refresh Page',
    action: () => window.location.reload()
  };
};

const errorHandlingUtils = {
  ERROR_TYPES,
  ERROR_SEVERITY,
  errorHandler,
  useErrorHandler,
  useNetworkStatus,
  createRetryFunction,
  getErrorBoundaryFallback
};

export default errorHandlingUtils;
