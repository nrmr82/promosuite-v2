import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  BarChart3, 
  Target, 
  Video,
  ArrowRight,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Edit3,
  Check,
  Plus,
  X,
  RefreshCw,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useSocialConnections } from '../hooks/useSocialConnections';
import './SocialSpark.css';

const SocialSpark = ({ onOpenAuth, onToolUsage, user }) => {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const {
    connections,
    loading: connectionsLoading,
    error,
    connectPlatform,
    disconnectPlatform,
    refreshPlatform,
    isPlatformConnected,
    getPlatformConnection,
    isPlatformLoading,
    getConnectionCount,
    clearError
  } = useSocialConnections();

  const platforms = [
    { 
      id: 'instagram',
      name: "Instagram", 
      icon: <Instagram className="w-6 h-6" />, 
      color: "#E4405F",
      description: "Share photos and stories" 
    },
    { 
      id: 'twitter',
      name: "Twitter", 
      icon: <Twitter className="w-6 h-6" />, 
      color: "#1DA1F2",
      description: "Share updates and engage" 
    },
    { 
      id: 'linkedin',
      name: "LinkedIn", 
      icon: <Linkedin className="w-6 h-6" />, 
      color: "#0A66C2",
      description: "Professional networking" 
    },
    { 
      id: 'youtube',
      name: "YouTube", 
      icon: <Youtube className="w-6 h-6" />, 
      color: "#FF0000",
      description: "Video content creation" 
    },
    { 
      id: 'tiktok',
      name: "TikTok", 
      icon: <Video className="w-6 h-6" />, 
      color: "#000000",
      description: "Short-form video content" 
    }
  ];

  // Connection handlers
  const handleConnect = async (platformId) => {
    try {
      await connectPlatform(platformId);
      // Show success message or toast
      console.log(`Successfully connected to ${platformId}`);
    } catch (error) {
      console.error(`Failed to connect to ${platformId}:`, error);
      // Error is already handled by the hook
    }
  };

  const handleDisconnect = async (platformId) => {
    if (window.confirm(`Are you sure you want to disconnect from ${platformId}? This will stop all scheduled posts.`)) {
      try {
        await disconnectPlatform(platformId);
        console.log(`Successfully disconnected from ${platformId}`);
      } catch (error) {
        console.error(`Failed to disconnect from ${platformId}:`, error);
      }
    }
  };

  const handleRefreshConnection = async (platformId) => {
    try {
      await refreshPlatform(platformId);
      console.log(`Successfully refreshed ${platformId} connection`);
    } catch (error) {
      console.error(`Failed to refresh ${platformId} connection:`, error);
    }
  };

  return (
    <div className="socialspark-page compact-page">
      {/* Main Content Section */}
      <section className="main-content-section">
        <div className="container">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-header-content">
              <h1 className="page-title">
                Social Media Marketing Automation
              </h1>
              <p className="page-subtitle">
                Schedule posts, track performance, and engage your audience across all platforms.
                The complete social media solution for real estate professionals.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="tools-grid">
            <div className="tool-card scheduling-card">
              <div className="tool-header">
                <div className="tool-icon">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="tool-title-section">
                  <h3 className="tool-title">Smart Scheduling</h3>
                  <p className="tool-description">
                    Schedule posts with AI-powered optimal timing suggestions
                  </p>
                </div>
              </div>
              <div className="tool-features">
                <div className="feature-item">
                  <span className="feature-icon">🕰️</span>
                  <span>Optimal timing</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📅</span>
                  <span>Batch scheduling</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🤖</span>
                  <span>AI suggestions</span>
                </div>
              </div>
              <button className="tool-cta" onClick={user ? onToolUsage : onOpenAuth}>
                {user ? 'Start Scheduling' : 'Get Started'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="tool-card analytics-card">
              <div className="tool-header">
                <div className="tool-icon">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="tool-title-section">
                  <h3 className="tool-title">Advanced Analytics</h3>
                  <p className="tool-description">
                    Track engagement, reach, and ROI with detailed insights
                  </p>
                </div>
              </div>
              <div className="tool-features">
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>Performance tracking</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💰</span>
                  <span>ROI measurement</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📈</span>
                  <span>Growth insights</span>
                </div>
              </div>
              <button className="tool-cta" onClick={user ? onToolUsage : onOpenAuth}>
                {user ? 'View Analytics' : 'Get Started'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="tool-card content-card">
              <div className="tool-header">
                <div className="tool-icon">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div className="tool-title-section">
                  <h3 className="tool-title">Content Creation</h3>
                  <p className="tool-description">
                    Built-in editor with templates and design tools
                  </p>
                </div>
              </div>
              <div className="tool-features">
                <div className="feature-item">
                  <span className="feature-icon">🎨</span>
                  <span>Design templates</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🖼️</span>
                  <span>Stock photos</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✍️</span>
                  <span>Text editor</span>
                </div>
              </div>
              <button className="tool-cta" onClick={user ? onToolUsage : onOpenAuth}>
                {user ? 'Create Content' : 'Get Started'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Platforms Overview */}
          <div className="platforms-overview">
            <div className="overview-header">
              <div className="overview-title-section">
                <h2 className="overview-title">Connect Your Social Platforms</h2>
                <p className="overview-subtitle">
                  Connect your social media accounts to start scheduling and managing your content.
                  {getConnectionCount() > 0 && (
                    <span className="connection-count"> {getConnectionCount()} of {platforms.length} connected</span>
                  )}
                </p>
              </div>
              {user && (
                <button 
                  className="manage-connections-btn"
                  onClick={() => setShowConnectionModal(true)}
                >
                  Manage Connections
                </button>
              )}
            </div>
            
            <div className="platforms-grid-enhanced">
              {platforms.map((platform) => {
                const isConnected = isPlatformConnected(platform.id);
                const isLoading = isPlatformLoading(platform.id);
                const connection = getPlatformConnection(platform.id);
                
                return (
                  <div 
                    key={platform.id} 
                    className={`platform-card-enhanced ${
                      isConnected ? 'connected' : 'disconnected'
                    } ${isLoading ? 'loading' : ''}`}
                  >
                    <div className="platform-card-header">
                      <div className="platform-icon-enhanced" style={{ color: platform.color }}>
                        {platform.icon}
                      </div>
                      <div className="platform-info">
                        <h3 className="platform-name-enhanced">{platform.name}</h3>
                        <p className="platform-description">{platform.description}</p>
                      </div>
                      <div className="connection-status">
                        {isLoading ? (
                          <Loader className="w-5 h-5 animate-spin text-gray-400" />
                        ) : isConnected ? (
                          <div className="status-connected">
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="status-text">Connected</span>
                          </div>
                        ) : (
                          <div className="status-disconnected">
                            <Plus className="w-5 h-5 text-gray-400" />
                            <span className="status-text">Connect</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isConnected && connection && (
                      <div className="connection-details">
                        <div className="connection-avatar">
                          {connection.avatar_url ? (
                            <img 
                              src={connection.avatar_url} 
                              alt={connection.platform_display_name}
                              className="avatar-image"
                            />
                          ) : (
                            <div className="avatar-placeholder" style={{ background: platform.color }}>
                              {platform.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="connection-info">
                          <div className="connection-name">
                            {connection.platform_display_name || connection.platform_username}
                          </div>
                          <div className="connection-meta">
                            {connection.platform_username && (
                              <span className="username">{connection.platform_username}</span>
                            )}
                            <span className="last-sync">
                              Last sync: {new Date(connection.last_sync_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="platform-card-actions">
                      {user ? (
                        isConnected ? (
                          <div className="connected-actions">
                            <button 
                              className="refresh-btn"
                              onClick={() => handleRefreshConnection(platform.id)}
                              disabled={isLoading}
                              title="Refresh connection"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button 
                              className="disconnect-btn"
                              onClick={() => handleDisconnect(platform.id)}
                              disabled={isLoading}
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="connect-btn"
                            onClick={() => handleConnect(platform.id)}
                            disabled={isLoading}
                            style={{ borderColor: platform.color, color: platform.color }}
                          >
                            {isLoading ? 'Connecting...' : 'Connect'}
                          </button>
                        )
                      ) : (
                        <button 
                          className="auth-required-btn"
                          onClick={onOpenAuth}
                        >
                          Login to Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {error && (
              <div className="connection-error">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span>{error}</span>
                <button onClick={clearError} className="error-dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};
export default SocialSpark;
