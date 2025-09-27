import InstagramAdapter from './InstagramAdapter';
import { ErrorCategory, ErrorCode } from '../ErrorHandler';

/**
 * Factory for managing platform-specific adapters
 */
class PlatformAdapterFactory {
  constructor() {
    this.adapters = new Map();
    this.registerDefaultAdapters();
  }

  /**
   * Register built-in adapters
   */
  registerDefaultAdapters() {
    // Register Instagram adapter
    this.registerAdapter('instagram', InstagramAdapter);

    // Other adapters will be registered here
    // this.registerAdapter('twitter', TwitterAdapter);
    // this.registerAdapter('linkedin', LinkedInAdapter);
    // this.registerAdapter('youtube', YouTubeAdapter);
    // this.registerAdapter('tiktok', TikTokAdapter);
    // this.registerAdapter('facebook', FacebookAdapter);
  }

  /**
   * Register a new adapter
   */
  registerAdapter(platform, adapter) {
    if (this.adapters.has(platform)) {
      console.warn(`Overriding existing adapter for platform: ${platform}`);
    }
    this.adapters.set(platform, adapter);
  }

  /**
   * Get adapter for a specific platform
   */
  getAdapter(platform) {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      throw new Error(`No adapter registered for platform: ${platform}`, {
        category: ErrorCategory.PLATFORM,
        code: ErrorCode.PLATFORM_ERROR,
        metadata: { platform }
      });
    }
    return adapter;
  }

  /**
   * List all supported platforms
   */
  getSupportedPlatforms() {
    return Array.from(this.adapters.keys());
  }

  /**
   * Check if a platform is supported
   */
  isSupported(platform) {
    return this.adapters.has(platform);
  }

  /**
   * Get adapter capabilities
   */
  getAdapterCapabilities(platform) {
    const adapter = this.getAdapter(platform);
    const proto = Object.getPrototypeOf(adapter);
    const methods = Object.getOwnPropertyNames(proto)
      .filter(name => {
        // Exclude constructor and private methods
        return name !== 'constructor' && !name.startsWith('_');
      });

    return {
      platform,
      methods,
      endpoints: adapter.endpoints || {},
      features: {
        hasInsights: methods.includes('getMediaInsights'),
        hasAnalytics: methods.includes('getAnalytics'),
        hasScheduling: methods.includes('schedulePost'),
        hasComments: methods.includes('getComments')
      }
    };
  }

  /**
   * Execute an operation across multiple platforms
   */
  async executeForPlatforms(platforms, operation) {
    const results = {
      succeeded: [],
      failed: []
    };

    await Promise.all(
      platforms.map(async platform => {
        try {
          const adapter = this.getAdapter(platform);
          const result = await operation(adapter);
          results.succeeded.push({
            platform,
            result
          });
        } catch (error) {
          results.failed.push({
            platform,
            error
          });
        }
      })
    );

    return results;
  }
}

// Export singleton instance
const platformAdapterFactory = new PlatformAdapterFactory();
export default platformAdapterFactory;