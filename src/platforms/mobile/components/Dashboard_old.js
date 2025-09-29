/**
 * Mobile Dashboard Component
 * Mobile-optimized dashboard with all desktop features
 */

import React from 'react';
import Button from './Button';
import './Dashboard.css';

const MobileDashboard = ({ user, onNavigateToTool }) => {
  const tools = [
    {
      id: 'socialspark',
      title: 'SocialSpark',
      icon: '✨',
      description: 'AI-powered social media content generator',
      features: ['Instagram Posts', 'Twitter Content', 'LinkedIn Posts', 'Facebook Updates'],
      color: '#e91e63'
    },
    {
      id: 'flyerpro',
      title: 'FlyerPro',
      icon: '📄',
      description: 'Professional flyer and poster creator',
      features: ['Event Flyers', 'Business Cards', 'Posters', 'Brochures'],
      color: '#2196f3'
    },
    {
      id: 'collections',
      title: 'Collections',
      icon: '📁',
      description: 'Manage your created content',
      features: ['Save Templates', 'Export Files', 'Share Content', 'Version Control'],
      color: '#4caf50'
    }
  ];

  return (
    <div className="mobile-dashboard">
      {/* Welcome Section */}
      <section className="mobile-welcome">
        <h1 className="mobile-welcome-title">
          Welcome back, {user?.name || user?.email?.split('@')[0] || 'Creator'}!
        </h1>
        <p className="mobile-welcome-subtitle">
          What would you like to create today?
        </p>
      </section>

      {/* Quick Stats */}
      <section className="mobile-stats">
        <div className="mobile-stat-card">
          <div className="mobile-stat-number">12</div>
          <div className="mobile-stat-label">Created</div>
        </div>
        <div className="mobile-stat-card">
          <div className="mobile-stat-number">8</div>
          <div className="mobile-stat-label">Templates</div>
        </div>
        <div className="mobile-stat-card">
          <div className="mobile-stat-number">24</div>
          <div className="mobile-stat-label">Exports</div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="mobile-tools">
        <h2 className="mobile-section-title">Your Tools</h2>
        
        <div className="mobile-tools-grid">
          {tools.map((tool) => (
            <div key={tool.id} className="mobile-tool-card">
              <div className="mobile-tool-header">
                <div 
                  className="mobile-tool-icon"
                  style={{ backgroundColor: `${tool.color}20`, color: tool.color }}
                >
                  {tool.icon}
                </div>
                <div className="mobile-tool-info">
                  <h3 className="mobile-tool-title">{tool.title}</h3>
                  <p className="mobile-tool-description">{tool.description}</p>
                </div>
              </div>

              <div className="mobile-tool-features">
                {tool.features.slice(0, 2).map((feature, index) => (
                  <span key={index} className="mobile-feature-tag">
                    {feature}
                  </span>
                ))}
                {tool.features.length > 2 && (
                  <span className="mobile-feature-more">
                    +{tool.features.length - 2} more
                  </span>
                )}
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={() => onNavigateToTool(tool.id)}
              >
                Open {tool.title}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mobile-recent">
        <h2 className="mobile-section-title">Recent Activity</h2>
        
        <div className="mobile-activity-list">
          <div className="mobile-activity-item">
            <div className="mobile-activity-icon">📄</div>
            <div className="mobile-activity-content">
              <div className="mobile-activity-title">Created event flyer</div>
              <div className="mobile-activity-time">2 hours ago</div>
            </div>
          </div>
          
          <div className="mobile-activity-item">
            <div className="mobile-activity-icon">✨</div>
            <div className="mobile-activity-content">
              <div className="mobile-activity-title">Generated Instagram post</div>
              <div className="mobile-activity-time">5 hours ago</div>
            </div>
          </div>
          
          <div className="mobile-activity-item">
            <div className="mobile-activity-icon">📁</div>
            <div className="mobile-activity-content">
              <div className="mobile-activity-title">Saved to collection</div>
              <div className="mobile-activity-time">1 day ago</div>
            </div>
          </div>
        </div>

        <Button variant="ghost" fullWidth>
          View All Activity
        </Button>
      </section>

      {/* Quick Actions */}
      <section className="mobile-quick-actions">
        <h2 className="mobile-section-title">Quick Actions</h2>
        
        <div className="mobile-actions-grid">
          <button 
            className="mobile-action-button"
            onClick={() => onNavigateToTool('socialspark')}
          >
            <span className="mobile-action-icon">✨</span>
            <span>New Post</span>
          </button>
          
          <button 
            className="mobile-action-button"
            onClick={() => onNavigateToTool('flyerpro')}
          >
            <span className="mobile-action-icon">📄</span>
            <span>New Flyer</span>
          </button>
          
          <button 
            className="mobile-action-button"
            onClick={() => onNavigateToTool('collections')}
          >
            <span className="mobile-action-icon">📁</span>
            <span>My Files</span>
          </button>
          
          <button className="mobile-action-button">
            <span className="mobile-action-icon">🎨</span>
            <span>Templates</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default MobileDashboard;