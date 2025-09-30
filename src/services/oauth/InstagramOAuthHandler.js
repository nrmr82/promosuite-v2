import { OAuthHandler, OAuthError, OAuthErrorType } from './OAuthHandler';

/**
 * Instagram OAuth handler implementation
 */
export class InstagramOAuthHandler extends OAuthHandler {
  constructor() {
    super('instagram');
    this.baseUrl = 'https://api.instagram.com';
    this.graphUrl = 'https://graph.instagram.com';
    this.clientId = process.env.REACT_APP_INSTAGRAM_CLIENT_ID;
    this.clientSecret = process.env.REACT_APP_INSTAGRAM_CLIENT_SECRET;
    this.redirectUri = `${window.location.origin}/auth/callback/instagram`;
    this.requiredScopes = ['user_profile', 'user_media'];
  }

  /**
   * Generate Instagram OAuth URL
   */
  generateAuthUrl(options = {}) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.requiredScopes.join(','),
      response_type: 'code',
      state: options.state || crypto.randomUUID(),
    });

    return `${this.baseUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(code, state) {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
          code,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      const tokenResponse = await response.json();
      
      if (!this.validateTokenResponse(tokenResponse)) {
        throw new OAuthError(
          'Invalid token response from Instagram',
          OAuthErrorType.INVALID_TOKEN
        );
      }

      // Get long-lived token
      const longLivedToken = await this.getLongLivedToken(tokenResponse.access_token);
      
      // Get user profile
      const profile = await this.getUserProfile(longLivedToken.access_token);

      return {
        accessToken: longLivedToken.access_token,
        refreshToken: null, // Instagram doesn't provide refresh tokens
        expiresAt: new Date(Date.now() + (longLivedToken.expires_in * 1000)),
        tokenType: 'bearer',
        scope: this.requiredScopes,
        profile,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get long-lived access token
   */
  async getLongLivedToken(shortLivedToken) {
    try {
      const response = await fetch(
        `${this.graphUrl}/access_token?` +
        new URLSearchParams({
          grant_type: 'ig_exchange_token',
          client_secret: this.clientSecret,
          access_token: shortLivedToken,
        })
      );

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      return response.json();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   * Instagram uses token refresh instead of refresh tokens
   */
  async refreshToken(accessToken) {
    try {
      const response = await fetch(
        `${this.graphUrl}/refresh_access_token?` +
        new URLSearchParams({
          grant_type: 'ig_refresh_token',
          access_token: accessToken,
        })
      );

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      const tokenResponse = await response.json();
      
      return {
        accessToken: tokenResponse.access_token,
        refreshToken: null,
        expiresAt: new Date(Date.now() + (tokenResponse.expires_in * 1000)),
        tokenType: 'bearer',
        scope: this.requiredScopes,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate token response
   */
  validateTokenResponse(tokenResponse) {
    return (
      tokenResponse &&
      typeof tokenResponse === 'object' &&
      typeof tokenResponse.access_token === 'string' &&
      tokenResponse.access_token.length > 0
    );
  }

  /**
   * Get user profile from Instagram
   */
  async getUserProfile(accessToken) {
    try {
      const fieldsParam = 'id,username,account_type,media_count';
      const response = await fetch(
        `${this.graphUrl}/me?` +
        new URLSearchParams({
          fields: fieldsParam,
          access_token: accessToken,
        })
      );

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      const profile = await response.json();

      return {
        platformUserId: profile.id,
        username: profile.username,
        displayName: profile.username, // Instagram API doesn't provide display name
        accountType: profile.account_type,
        mediaCount: profile.media_count,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if token is valid
   */
  async validateToken(accessToken) {
    try {
      const response = await fetch(
        `${this.graphUrl}/me?` +
        new URLSearchParams({
          fields: 'id',
          access_token: accessToken,
        })
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Map Instagram errors to standard OAuth errors
   */
  handleError(error) {
    if (error instanceof OAuthError) {
      return error;
    }

    const errorData = error.error || {};
    let type = OAuthErrorType.UNKNOWN_ERROR;
    let message = error.message || 'An unknown error occurred';

    // Map Instagram error codes to standard OAuth error types
    switch (errorData.code) {
      case 190:
        type = OAuthErrorType.INVALID_TOKEN;
        message = 'Instagram access token is invalid or expired';
        break;
      case 4:
        type = OAuthErrorType.RATE_LIMIT_EXCEEDED;
        message = 'Instagram API rate limit exceeded';
        break;
      case 10:
        type = OAuthErrorType.INVALID_SCOPE;
        message = 'Required Instagram permissions not granted';
        break;
      case 24:
        type = OAuthErrorType.ACCESS_DENIED;
        message = 'Instagram access denied';
        break;
      case 2:
        type = OAuthErrorType.SERVER_ERROR;
        message = 'Instagram server error';
        break;
      default:
        // Keep default values set above
        break;
    }

    return new OAuthError(message, type, error);
  }
}

// Export singleton instance
const instagramOAuthHandler = new InstagramOAuthHandler();
export default instagramOAuthHandler;