import { useState, useEffect, useCallback, useRef } from 'react';
import socialConnectionsService from '../services/socialConnectionsService';
import errorHandler from '../services/ErrorHandler';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing social platform connections
 */
export const useSocialConnections = () => {
  // State management
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState({});
  const [healthStatus, setHealthStatus] = useState({});
  const [refreshStatus, setRefreshStatus] = useState({});
  
  // Refs for cleanup and debouncing
  const cleanupRef = useRef();
  const healthCheckTimerRef = useRef();
  const batchTimeoutRef = useRef();
  const batchQueueRef = useRef(new Set());
  
  // Event listener refs
  const errorListenerRef = useRef();
  const connectionListenerRef = useRef();
  
  // Constants
  const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const BATCH_DELAY = 1000; // 1 second
  
  /**
   * Set up event listeners
   */
  const setupEventListeners = useCallback(() => {
    // Error listener
    errorListenerRef.current = (error, recovery) => {
      if (error.category === 'token' || error.category === 'authentication') {
        setHealthStatus(prev => ({
          ...prev,
          [error.platform]: { status: 'error', error }
        }));
        
        // Show user notification
        toast.error(`Connection error with ${error.platform}: ${error.message}`);
      }
    };
    errorHandler.addListener(errorListenerRef.current);
    
    // Connection update listener
    connectionListenerRef.current = (event) => {
      const { type, data } = event.detail;
      if (type === 'health_update') {
        setHealthStatus(prev => ({
          ...prev,
          [data.platform]: data
        }));
      } else if (type === 'refresh_status') {
        setRefreshStatus(prev => ({
          ...prev,
          [data.platform]: data
        }));
      }
    };
    window.addEventListener('social_connection_update', connectionListenerRef.current);
    
    return () => {
      if (errorListenerRef.current) {
        errorHandler.removeListener(errorListenerRef.current);
      }
      if (connectionListenerRef.current) {
        window.removeEventListener('social_connection_update', connectionListenerRef.current);
      }
    };
  }, []);
  
  /**
   * Set up health checks
   */
  const setupHealthChecks = useCallback(() => {
    const checkHealth = async () => {
      const platforms = Object.keys(connections);
      for (const platform of platforms) {
        try {
          const isHealthy = await socialConnectionsService.checkConnectionHealth(platform);
          setHealthStatus(prev => ({
            ...prev,
            [platform]: {
              status: isHealthy ? 'healthy' : 'unhealthy',
              lastCheck: new Date()
            }
          }));
        } catch (error) {
          console.error(`Health check failed for ${platform}:`, error);
        }
      }
    };
    
    // Initial check
    checkHealth();
    
    // Set up interval
    healthCheckTimerRef.current = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
    
    return () => {
      if (healthCheckTimerRef.current) {
        clearInterval(healthCheckTimerRef.current);
      }
    };
  }, [connections, HEALTH_CHECK_INTERVAL]);
  
  /**
   * Batch connection operations
   */
  const batchOperation = useCallback(async (operation, platforms) => {
    const results = {
      success: [],
      failed: []
    };
    
    for (const platform of platforms) {
      try {
        await operation(platform);
        results.success.push(platform);
      } catch (error) {
        results.failed.push({ platform, error });
      }
    }
    
    return results;
  }, []);
  
  /**
   * Batch connection operations
   */
  const batchConnect = useCallback(async (platforms) => {
    const results = await batchOperation(connectPlatform, platforms);
    if (results.failed.length > 0) {
      toast.error(`Failed to connect to ${results.failed.map(f => f.platform).join(', ')}`);
    }
    if (results.success.length > 0) {
      toast.success(`Successfully connected to ${results.success.join(', ')}`);
    }
  }, [batchOperation, connectPlatform]);

  const batchDisconnect = useCallback(async (platforms) => {
    const results = await batchOperation(disconnectPlatform, platforms);
    if (results.failed.length > 0) {
      toast.error(`Failed to disconnect from ${results.failed.map(f => f.platform).join(', ')}`);
    }
    if (results.success.length > 0) {
      toast.success(`Successfully disconnected from ${results.success.join(', ')}`);
    }
  }, [batchOperation, disconnectPlatform]);

  const batchRefresh = useCallback(async (platforms) => {
    const results = await batchOperation(refreshPlatform, platforms);
    if (results.failed.length > 0) {
      toast.error(`Failed to refresh ${results.failed.map(f => f.platform).join(', ')}`);
    }
    if (results.success.length > 0) {
      toast.success(`Successfully refreshed ${results.success.join(', ')}`);
    }
  }, [batchOperation, refreshPlatform]);

  /**
   * Queue platform for batch operation
   */
  const queueForBatch = useCallback((platform, operation) => {
    batchQueueRef.current.add({ platform, operation });
    
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    batchTimeoutRef.current = setTimeout(() => {
      const queue = Array.from(batchQueueRef.current);
      batchQueueRef.current.clear();
      
      const platformsByOperation = queue.reduce((acc, { platform, operation }) => {
        if (!acc[operation]) acc[operation] = [];
        acc[operation].push(platform);
        return acc;
      }, {});
      
      Object.entries(platformsByOperation).forEach(([operation, platforms]) => {
        switch (operation) {
          case 'connect':
            batchConnect(platforms);
            break;
          case 'disconnect':
            batchDisconnect(platforms);
            break;
          case 'refresh':
            batchRefresh(platforms);
            break;
          default:
            console.warn(`Unknown batch operation: ${operation}`);
        }
      });
    }, BATCH_DELAY);
  }, [batchConnect, batchDisconnect, batchRefresh]);
  
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

  // Cleanup function
  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    if (healthCheckTimerRef.current) {
      clearInterval(healthCheckTimerRef.current);
    }
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
  }, []);

  // Load all connections on mount
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

  // Set up event listeners and health checks
  useEffect(() => {
    // Load connections
    loadConnections();
    
    // Set up cleanup function
    cleanupRef.current = setupEventListeners();
    
    // Start health checks
    const healthCheckCleanup = setupHealthChecks();
    
    // Cleanup
    return () => {
      cleanup();
      healthCheckCleanup();
    };
  }, [loadConnections, setupEventListeners, setupHealthChecks, cleanup]);



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
    healthStatus,
    refreshStatus,
    
    // Actions
    loadConnections,
    connectPlatform,
    disconnectPlatform,
    refreshPlatform,
    queueForBatch,
    batchConnect,
    batchDisconnect,
    batchRefresh,
    
    // Getters
    isPlatformConnected,
    getPlatformConnection,
    getPlatformStatus,
    getConnectedPlatforms,
    getConnectionCount,
    isPlatformLoading,
    
    // Health monitoring
    checkHealth: setupHealthChecks,
    getHealthStatus: platform => healthStatus[platform] || { status: 'unknown' },
    isHealthy: platform => healthStatus[platform]?.status === 'healthy',
    
    // Refresh status
    getRefreshStatus: platform => refreshStatus[platform],
    isRefreshing: platform => refreshStatus[platform]?.status === 'refreshing',
    
    // Utils
    clearError: () => setError(null)
  };
};