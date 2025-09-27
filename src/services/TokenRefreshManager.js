import { supabase } from '../utils/supabase';
import oAuthHandlerFactory from './oauth/OAuthHandlerFactory';
import { OAuthError, OAuthErrorType } from './oauth/OAuthHandler';

/**
 * Manages token refresh operations for social connections
 */
class TokenRefreshManager {
  constructor() {
    this.refreshQueue = new Map(); // Map<connectionId, RefreshTask>
    this.retryDelays = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff delays in ms
    this.isRunning = false;
    this.checkInterval = 60000; // Check every minute
    this.refreshThreshold = 300000; // Refresh tokens 5 minutes before expiration
  }

  /**
   * Start the refresh manager
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.checkTokens();
    this.intervalId = setInterval(() => this.checkTokens(), this.checkInterval);
  }

  /**
   * Stop the refresh manager
   */
  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.refreshQueue.clear();
  }

  /**
   * Check all tokens for expiration
   */
  async checkTokens() {
    try {
      const { data: connections, error } = await supabase
        .from('social_connections')
        .select('*')
        .or('connection_status.eq.active,connection_status.eq.error')
        .order('token_expires_at', { ascending: true });

      if (error) throw error;

      for (const connection of connections) {
        // Skip if already in queue
        if (this.refreshQueue.has(connection.id)) continue;

        const expiresAt = new Date(connection.token_expires_at);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();

        // Check if token needs refresh
        if (timeUntilExpiry <= this.refreshThreshold) {
          this.queueTokenRefresh(connection);
        }
      }
    } catch (error) {
      console.error('Error checking tokens:', error);
    }
  }

  /**
   * Queue a token refresh operation
   */
  queueTokenRefresh(connection, attempt = 0) {
    // Skip if already in queue
    if (this.refreshQueue.has(connection.id)) return;

    const task = {
      connection,
      attempt,
      status: 'pending',
      lastAttempt: null,
      nextAttempt: new Date(),
      error: null
    };

    this.refreshQueue.set(connection.id, task);
    this.processQueue();
  }

  /**
   * Process the refresh queue
   */
  async processQueue() {
    for (const [connectionId, task] of this.refreshQueue) {
      if (task.status === 'pending' && task.nextAttempt <= new Date()) {
        await this.refreshToken(connectionId, task);
      }
    }
  }

  /**
   * Refresh a token
   */
  async refreshToken(connectionId, task) {
    const { connection, attempt } = task;
    
    try {
      // Update task status
      task.status = 'refreshing';
      task.lastAttempt = new Date();
      
      // Get platform handler
      const handler = oAuthHandlerFactory.getHandler(connection.platform);
      
      // Attempt token refresh
      let refreshResult;
      if (connection.encrypted_refresh_token) {
        // Use refresh token if available
        const { data: refreshToken } = await supabase.rpc(
          'decrypt_token',
          { 
            encrypted_token: connection.encrypted_refresh_token,
            key_id: connection.encryption_key_id 
          }
        );
        refreshResult = await handler.refreshToken(refreshToken);
      } else if (connection.encrypted_access_token) {
        // For platforms like Instagram that refresh using access token
        const { data: accessToken } = await supabase.rpc(
          'decrypt_token',
          { 
            encrypted_token: connection.encrypted_access_token,
            key_id: connection.encryption_key_id 
          }
        );
        refreshResult = await handler.refreshToken(accessToken);
      } else {
        throw new OAuthError(
          'No valid token available for refresh',
          OAuthErrorType.INVALID_TOKEN
        );
      }

      // Generate new encryption key
      const newKeyId = crypto.randomUUID();

      // Encrypt new tokens
      const { data: encryptedAccessToken } = await supabase.rpc(
        'encrypt_token',
        {
          token: refreshResult.accessToken,
          key_id: newKeyId
        }
      );

      let encryptedRefreshToken = null;
      if (refreshResult.refreshToken) {
        const { data: refreshToken } = await supabase.rpc(
          'encrypt_token',
          {
            token: refreshResult.refreshToken,
            key_id: newKeyId
          }
        );
        encryptedRefreshToken = refreshToken;
      }

      // Update connection in database
      const { error: updateError } = await supabase
        .from('social_connections')
        .update({
          encrypted_access_token: encryptedAccessToken,
          encrypted_refresh_token: encryptedRefreshToken,
          encryption_key_id: newKeyId,
          token_expires_at: refreshResult.expiresAt,
          connection_status: 'active',
          last_sync_at: new Date().toISOString(),
          platform_data: {
            ...connection.platform_data,
            last_refresh_success: new Date().toISOString(),
            refresh_attempt_count: (connection.platform_data?.refresh_attempt_count || 0) + 1
          }
        })
        .eq('id', connectionId);

      if (updateError) throw updateError;

      // Remove from queue on success
      this.refreshQueue.delete(connectionId);

    } catch (error) {
      console.error(`Error refreshing token for connection ${connectionId}:`, error);
      
      // Update task for retry
      task.status = 'error';
      task.error = error;
      
      // Check if we should retry
      if (attempt < this.retryDelays.length) {
        const nextDelay = this.retryDelays[attempt];
        task.nextAttempt = new Date(Date.now() + nextDelay);
        task.attempt = attempt + 1;
        task.status = 'pending';
      } else {
        // Max retries reached, update connection status
        await this.handleMaxRetriesReached(connection, error);
        this.refreshQueue.delete(connectionId);
      }
    }
  }

  /**
   * Handle case when max retries are reached
   */
  async handleMaxRetriesReached(connection, error) {
    try {
      // Update connection status
      const { error: updateError } = await supabase
        .from('social_connections')
        .update({
          connection_status: 'error',
          platform_data: {
            ...connection.platform_data,
            last_refresh_error: error.message,
            last_refresh_attempt: new Date().toISOString(),
            refresh_attempt_count: (connection.platform_data?.refresh_attempt_count || 0) + 1
          }
        })
        .eq('id', connection.id);

      if (updateError) throw updateError;

      // Trigger webhook if configured
      if (process.env.REACT_APP_REFRESH_ERROR_WEBHOOK) {
        try {
          await fetch(process.env.REACT_APP_REFRESH_ERROR_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'token_refresh_failed',
              connection_id: connection.id,
              platform: connection.platform,
              error: error.message,
              timestamp: new Date().toISOString()
            })
          });
        } catch (webhookError) {
          console.error('Error sending webhook:', webhookError);
        }
      }
    } catch (error) {
      console.error('Error handling max retries:', error);
    }
  }

  /**
   * Force refresh a specific connection
   */
  async forceRefresh(connectionId) {
    const { data: connection, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (error) throw error;
    if (!connection) throw new Error('Connection not found');

    // Remove any existing refresh task
    this.refreshQueue.delete(connectionId);
    
    // Queue new refresh
    this.queueTokenRefresh(connection, 0);
    
    return { message: 'Refresh queued' };
  }

  /**
   * Get refresh status for a connection
   */
  getRefreshStatus(connectionId) {
    const task = this.refreshQueue.get(connectionId);
    if (!task) return null;

    return {
      status: task.status,
      attempt: task.attempt,
      lastAttempt: task.lastAttempt,
      nextAttempt: task.nextAttempt,
      error: task.error?.message
    };
  }

  /**
   * Get all active refresh tasks
   */
  getActiveTasks() {
    return Array.from(this.refreshQueue.entries()).map(([connectionId, task]) => ({
      connectionId,
      ...this.getRefreshStatus(connectionId)
    }));
  }
}

// Export singleton instance
const tokenRefreshManager = new TokenRefreshManager();
export default tokenRefreshManager;