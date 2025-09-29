import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ user, onNavigateToTool }) => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleToolNavigation = (toolId) => {
    if (onNavigateToTool) {
      onNavigateToTool(toolId);
    }
  };

  const tools = [
    {
      id: 'flyerpro',
      title: 'FlyerPro',
      description: 'Create stunning professional flyers with AI-powered design tools and templates.',
      icon: '🎨',
      badge: 'New',
      features: ['AI-Powered Design', '500+ Templates', 'Custom Branding'],
      path: '/flyerpro'
    },
    {
      id: 'socialspark',
      title: 'SocialSpark',
      description: 'Manage and schedule your social media content across all platforms.',
      icon: '📱',
      badge: 'New',
      features: ['Multi-Platform Posting', 'Content Scheduler', 'Analytics Dashboard'],
      path: '/socialspark'
    }
  ];

  const collections = [
    {
      id: 'real-estate',
      title: 'Real Estate Flyers',
      description: 'Professional property flyers',
      count: '12 templates',
      icon: '🏠'
    },
    {
      id: 'business',
      title: 'Business Cards',
      description: 'Corporate branding materials',
      count: '8 designs',
      icon: '💼'
    },
    {
      id: 'events',
      title: 'Event Promotions',
      description: 'Eye-catching event flyers',
      count: '15 templates',
      icon: '🎉'
    }
  ];

  return (
    <div className="dashboard dashboard--mobile">
      <div className="container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="welcome-content">
            <div className="welcome-info">
              <h1 className="welcome-title">
                Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="welcome-subtitle">
                Ready to create something amazing? Choose your tool below.
              </p>
            </div>
            <div className="status-badge status-pro">
              <span>✨</span>
              <span>Pro Account</span>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="dashboard-tools">
          <h2 className="section-title">
            <span className="section-icon">🛠️</span>
            Creative Tools
          </h2>
          
          <div className="tools-grid">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={`tool-card tool-card--mobile ${tool.id} ${hoveredCard === tool.id ? 'hovered' : ''}`}
                onClick={() => handleToolNavigation(tool.id)}
                onMouseEnter={() => setHoveredCard(tool.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="tool-content">
                  <div className="tool-header">
                    <div className="tool-icon">{tool.icon}</div>
                    <div className="tool-title-section">
                      <h3 className="tool-title">{tool.title}</h3>
                      {tool.badge && (
                        <span className={`tool-badge tool-badge--${tool.badge.toLowerCase()}`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="tool-description">{tool.description}</p>
                  
                  <ul className="tool-features">
                    {tool.features.map((feature, index) => (
                      <li key={index}>
                        <span className="feature-check">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button className="tool-cta">
                    <span>Get Started</span>
                    <span className="cta-arrow">→</span>
                  </button>
                </div>

                <div className="tool-preview">
                  {tool.id === 'flyerpro' && (
                    <div className="flyer-preview-mini">
                      <div className="mini-flyer">
                        <div className="mini-header">
                          <span className="mini-logo">🏠</span>
                          <span className="mini-agent">Agent</span>
                        </div>
                        <div className="mini-image">🖼️</div>
                        <div className="mini-info">
                          <div className="mini-price">$299,000</div>
                          <div className="mini-address">123 Main St</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {tool.id === 'socialspark' && (
                    <div className="social-preview-mini">
                      <div className="social-header">
                        <h5>Social Dashboard</h5>
                      </div>
                      <div className="social-stats">
                        <div className="stat">
                          <div className="stat-value">2.5k</div>
                          <div className="stat-label">Followers</div>
                        </div>
                        <div className="stat">
                          <div className="stat-value">156</div>
                          <div className="stat-label">Posts</div>
                        </div>
                      </div>
                      <div className="social-platforms">
                        <span className="platform-icon">📘</span>
                        <span className="platform-icon">📷</span>
                        <span className="platform-icon">🐦</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collections Section */}
        <div className="dashboard-collections">
          <div className="collections-content">
            <div className="collections-header">
              <div className="collections-header-left">
                <h2 className="collections-title">
                  <span className="title-icon">🗂️</span>
                  My Collections
                </h2>
                <p className="collections-subtitle">
                  Your saved templates and designs, organized and ready to use.
                </p>
              </div>
              <button className="collections-cta" onClick={() => handleToolNavigation('collections')}>
                <span>View All</span>
                <span>→</span>
              </button>
            </div>
            
            <div className="collections-preview">
              {collections.map((collection) => (
                <div key={collection.id} className="preview-card">
                  <div className="preview-icon">{collection.icon}</div>
                  <div className="preview-content">
                    <h4>{collection.title}</h4>
                    <p>{collection.description}</p>
                    <span className="preview-count">{collection.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;