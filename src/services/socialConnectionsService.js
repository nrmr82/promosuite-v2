import { supabase } from '../utils/supabase';

/**
 * SocialConnectionsService
 * Handles OAuth flows and manages social platform connections
 */
class SocialConnectionsService {
  
  /**
   * Get all social connections for the current user
   */
  async getUserConnections() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('social_connections_safe')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { connections: data || [] };
    } catch (error) {
      console.error('Error fetching social connections:', error);
      throw error;
    }
  }

  /**
   * Get connection status for a specific platform
   */
  async getPlatformConnection(platform) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('social_connections_safe')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      return { connection: data };
    } catch (error) {
      console.error(`Error fetching ${platform} connection:`, error);
      throw error;
    }
  }

  /**
   * Initialize OAuth flow for a platform
   * For now, this will be a mock implementation
   */
  async initiatePlatformConnection(platform) {
    try {
      // This would normally redirect to OAuth provider
      // For demo purposes, we'll simulate a successful connection
      
      const mockOAuthData = this.getMockOAuthData(platform);
      
      // In a real implementation, this would happen after OAuth callback
      return await this.savePlatformConnection(platform, mockOAuthData);
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Save platform connection after successful OAuth
   */
  async savePlatformConnection(platform, oauthData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const connectionData = {
        user_id: user.id,
        platform: platform,
        platform_user_id: oauthData.platformUserId,
        platform_username: oauthData.username,
        platform_display_name: oauthData.displayName,
        avatar_url: oauthData.avatarUrl,
        access_token: oauthData.accessToken, // In production, this should be encrypted
        refresh_token: oauthData.refreshToken,
        token_expires_at: oauthData.expiresAt,
        scopes: oauthData.scopes,
        connection_status: 'active',
        last_sync_at: new Date().toISOString(),
        platform_data: oauthData.platformData || {}
      };

      const { data, error } = await supabase
        .from('social_connections')
        .upsert(connectionData, { 
          onConflict: 'user_id,platform',
          returning: 'minimal' 
        });

      if (error) throw error;

      // Return the safe view data
      const { connection } = await this.getPlatformConnection(platform);
      return { connection };
    } catch (error) {
      console.error(`Error saving ${platform} connection:`, error);
      throw error;
    }
  }

  /**
   * Disconnect a platform
   */
  async disconnectPlatform(platform) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('social_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Refresh platform connection tokens
   */
  async refreshPlatformConnection(platform) {
    try {
      const { connection } = await this.getPlatformConnection(platform);
      if (!connection) {
        throw new Error(`No connection found for ${platform}`);
      }

      // In a real implementation, this would use the refresh token
      // to get a new access token from the platform
      const mockRefreshedData = {
        ...this.getMockOAuthData(platform),
        platformUserId: connection.platform_user_id,
        username: connection.platform_username,
        displayName: connection.platform_display_name,
      };

      return await this.savePlatformConnection(platform, mockRefreshedData);
    } catch (error) {
      console.error(`Error refreshing ${platform} connection:`, error);
      throw error;
    }
  }

  /**
   * Get platform-specific OAuth URLs and settings
   */
  getPlatformOAuthConfig(platform) {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/auth/callback/social`;

    const configs = {
      instagram: {
        authUrl: 'https://api.instagram.com/oauth/authorize',
        clientId: process.env.REACT_APP_INSTAGRAM_CLIENT_ID,
        scopes: ['user_profile', 'user_media'],
        redirectUri,
        responseType: 'code'
      },
      twitter: {
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        clientId: process.env.REACT_APP_TWITTER_CLIENT_ID,
        scopes: ['tweet.read', 'users.read', 'tweet.write'],
        redirectUri,
        responseType: 'code'
      },
      linkedin: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        clientId: process.env.REACT_APP_LINKEDIN_CLIENT_ID,
        scopes: ['r_liteprofile', 'w_member_social'],
        redirectUri,
        responseType: 'code'
      },
      youtube: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        scopes: ['https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtube.upload'],
        redirectUri,
        responseType: 'code'
      },
      tiktok: {
        authUrl: 'https://www.tiktok.com/auth/authorize/',
        clientId: process.env.REACT_APP_TIKTOK_CLIENT_ID,
        scopes: ['user.info.basic', 'video.list'],
        redirectUri,
        responseType: 'code'
      }
    };

    return configs[platform];
  }

  /**
   * Generate mock OAuth data for demonstration
   * In production, this would come from actual OAuth callbacks
   */
  getMockOAuthData(platform) {
    const mockData = {
      instagram: {
        platformUserId: 'ig_user_123',
        username: 'your_instagram',
        displayName: 'Your Instagram Account',
        avatarUrl: 'https://via.placeholder.com/50/E4405F/FFFFFF?text=IG',
        accessToken: 'mock_ig_access_token',
        refreshToken: null, // Instagram doesn't provide refresh tokens
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        scopes: ['user_profile', 'user_media'],
        platformData: {
          followersCount: 1250,
          mediaCount: 45
        }
      },
      twitter: {
        platformUserId: 'tw_user_456',
        username: '@your_twitter',
        displayName: 'Your Twitter Account',
        avatarUrl: 'https://via.placeholder.com/50/1DA1F2/FFFFFF?text=TW',
        accessToken: 'mock_tw_access_token',
        refreshToken: 'mock_tw_refresh_token',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        scopes: ['tweet.read', 'users.read', 'tweet.write'],
        platformData: {
          followersCount: 890,
          tweetsCount: 234
        }
      },
      linkedin: {
        platformUserId: 'li_user_789',
        username: 'your-linkedin',
        displayName: 'Your LinkedIn Account',
        avatarUrl: 'https://via.placeholder.com/50/0A66C2/FFFFFF?text=LI',
        accessToken: 'mock_li_access_token',
        refreshToken: 'mock_li_refresh_token',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        scopes: ['r_liteprofile', 'w_member_social'],
        platformData: {
          connectionsCount: 567,
          industry: 'Real Estate'
        }
      },
      youtube: {
        platformUserId: 'yt_user_101',
        username: 'Your YouTube Channel',
        displayName: 'Your YouTube Account',
        avatarUrl: 'https://via.placeholder.com/50/FF0000/FFFFFF?text=YT',
        accessToken: 'mock_yt_access_token',
        refreshToken: 'mock_yt_refresh_token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
        platformData: {
          subscribersCount: 1500,
          videosCount: 12
        }
      },
      tiktok: {
        platformUserId: 'tt_user_202',
        username: '@your_tiktok',
        displayName: 'Your TikTok Account',
        avatarUrl: 'https://via.placeholder.com/50/000000/FFFFFF?text=TT',
        accessToken: 'mock_tt_access_token',
        refreshToken: 'mock_tt_refresh_token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        scopes: ['user.info.basic', 'video.list'],
        platformData: {
          followersCount: 2340,
          videosCount: 67
        }
      }
    };

    return mockData[platform];
  }

  /**
   * Get platform-specific branding
   */
  getPlatformConfig(platform) {
    const configs = {
      instagram: {
        name: 'Instagram',
        color: '#E4405F',
        icon: 'instagram',
        description: 'Share photos and stories'
      },
      twitter: {
        name: 'Twitter',
        color: '#1DA1F2',
        icon: 'twitter',
        description: 'Share updates and engage'
      },
      linkedin: {
        name: 'LinkedIn',
        color: '#0A66C2',
        icon: 'linkedin',
        description: 'Professional networking'
      },
      youtube: {
        name: 'YouTube',
        color: '#FF0000',
        icon: 'youtube',
        description: 'Video content creation'
      },
      tiktok: {
        name: 'TikTok',
        color: '#000000',
        icon: 'video',
        description: 'Short-form video content'
      }
    };

    return configs[platform];
  }
}

export default new SocialConnectionsService();