import { SocialPlatformAdapter } from './SocialPlatformAdapter';
import { ErrorCategory, ErrorCode } from '../ErrorHandler';

/**
 * Instagram-specific platform adapter
 */
export class InstagramAdapter extends SocialPlatformAdapter {
  constructor() {
    super('instagram');
    this.baseUrl = 'https://graph.instagram.com';
    this.endpoints = {
      USER: '/me',
      MEDIA: '/me/media',
      MEDIA_ITEM: '/media/{media-id}',
      INSIGHTS: '/media/{media-id}/insights'
    };
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken) {
    return this.executeApiCall(async () => {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.USER}?` +
        new URLSearchParams({
          fields: 'id,username,account_type,media_count',
          access_token: accessToken
        })
      );

      if (!response.ok) {
        throw this.handleApiError(response);
      }

      const data = await response.json();
      return this.normalizeResponse({
        data,
        headers: response.headers
      });
    });
  }

  /**
   * Get user media
   */
  async getUserMedia(accessToken, options = {}) {
    const fields = [
      'id',
      'caption',
      'media_type',
      'media_url',
      'permalink',
      'thumbnail_url',
      'timestamp',
      'username'
    ].join(',');

    return this.executeApiCall(async () => {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.MEDIA}?` +
        new URLSearchParams({
          fields,
          access_token: accessToken,
          limit: options.limit || 25,
          after: options.after || ''
        })
      );

      if (!response.ok) {
        throw this.handleApiError(response);
      }

      const data = await response.json();
      return this.normalizeResponse({
        data,
        headers: response.headers
      });
    });
  }

  /**
   * Get media item details
   */
  async getMediaItem(mediaId, accessToken) {
    const fields = [
      'id',
      'caption',
      'media_type',
      'media_url',
      'permalink',
      'thumbnail_url',
      'timestamp',
      'username',
      'like_count',
      'comments_count'
    ].join(',');

    return this.executeApiCall(async () => {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.MEDIA_ITEM.replace('{media-id}', mediaId)}?` +
        new URLSearchParams({
          fields,
          access_token: accessToken
        })
      );

      if (!response.ok) {
        throw this.handleApiError(response);
      }

      const data = await response.json();
      return this.normalizeResponse({
        data,
        headers: response.headers
      });
    });
  }

  /**
   * Get media insights
   */
  async getMediaInsights(mediaId, accessToken) {
    const metrics = [
      'engagement',
      'impressions',
      'reach',
      'saved',
      'video_views'
    ].join(',');

    return this.executeApiCall(async () => {
      const response = await fetch(
        `${this.baseUrl}${this.endpoints.INSIGHTS.replace('{media-id}', mediaId)}?` +
        new URLSearchParams({
          metric: metrics,
          access_token: accessToken
        })
      );

      if (!response.ok) {
        throw this.handleApiError(response);
      }

      const data = await response.json();
      return this.normalizeResponse({
        data,
        headers: response.headers
      });
    });
  }

  /**
   * Normalize Instagram API response data
   */
  normalizeData(data) {
    if (Array.isArray(data.data)) {
      // Handle paginated responses
      return {
        items: data.data.map(item => this.normalizeMediaItem(item)),
        paging: data.paging
      };
    } else if (data.data) {
      // Handle insights responses
      return {
        metrics: this.normalizeInsights(data.data)
      };
    } else {
      // Handle single item responses
      return this.normalizeMediaItem(data);
    }
  }

  /**
   * Normalize a media item
   */
  normalizeMediaItem(item) {
    return {
      id: item.id,
      type: item.media_type.toLowerCase(),
      caption: item.caption || '',
      url: item.media_url,
      thumbnailUrl: item.thumbnail_url || item.media_url,
      permalink: item.permalink,
      timestamp: new Date(item.timestamp),
      username: item.username,
      metrics: {
        likes: item.like_count || 0,
        comments: item.comments_count || 0
      }
    };
  }

  /**
   * Normalize insights data
   */
  normalizeInsights(insights) {
    const metrics = {};
    for (const metric of insights) {
      metrics[metric.name] = {
        value: metric.values[0].value,
        timestamp: new Date(metric.values[0].end_time)
      };
    }
    return metrics;
  }

  /**
   * Extract metadata from response
   */
  extractMetadata(response) {
    return {
      requestId: response.headers.get('x-fb-request-id'),
      trace: response.headers.get('x-fb-trace-id')
    };
  }

  /**
   * Extract rate limits from response headers
   */
  extractRateLimits(response) {
    const usage = response.headers.get('x-app-usage');
    if (!usage) return null;

    try {
      const limits = JSON.parse(usage);
      return {
        'api_calls': {
          limit: 100,
          remaining: 100 - limits.call_count,
          reset: 3600 // Reset after 1 hour
        }
      };
    } catch (error) {
      console.warn('Failed to parse Instagram rate limits:', error);
      return null;
    }
  }

  /**
   * Handle Instagram API errors
   */
  handleApiError(response) {
    const statusCode = response.status;
    const error = {
      status: statusCode,
      message: response.statusText
    };

    // Add response data if available
    try {
      const data = response.json();
      error.code = data.error?.code;
      error.message = data.error?.message || error.message;
      error.type = data.error?.type;
    } catch (e) {
      // Ignore JSON parse errors
    }

    // Map Instagram error codes to standard error types
    switch (error.code) {
      case 190:
        return this.normalizeError({
          ...error,
          category: ErrorCategory.TOKEN,
          code: ErrorCode.TOKEN_INVALID
        });

      case 4:
        return this.normalizeError({
          ...error,
          category: ErrorCategory.RATE_LIMIT,
          code: ErrorCode.RATE_LIMIT_EXCEEDED
        });

      case 24:
        return this.normalizeError({
          ...error,
          category: ErrorCategory.AUTHORIZATION,
          code: ErrorCode.PERMISSION_DENIED
        });

      case 10:
        return this.normalizeError({
          ...error,
          category: ErrorCategory.VALIDATION,
          code: ErrorCode.INVALID_PARAMETER
        });

      default:
        if (statusCode === 404) {
          return this.normalizeError({
            ...error,
            category: ErrorCategory.API,
            code: ErrorCode.INVALID_REQUEST
          });
        } else if (statusCode >= 500) {
          return this.normalizeError({
            ...error,
            category: ErrorCategory.API,
            code: ErrorCode.SERVICE_UNAVAILABLE
          });
        } else {
          return this.normalizeError({
            ...error,
            category: ErrorCategory.UNKNOWN,
            code: ErrorCode.UNKNOWN_ERROR
          });
        }
    }
  }

  /**
   * Validate response structure
   */
  validateResponse(response) {
    if (!response || typeof response !== 'object') {
      return false;
    }

    if (Array.isArray(response.data)) {
      // Validate paginated response
      return (
        Array.isArray(response.data) &&
        response.data.every(item => this.validateMediaItem(item)) &&
        typeof response.paging === 'object'
      );
    } else if (response.data) {
      // Validate insights response
      return Array.isArray(response.data) &&
        response.data.every(metric =>
          typeof metric.name === 'string' &&
          Array.isArray(metric.values) &&
          metric.values.length > 0
        );
    } else {
      // Validate single item response
      return this.validateMediaItem(response);
    }
  }

  /**
   * Validate media item structure
   */
  validateMediaItem(item) {
    return (
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.media_type === 'string' &&
      typeof item.media_url === 'string' &&
      typeof item.timestamp === 'string'
    );
  }
}

// Export singleton instance
const instagramAdapter = new InstagramAdapter();
export default instagramAdapter;