import { OAuthError, OAuthErrorType } from './OAuthHandler';
import InstagramOAuthHandler from './InstagramOAuthHandler';

/**
 * Factory for creating platform-specific OAuth handlers
 */
class OAuthHandlerFactory {
  constructor() {
    this.handlers = new Map();
    this.registerDefaultHandlers();
  }

  /**
   * Register built-in handlers
   */
  registerDefaultHandlers() {
    this.registerHandler('instagram', InstagramOAuthHandler);

    // Other platform handlers will be registered here
    // this.registerHandler('twitter', TwitterOAuthHandler);
    // this.registerHandler('linkedin', LinkedInOAuthHandler);
    // this.registerHandler('youtube', YouTubeOAuthHandler);
    // this.registerHandler('tiktok', TikTokOAuthHandler);
    // this.registerHandler('facebook', FacebookOAuthHandler);
  }

  /**
   * Register a new handler
   */
  registerHandler(platform, handler) {
    if (this.handlers.has(platform)) {
      console.warn(`Overriding existing handler for platform: ${platform}`);
    }
    this.handlers.set(platform, handler);
  }

  /**
   * Get handler for a specific platform
   */
  getHandler(platform) {
    const handler = this.handlers.get(platform);
    if (!handler) {
      throw new OAuthError(
        `No OAuth handler registered for platform: ${platform}`,
        OAuthErrorType.UNSUPPORTED_GRANT_TYPE
      );
    }
    return handler;
  }

  /**
   * List all supported platforms
   */
  getSupportedPlatforms() {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if a platform is supported
   */
  isSupported(platform) {
    return this.handlers.has(platform);
  }

  /**
   * Get configuration for all supported platforms
   */
  getPlatformConfigs() {
    const configs = {};
    for (const [platform, handler] of this.handlers) {
      configs[platform] = {
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        requiredScopes: handler.requiredScopes,
        supportsRefreshToken: platform !== 'instagram', // Only Instagram doesn't use refresh tokens
        authType: this.getAuthType(platform),
      };
    }
    return configs;
  }

  /**
   * Get OAuth type for a platform
   */
  getAuthType(platform) {
    switch (platform) {
      case 'twitter':
        return 'OAuth 2.0 PKCE';
      case 'instagram':
      case 'facebook':
        return 'OAuth 2.0';
      case 'linkedin':
        return 'OAuth 2.0';
      case 'youtube':
        return 'Google OAuth 2.0';
      case 'tiktok':
        return 'OAuth 2.0';
      default:
        return 'Unknown';
    }
  }
}

// Export singleton instance
const oAuthHandlerFactory = new OAuthHandlerFactory();
export default oAuthHandlerFactory;