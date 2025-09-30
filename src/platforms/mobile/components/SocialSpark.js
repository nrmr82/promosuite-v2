import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
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
import { useSocialConnections } from '../../../hooks/useSocialConnections';
import './SocialSpark.css';

const SocialSpark = ({ onOpenAuth, onToolUsage, user }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  
  // Initialize hook and prevent early returns
  const socialConnections = useSocialConnections();
  const {
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
  } = socialConnections || {};

  useEffect(() => {
    // Ensure the hook is properly initialized
    if (!socialConnections) return;
    
    // Initialize connections on mount
    const initializeConnections = async () => {
      try {
        const platforms = ['instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'];
        for (const platform of platforms) {
          if (!isPlatformConnected(platform)) {
            const status = await socialConnections.checkPlatformStatus(platform);
            if (status === 'expired' || status === 'error') {
              await refreshPlatform(platform);
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize social connections:', err);
      }
    };
    
    initializeConnections();
  }, [socialConnections, isPlatformConnected, refreshPlatform]);

  const platforms = [
    { 
      id: 'instagram',
      name: "Instagram", 
      icon: <Instagram className="w-5 h-5" />, 
      color: "#E4405F",
      description: "Share photos and stories" 
    },
    { 
      id: 'twitter',
      name: "Twitter", 
      icon: <Twitter className="w-5 h-5" />, 
      color: "#1DA1F2",
      description: "Share updates and engage" 
    },
    { 
      id: 'linkedin',
      name: "LinkedIn", 
      icon: <Linkedin className="w-5 h-5" />, 
      color: "#0A66C2",
      description: "Professional networking" 
    },
    { 
      id: 'youtube',
      name: "YouTube", 
      icon: <Youtube className="w-5 h-5" />, 
      color: "#FF0000",
      description: "Video content creation" 
    },
    { 
      id: 'tiktok',
      name: "TikTok", 
      icon: <Video className="w-5 h-5" />, 
      color: "#000000",
      description: "Short-form video content" 
    }
  ];

  const templates = [
    { id: 'promo', title: 'Promotional Post', description: 'Promote your product or service' },
    { id: 'tips', title: 'Tips & Advice', description: 'Share valuable insights' },
    { id: 'behind', title: 'Behind the Scenes', description: 'Show your process' },
    { id: 'quote', title: 'Inspirational Quote', description: 'Motivate your audience' },
    { id: 'question', title: 'Engagement Question', description: 'Start a conversation' },
    { id: 'announcement', title: 'News & Updates', description: 'Share important news' }
  ];

  // Connection handlers
  const handleConnect = async (platformId) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    try {
      // Show loading state
      const currentBox = document.querySelector(`[data-platform-id="${platformId}"]`);
      if (currentBox) {
        currentBox.classList.add('loading');
      }

      await connectPlatform(platformId);
      
      // Show success message
      const statusElement = currentBox?.querySelector('.connection-status');
      if (statusElement) {
        statusElement.textContent = 'Connected';
        statusElement.classList.add('status-connected');
      }

      console.log(`Successfully connected to ${platformId}`);
    } catch (error) {
      console.error(`Failed to connect to ${platformId}:`, error);
      // Show error in the UI
      const errorElement = document.querySelector('.connection-error');
      if (errorElement) {
        errorElement.textContent = `Failed to connect to ${platformId}: ${error.message}`;
        errorElement.style.display = 'block';
      }
    } finally {
      // Remove loading state
      const currentBox = document.querySelector(`[data-platform-id="${platformId}"]`);
      if (currentBox) {
        currentBox.classList.remove('loading');
      }
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    onToolUsage('content');
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    
    // TODO: Implement actual AI generation
    alert(`Generated ${platforms.find(p => p.id === selectedPlatform)?.name} content for: "${prompt}"`);
  };

  if (!user) {
    return (
      <div className="mobile-socialspark">
        <div className="mobile-auth-required">
          <div className="mobile-auth-content">
            <div className="mobile-auth-icon">✨</div>
            <h2>Sign In to Use SocialSpark</h2>
            <p>Create AI-powered social media content for all platforms</p>
            <button className="mobile-auth-btn" onClick={onOpenAuth}>
              Sign In to Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-socialspark">
      {/* Header */}
      <div className="mobile-socialspark-header">
        <h1 className="mobile-page-title">
          Social Media Marketing Automation
        </h1>
        <p className="mobile-page-subtitle">
          Schedule posts, track performance, and engage your audience across all platforms.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="mobile-tools-grid">
        <div className="mobile-tool-card">
          <div className="mobile-tool-header">
            <div className="mobile-tool-icon">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="mobile-tool-title-section">
              <h3 className="mobile-tool-title">Smart Scheduling</h3>
              <p className="mobile-tool-description">
                Schedule posts with AI-powered optimal timing
              </p>
            </div>
          </div>
          <div className="mobile-tool-features">
            <div className="mobile-feature-item">
              <span className="mobile-feature-icon">🕰️</span>
              <span>Optimal timing</span>
            </div>
            <div className="mobile-feature-item">
              <span className="mobile-feature-icon">📅</span>
              <span>Batch scheduling</span>
            </div>
          </div>
          <button 
            className="mobile-tool-cta" 
            onClick={() => onToolUsage('scheduling')}
            disabled={connectionsLoading}
          >
            {connectionsLoading ? 'Loading...' : 'Start Scheduling'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mobile-tool-card">
          <div className="mobile-tool-header">
            <div className="mobile-tool-icon">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="mobile-tool-title-section">
              <h3 className="mobile-tool-title">Advanced Analytics</h3>
              <p className="mobile-tool-description">
                Track engagement and ROI with detailed insights
              </p>
            </div>
          </div>
          <div className="mobile-tool-features">
            <div className="mobile-feature-item">
              <span className="mobile-feature-icon">📊</span>
              <span>Performance tracking</span>
            </div>
            <div className="mobile-feature-item">
              <span className="mobile-feature-icon">💰</span>
              <span>ROI measurement</span>
            </div>
          </div>
          <button 
            className="mobile-tool-cta" 
            onClick={() => onToolUsage('analytics')}
            disabled={connectionsLoading}
          >
            {connectionsLoading ? 'Loading...' : 'View Analytics'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mobile-tool-card">
          <div className="mobile-tool-header">
            <div className="mobile-tool-icon">
              <Edit3 className="w-5 h-5" />
            </div>
            <div className="mobile-tool-title-section">
              <h3 className="mobile-tool-title">Content Creation</h3>
              <p className="mobile-tool-description">
                Built-in editor with templates and design tools
              </p>
            </div>
          </div>
          <div className="mobile-tool-features">
            <div className="mobile-feature-item">
              <span className="mobile-feature-icon">🎨</span>
              <span>Design templates</span>
            </div>
            <div className="mobile-feature-item">
              <span className="mobile-feature-icon">🖼️</span>
              <span>Stock photos</span>
            </div>
          </div>
          <button 
            className="mobile-tool-cta" 
            onClick={() => onToolUsage('content')}
            disabled={connectionsLoading}
          >
            {connectionsLoading ? 'Loading...' : 'Create Content'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Platforms Overview */}
      <div className="mobile-platforms-overview">
        <div className="mobile-overview-header">
          <div className="mobile-overview-title-section">
            <h2 className="mobile-overview-title">Connect Your Social Platforms</h2>
            <p className="mobile-overview-subtitle">
              Connect your social media accounts to start scheduling content.
              {getConnectionCount() > 0 && (
                <span className="mobile-connection-count"> {getConnectionCount()} of {platforms.length} connected</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="mobile-platforms-grid">
          {platforms.map((platform) => {
            const isConnected = isPlatformConnected(platform.id);
            const isLoading = isPlatformLoading(platform.id);
            const connection = getPlatformConnection(platform.id);
            
            return (
              <div 
                key={platform.id} 
                data-platform-id={platform.id}
                className={`mobile-platform-card ${
                  isConnected ? 'connected' : 'disconnected'
                } ${isLoading ? 'loading' : ''}`}
              >
                <div className="mobile-platform-card-header">
                  <div className="mobile-platform-icon" style={{ color: platform.color }}>
                    {platform.icon}
                  </div>
                  <div className="mobile-platform-info">
                    <h3 className="mobile-platform-name">{platform.name}</h3>
                    <p className="mobile-platform-description">{platform.description}</p>
                  </div>
                  <div className="mobile-connection-status">
                    {isLoading ? (
                      <Loader className="w-4 h-4 animate-spin text-gray-400" />
                    ) : isConnected ? (
                      <div className="mobile-status-connected">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    ) : (
                      <div className="mobile-status-disconnected">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                
                {isConnected && connection && (
                  <div className="mobile-connection-details">
                    <div className="mobile-connection-avatar">
                      {connection.avatar_url ? (
                        <img 
                          src={connection.avatar_url} 
                          alt={connection.platform_display_name}
                          className="mobile-avatar-image"
                        />
                      ) : (
                        <div className="mobile-avatar-placeholder" style={{ background: platform.color }}>
                          {platform.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="mobile-connection-info">
                      <div className="mobile-connection-name">
                        {connection.platform_display_name || connection.platform_username}
                      </div>
                      <div className="mobile-connection-meta">
                        Last sync: {new Date(connection.last_sync_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mobile-platform-card-actions">
                  {isConnected ? (
                    <div className="mobile-connected-actions">
                      <button 
                        className="mobile-refresh-btn"
                        onClick={() => handleRefreshConnection(platform.id)}
                        disabled={isLoading}
                        title="Refresh connection"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button 
                        className="mobile-disconnect-btn"
                        onClick={() => handleDisconnect(platform.id)}
                        disabled={isLoading}
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="mobile-connect-btn"
                      onClick={() => handleConnect(platform.id)}
                      disabled={isLoading}
                      style={{ borderColor: platform.color, color: platform.color }}
                    >
                      {isLoading ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Connection Error Display */}
        <div className="mobile-connection-error" style={{ display: error ? 'flex' : 'none' }}>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
          <button onClick={clearError} className="mobile-error-dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading State */}
        {connectionsLoading && (
          <div className="mobile-connection-loading">
            <Loader className="w-4 h-4 animate-spin text-gray-400" />
            <span>Connecting to platforms...</span>
          </div>
        )}
      </div>

      {/* Content Creation Section */}
      <section className="mobile-content-creation">
        <h2 className="mobile-section-title">Quick Content Creation</h2>
        
        {/* Platform Selection */}
        <div className="mobile-platform-selection">
          <h3>Choose Platform</h3>
          <div className="mobile-platform-pills">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                className={`mobile-platform-pill ${selectedPlatform === platform.id ? 'active' : ''}`}
                onClick={() => setSelectedPlatform(platform.id)}
                style={{
                  borderColor: selectedPlatform === platform.id ? platform.color : '#444',
                  backgroundColor: selectedPlatform === platform.id ? `${platform.color}20` : 'transparent'
                }}
              >
                {platform.icon}
                <span>{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Input */}
        <div className="mobile-content-input">
          <h3>What do you want to create?</h3>
          <textarea
            className="mobile-prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to post about... e.g., 'Promote my new coffee shop opening next week'"
            rows={3}
          />
          
          <button
            className="mobile-generate-btn"
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
          >
            {generating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate {platforms.find(p => p.id === selectedPlatform)?.name} Post
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick Templates */}
        <div className="mobile-templates">
          <h3>Quick Templates</h3>
          <div className="mobile-templates-grid">
            {templates.slice(0, 4).map((template) => (
              <button
                key={template.id}
                className="mobile-template-card"
                onClick={() => setPrompt(`Create a ${template.title.toLowerCase()}: `)}
              >
                <h4>{template.title}</h4>
                <p>{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SocialSpark;