import { useState, useEffect, useCallback } from 'react';
import socialConnectionsService from '../services/socialConnectionsService';

/**
 * Custom hook for managing social platform connections
 */
export const useSocialConnections = () => {
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState({});

  // Load all connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  /**
   * Load all user connections from the database
   */
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { connections: userConnections } = await socialConnectionsService.getUserConnections();
      
      // Convert array to object for easier access
      const connectionsMap = {};
      userConnections.forEach(connection => {
        connectionsMap[connection.platform] = connection;
      });
      
      setConnections(connectionsMap);
    } catch (err) {
      console.error('Error loading connections:', err);
      setError('Failed to load social connections');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Connect to a social platform
   */
  const connectPlatform = useCallback(async (platform) => {
    try {
      setConnecting(prev => ({ ...prev, [platform]: true }));
      setError(null);
      
      const { connection } = await socialConnectionsService.initiatePlatformConnection(platform);
      
      // Update connections state
      setConnections(prev => ({
        ...prev,
        [platform]: connection
      }));
      
      return { success: true, connection };
    } catch (err) {
      console.error(`Error connecting to ${platform}:`, err);
      const errorMessage = `Failed to connect to ${platform}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setConnecting(prev => ({ ...prev, [platform]: false }));
    }
  }, []);

  /**
   * Disconnect from a social platform
   */
  const disconnectPlatform = useCallback(async (platform) => {
    try {
      setConnecting(prev => ({ ...prev, [platform]: true }));
      setError(null);
      
      await socialConnectionsService.disconnectPlatform(platform);
      
      // Remove from connections state
      setConnections(prev => {
        const updated = { ...prev };
        delete updated[platform];
        return updated;
      });
      
      return { success: true };
    } catch (err) {
      console.error(`Error disconnecting from ${platform}:`, err);
      const errorMessage = `Failed to disconnect from ${platform}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setConnecting(prev => ({ ...prev, [platform]: false }));
    }
  }, []);

  /**
   * Refresh a platform connection
   */
  const refreshPlatform = useCallback(async (platform) => {
    try {
      setConnecting(prev => ({ ...prev, [platform]: true }));
      setError(null);
      
      const { connection } = await socialConnectionsService.refreshPlatformConnection(platform);
      
      // Update connections state
      setConnections(prev => ({
        ...prev,
        [platform]: connection
      }));
      
      return { success: true, connection };
    } catch (err) {
      console.error(`Error refreshing ${platform} connection:`, err);
      const errorMessage = `Failed to refresh ${platform} connection`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setConnecting(prev => ({ ...prev, [platform]: false }));
    }
  }, []);

  /**
   * Check if a platform is connected
   */
  const isPlatformConnected = useCallback((platform) => {
    return connections[platform]?.is_connected || false;
  }, [connections]);

  /**
   * Get connection for a specific platform
   */
  const getPlatformConnection = useCallback((platform) => {
    return connections[platform] || null;
  }, [connections]);

  /**
   * Get connection status for a platform
   */
  const getPlatformStatus = useCallback((platform) => {
    const connection = connections[platform];
    if (!connection) return 'disconnected';
    return connection.connection_status;
  }, [connections]);

  /**
   * Get all connected platforms
   */
  const getConnectedPlatforms = useCallback(() => {
    return Object.keys(connections).filter(platform => isPlatformConnected(platform));
  }, [connections, isPlatformConnected]);

  /**
   * Get connection count
   */
  const getConnectionCount = useCallback(() => {
    return getConnectedPlatforms().length;
  }, [getConnectedPlatforms]);

  /**
   * Check if a platform is currently connecting/disconnecting
   */
  const isPlatformLoading = useCallback((platform) => {
    return connecting[platform] || false;
  }, [connecting]);

  return {
    // State
    connections,
    loading,
    error,
    connecting,
    
    // Actions
    loadConnections,
    connectPlatform,
    disconnectPlatform,
    refreshPlatform,
    
    // Getters
    isPlatformConnected,
    getPlatformConnection,
    getPlatformStatus,
    getConnectedPlatforms,
    getConnectionCount,
    isPlatformLoading,
    
    // Utils
    clearError: () => setError(null)
  };
};