import { OAuthHandler, OAuthError, OAuthErrorType } from './OAuthHandler';

export class PinterestOAuthHandler extends OAuthHandler {
  constructor() {
    super('pinterest');
    this.baseUrl = 'https://api.pinterest.com/v5';
    this.authUrl = 'https://www.pinterest.com/oauth';
    this.clientId = process.env.REACT_APP_PINTEREST_CLIENT_ID;
    this.clientSecret = process.env.REACT_APP_PINTEREST_CLIENT_SECRET;
    this.redirectUri = `${window.location.origin}/auth/callback/pinterest`;
    this.requiredScopes = ['boards:read', 'boards:write', 'pins:read', 'pins:write', 'user_accounts:read'];
  }

  generateAuthUrl(options = {}) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.requiredScopes.join(' '),
      state: options.state || crypto.randomUUID()
    });

    return `${this.authUrl}/oauth?${params.toString()}`;
  }

  async exchangeCode(code) {
    try {
      const tokenResponse = await fetch(`${this.authUrl}/v1/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw this.handleError(error);
      }

      const tokens = await tokenResponse.json();
      
      // Get user profile
      const profile = await this.getUserProfile(tokens.access_token);

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
        tokenType: tokens.token_type,
        scope: tokens.scope.split(' '),
        profile,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${this.authUrl}/v1/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      const tokens = await response.json();
      
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
        tokenType: tokens.token_type,
        scope: tokens.scope.split(' '),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserProfile(accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/user_account`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      const profile = await response.json();

      return {
        platformUserId: profile.username,
        username: profile.username,
        displayName: profile.full_name || profile.username,
        avatarUrl: profile.profile_image,
        accountType: profile.account_type,
        profileUrl: profile.profile_url,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateToken(accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/user_account`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  handleError(error) {
    if (error instanceof OAuthError) {
      return error;
    }

    const errorData = error.error || {};
    let type = OAuthErrorType.UNKNOWN_ERROR;
    let message = error.message || 'An unknown error occurred';

    // Map Pinterest error codes to standard OAuth error types
    switch (errorData.code) {
      case 'invalid_request':
        type = OAuthErrorType.INVALID_REQUEST;
        message = 'Invalid request to Pinterest API';
        break;
      case 'invalid_token':
        type = OAuthErrorType.INVALID_TOKEN;
        message = 'Pinterest access token is invalid or expired';
        break;
      case 'insufficient_scope':
        type = OAuthErrorType.INVALID_SCOPE;
        message = 'Required Pinterest permissions not granted';
        break;
      default:
        if (errorData.message) {
          message = errorData.message;
        }
    }

    return new OAuthError(message, type, error);
  }
}

const pinterestOAuthHandler = new PinterestOAuthHandler();
export default pinterestOAuthHandler;