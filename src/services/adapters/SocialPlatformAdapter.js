import errorHandler, { ErrorCategory, ErrorCode } from '../ErrorHandler';
import tokenRefreshManager from '../TokenRefreshManager';

/**
 * Base adapter for social platform interactions
 */
export class SocialPlatformAdapter {
  constructor(platform) {
    this.platform = platform;
    this.maxRetries = 3;
    this.baseDelay = 1000;
    this.rateLimitWindows = new Map();
  }

  /**
   * Execute API call with automatic error handling and retries
   */
  async executeApiCall(apiCall, options = {}) {
    let lastError = null;
    let attempt = 0;

    while (attempt < (options.maxRetries || this.maxRetries)) {
      try {
        // Check rate limits
        await this.checkRateLimits();
        
        // Execute call
        const result = await apiCall();
        
        // Update rate limit info if provided
        if (result.rateLimits) {
          this.updateRateLimits(result.rateLimits);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Handle rate limits
        if (error.category === ErrorCategory.RATE_LIMIT) {
          await this.handleRateLimit(error);
          continue;
        }
        
        // Handle token errors
        if (error.category === ErrorCategory.TOKEN) {
          const recovered = await this.handleTokenError(error);
          if (recovered) continue;
        }
        
        // Calculate retry delay
        const shouldRetry = this.shouldRetry(error);
        if (shouldRetry) {
          const delay = this.calculateRetryDelay(attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  /**
   * Check if we should retry the request
   */
  shouldRetry(error) {
    return (
      error.category === ErrorCategory.NETWORK ||
      error.code === ErrorCode.SERVICE_UNAVAILABLE ||
      error.code === ErrorCode.TIMEOUT
    );
  }

  /**
   * Calculate delay for retry attempt
   */
  calculateRetryDelay(attempt) {
    return Math.min(
      this.baseDelay * Math.pow(2, attempt), // Exponential backoff
      30000 // Max 30 seconds
    );
  }

  /**
   * Check current rate limits before making a request
   */
  async checkRateLimits() {
    const now = Date.now();
    
    // Clear expired rate limit windows
    for (const [endpoint, limit] of this.rateLimitWindows.entries()) {
      if (limit.resetAt <= now) {
        this.rateLimitWindows.delete(endpoint);
      }
    }
    
    // Check if any endpoints are rate limited
    for (const [endpoint, limit] of this.rateLimitWindows.entries()) {
      if (limit.remaining <= 0) {
        const waitTime = limit.resetAt - now;
        if (waitTime > 0) {
          throw errorHandler.handleError({
            message: `Rate limit exceeded for ${endpoint}`,
            category: ErrorCategory.RATE_LIMIT,
            code: ErrorCode.RATE_LIMIT_EXCEEDED,
            metadata: {
              endpoint,
              resetAt: limit.resetAt,
              waitTime
            }
          });
        }
      }
    }
  }

  /**
   * Update rate limit tracking
   */
  updateRateLimits(limits) {
    for (const [endpoint, limit] of Object.entries(limits)) {
      this.rateLimitWindows.set(endpoint, {
        limit: limit.limit,
        remaining: limit.remaining,
        resetAt: Date.now() + (limit.reset * 1000)
      });
    }
  }

  /**
   * Handle rate limit error
   */
  async handleRateLimit(error) {
    const { endpoint, resetAt } = error.metadata;
    const now = Date.now();
    const waitTime = resetAt - now;
    
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Handle token-related errors
   */
  async handleTokenError(error) {
    if (error.code === ErrorCode.TOKEN_EXPIRED) {
      try {
        await tokenRefreshManager.forceRefresh(this.connectionId);
        return true;
      } catch (refreshError) {
        throw errorHandler.handleError(refreshError, {
          platform: this.platform,
          connectionId: this.connectionId
        });
      }
    }
    return false;
  }

  /**
   * Normalize API response
   */
  normalizeResponse(response) {
    return {
      data: this.normalizeData(response.data),
      metadata: this.extractMetadata(response),
      rateLimits: this.extractRateLimits(response)
    };
  }

  /**
   * Normalize API error
   */
  normalizeError(error) {
    return errorHandler.handleError(error, {
      platform: this.platform,
      connectionId: this.connectionId
    });
  }

  /**
   * Platform-specific methods to be implemented by subclasses
   */
  
  normalizeData(data) {
    throw new Error('Method not implemented');
  }

  extractMetadata(response) {
    throw new Error('Method not implemented');
  }

  extractRateLimits(response) {
    throw new Error('Method not implemented');
  }

  validateResponse(response) {
    throw new Error('Method not implemented');
  }
}