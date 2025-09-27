/**
 * Base OAuth handler interface
 * All platform-specific handlers must implement these methods
 */
export class OAuthHandler {
  constructor(platform) {
    this.platform = platform;
  }

  /**
   * Generate OAuth authorization URL
   * @param {Object} options - Additional options for the authorization URL
   * @returns {string} Authorization URL
   */
  generateAuthUrl(options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from OAuth callback
   * @param {string} state - State parameter for CSRF protection
   * @returns {Promise<Object>} Token response
   */
  async exchangeCode(code, state) {
    throw new Error('Method not implemented');
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token response
   */
  async refreshToken(refreshToken) {
    throw new Error('Method not implemented');
  }

  /**
   * Validate token response
   * @param {Object} tokenResponse - Token response from OAuth provider
   * @returns {boolean} Whether the token response is valid
   */
  validateTokenResponse(tokenResponse) {
    throw new Error('Method not implemented');
  }

  /**
   * Get user profile from platform API
   * @param {string} accessToken - Access token
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(accessToken) {
    throw new Error('Method not implemented');
  }

  /**
   * Revoke access token
   * @param {string} accessToken - Access token to revoke
   * @returns {Promise<void>}
   */
  async revokeToken(accessToken) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if token is valid
   * @param {string} accessToken - Access token to check
   * @returns {Promise<boolean>} Whether the token is valid
   */
  async validateToken(accessToken) {
    throw new Error('Method not implemented');
  }

  /**
   * Handle OAuth errors
   * @param {Error} error - Error from OAuth operation
   * @returns {Error} Normalized error
   */
  handleError(error) {
    throw new Error('Method not implemented');
  }
}

/**
 * Standard OAuth error types
 */
export const OAuthErrorType = {
  INVALID_REQUEST: 'invalid_request',
  INVALID_CLIENT: 'invalid_client',
  INVALID_GRANT: 'invalid_grant',
  UNAUTHORIZED_CLIENT: 'unauthorized_client',
  UNSUPPORTED_GRANT_TYPE: 'unsupported_grant_type',
  INVALID_SCOPE: 'invalid_scope',
  ACCESS_DENIED: 'access_denied',
  SERVER_ERROR: 'server_error',
  TEMPORARILY_UNAVAILABLE: 'temporarily_unavailable',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  TOKEN_EXPIRED: 'token_expired',
  INVALID_TOKEN: 'invalid_token',
  REVOKED_TOKEN: 'revoked_token',
  NETWORK_ERROR: 'network_error',
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * OAuth error with normalized type
 */
export class OAuthError extends Error {
  constructor(message, type = OAuthErrorType.UNKNOWN_ERROR, originalError = null) {
    super(message);
    this.name = 'OAuthError';
    this.type = type;
    this.originalError = originalError;
  }
}