/**
 * Error categories for social platform errors
 */
export const ErrorCategory = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  TOKEN: 'token',
  RATE_LIMIT: 'rate_limit',
  NETWORK: 'network',
  API: 'api',
  VALIDATION: 'validation',
  PLATFORM: 'platform',
  UNKNOWN: 'unknown'
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',       // Non-critical errors that don't affect core functionality
  MEDIUM: 'medium', // Errors that affect some features but not core functionality
  HIGH: 'high',     // Errors that affect core functionality
  CRITICAL: 'critical' // Errors that require immediate attention
};

/**
 * Standard error codes for social platform errors
 */
export const ErrorCode = {
  // Authentication errors
  INVALID_CREDENTIALS: 'invalid_credentials',
  TOKEN_EXPIRED: 'token_expired',
  TOKEN_INVALID: 'token_invalid',
  TOKEN_REVOKED: 'token_revoked',
  
  // Authorization errors
  INSUFFICIENT_SCOPE: 'insufficient_scope',
  PERMISSION_DENIED: 'permission_denied',
  ACCOUNT_RESTRICTED: 'account_restricted',
  
  // Rate limit errors
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  QUOTA_EXCEEDED: 'quota_exceeded',
  
  // Network errors
  NETWORK_UNAVAILABLE: 'network_unavailable',
  TIMEOUT: 'timeout',
  CONNECTION_ERROR: 'connection_error',
  
  // API errors
  API_ERROR: 'api_error',
  INVALID_REQUEST: 'invalid_request',
  INVALID_RESPONSE: 'invalid_response',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  
  // Validation errors
  INVALID_PARAMETER: 'invalid_parameter',
  MISSING_PARAMETER: 'missing_parameter',
  INVALID_FORMAT: 'invalid_format',
  
  // Platform-specific errors
  PLATFORM_ERROR: 'platform_error',
  PLATFORM_MAINTENANCE: 'platform_maintenance',
  PLATFORM_DEPRECATED: 'platform_deprecated',
  
  // Unknown errors
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * Social platform error class
 */
export class SocialPlatformError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'SocialPlatformError';
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.code = options.code || ErrorCode.UNKNOWN_ERROR;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.platform = options.platform;
    this.originalError = options.originalError;
    this.timestamp = new Date();
    this.metadata = options.metadata || {};
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      code: this.code,
      severity: this.severity,
      platform: this.platform,
      timestamp: this.timestamp,
      metadata: this.metadata,
      stack: this.stack
    };
  }
}

/**
 * Central error handling service
 */
class ErrorHandler {
  constructor() {
    this.errorListeners = new Set();
    this.recoveryStrategies = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Handle a social platform error
   */
  handleError(error, context = {}) {
    // Normalize error
    const normalizedError = this.normalizeError(error, context);
    
    // Add to history
    this.addToHistory(normalizedError);
    
    // Log error
    this.logError(normalizedError);
    
    // Attempt recovery
    const recoveryResult = this.attemptRecovery(normalizedError);
    
    // Notify listeners
    this.notifyListeners(normalizedError, recoveryResult);
    
    // Send to analytics if configured
    this.trackError(normalizedError, recoveryResult);
    
    return {
      error: normalizedError,
      recovery: recoveryResult
    };
  }

  /**
   * Normalize various error types into SocialPlatformError
   */
  normalizeError(error, context = {}) {
    if (error instanceof SocialPlatformError) {
      return error;
    }

    const options = {
      platform: context.platform,
      metadata: {
        ...context,
        originalMessage: error.message,
        originalName: error.name
      }
    };

    // Determine error category and code
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      options.category = ErrorCategory.API;
      options.code = ErrorCode.INVALID_RESPONSE;
    } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
      options.category = ErrorCategory.NETWORK;
      options.code = error.message.includes('timeout') ? ErrorCode.TIMEOUT : ErrorCode.NETWORK_UNAVAILABLE;
    } else if (error.message?.includes('token') || error.message?.includes('auth')) {
      options.category = ErrorCategory.AUTHENTICATION;
      options.code = error.message.includes('expired') ? ErrorCode.TOKEN_EXPIRED : ErrorCode.TOKEN_INVALID;
    } else if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      options.category = ErrorCategory.RATE_LIMIT;
      options.code = ErrorCode.RATE_LIMIT_EXCEEDED;
    }

    return new SocialPlatformError(
      error.message || 'An unknown error occurred',
      options
    );
  }

  /**
   * Add error to history
   */
  addToHistory(error) {
    this.errorHistory.unshift({
      error,
      timestamp: new Date()
    });

    // Trim history if needed
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Log error with appropriate severity
   */
  logError(error) {
    const logData = {
      message: error.message,
      category: error.category,
      code: error.code,
      platform: error.platform,
      metadata: error.metadata,
      timestamp: error.timestamp
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('[CRITICAL]', logData);
        break;
      case ErrorSeverity.HIGH:
        console.error('[HIGH]', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('[MEDIUM]', logData);
        break;
      case ErrorSeverity.LOW:
        console.info('[LOW]', logData);
        break;
      default:
        console.log('[UNKNOWN]', logData);
    }
  }

  /**
   * Attempt to recover from error
   */
  attemptRecovery(error) {
    const strategy = this.recoveryStrategies.get(error.code) ||
                    this.recoveryStrategies.get(error.category);
                    
    if (!strategy) {
      return { success: false, reason: 'No recovery strategy available' };
    }

    try {
      return strategy(error);
    } catch (recoveryError) {
      return {
        success: false,
        reason: 'Recovery failed',
        error: recoveryError
      };
    }
  }

  /**
   * Register a recovery strategy
   */
  registerRecoveryStrategy(errorCodeOrCategory, strategy) {
    this.recoveryStrategies.set(errorCodeOrCategory, strategy);
  }

  /**
   * Add error listener
   */
  addListener(listener) {
    this.errorListeners.add(listener);
  }

  /**
   * Remove error listener
   */
  removeListener(listener) {
    this.errorListeners.delete(listener);
  }

  /**
   * Notify all error listeners
   */
  notifyListeners(error, recoveryResult) {
    for (const listener of this.errorListeners) {
      try {
        listener(error, recoveryResult);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    }
  }

  /**
   * Track error in analytics
   */
  trackError(error, recoveryResult) {
    if (process.env.REACT_APP_ERROR_TRACKING_ENDPOINT) {
      try {
        fetch(process.env.REACT_APP_ERROR_TRACKING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            error: error.toJSON(),
            recovery: recoveryResult,
            timestamp: new Date().toISOString()
          })
        }).catch(e => console.error('Error tracking failed:', e));
      } catch (e) {
        console.error('Error sending error tracking:', e);
      }
    }
  }

  /**
   * Get error history
   */
  getErrorHistory() {
    return this.errorHistory;
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorHistory = [];
  }
}

// Export singleton instance
const errorHandler = new ErrorHandler();

// Register default recovery strategies
errorHandler.registerRecoveryStrategy(ErrorCategory.TOKEN, async (error) => {
  if (error.code === ErrorCode.TOKEN_EXPIRED) {
    // Attempt to refresh token
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: error.platform })
      });
      
      if (response.ok) {
        return { success: true, action: 'token_refreshed' };
      }
    } catch (e) {
      console.error('Token refresh failed:', e);
    }
  }
  return { success: false, reason: 'Unable to refresh token' };
});

errorHandler.registerRecoveryStrategy(ErrorCategory.RATE_LIMIT, (error) => {
  // Implement exponential backoff
  const retryAfter = error.metadata.retryAfter || 60000; // Default to 1 minute
  return {
    success: true,
    action: 'retry_scheduled',
    metadata: { retryAfter }
  };
});

errorHandler.registerRecoveryStrategy(ErrorCategory.NETWORK, (error) => {
  // Retry with exponential backoff for network errors
  return {
    success: true,
    action: 'retry_with_backoff',
    metadata: { maxRetries: 3, baseDelay: 1000 }
  };
});

export default errorHandler;