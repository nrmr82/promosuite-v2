import { OAuthHandler, OAuthError, OAuthErrorType } from './OAuthHandler';

export class TikTokOAuthHandler extends OAuthHandler {
  constructor() {
    super('tiktok');
    this.baseUrl = 'https://open-api.tiktok.com';
    this.clientKey = process.env.REACT_APP_TIKTOK_CLIENT_KEY;
    this.clientSecret = process.env.REACT_APP_TIKTOK_CLIENT_SECRET;
    this.redirectUri = `${window.location.origin}/auth/callback/tiktok`;
    this.requiredScopes = ['user.info.basic', 'video.list', 'video.upload'];
  }

  generateAuthUrl(options = {}) {
    const params = new URLSearchParams({
      client_key: this.clientKey,
      response_type: 'code',
      scope: this.requiredScopes.join(','),
      redirect_uri: this.redirectUri,
      state: options.state || crypto.randomUUID(),
    });

    return `${this.baseUrl}/oauth/authorize?${params.toString()}`;
  }

  async exchangeCode(code) {
    try {
      const tokenResponse = await fetch(`${this.baseUrl}/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          code,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw this.handleError(error);
      }

      const tokens = await tokenResponse.json();
      
      // Get user info
      const profile = await this.getUserProfile(tokens.data.access_token, tokens.data.open_id);

      return {
        accessToken: tokens.data.access_token,
        refreshToken: tokens.data.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.data.expires_in * 1000)),
        tokenType: tokens.data.token_type,
        scope: tokens.data.scope.split(','),
        openId: tokens.data.open_id,
        profile,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_key: this.clientKey,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      const tokens = await response.json();
      
      return {
        accessToken: tokens.data.access_token,
        refreshToken: tokens.data.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.data.expires_in * 1000)),
        tokenType: tokens.data.token_type,
        scope: tokens.data.scope.split(','),
        openId: tokens.data.open_id,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserProfile(accessToken, openId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/v2/user/info?` +
        new URLSearchParams({
          access_token: accessToken,
          open_id: openId,
          fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'bio_description', 'profile_deep_link'].join(','),
        })
      );

      if (!response.ok) {
        const error = await response.json();
        throw this.handleError(error);
      }

      const data = await response.json();
      const profile = data.data.user;

      return {
        platformUserId: profile.open_id,
        username: profile.display_name,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio_description,
        profileUrl: profile.profile_deep_link,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateToken(accessToken, openId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/v2/user/info?` +
        new URLSearchParams({
          access_token: accessToken,
          open_id: openId,
          fields: 'open_id',
        })
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  handleError(error) {
    if (error instanceof OAuthError) {
      return error;
    }

    const errorData = error.data || {};
    let type = OAuthErrorType.UNKNOWN_ERROR;
    let message = errorData.description || error.message || 'An unknown error occurred';

    switch (errorData.error_code) {
      case 'access_token_expired':
        type = OAuthErrorType.TOKEN_EXPIRED;
        message = 'TikTok access token has expired';
        break;
      case 'invalid_access_token':
        type = OAuthErrorType.INVALID_TOKEN;
        message = 'Invalid TikTok access token';
        break;
      case 'invalid_scope':
        type = OAuthErrorType.INVALID_SCOPE;
        message = 'Required TikTok permissions not granted';
        break;
      case 'server_error':
        type = OAuthErrorType.SERVER_ERROR;
        message = 'TikTok server error';
        break;
    }

    return new OAuthError(message, type, error);
  }
}

const tiktokOAuthHandler = new TikTokOAuthHandler();
export default tiktokOAuthHandler;