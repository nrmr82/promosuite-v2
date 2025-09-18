import React from 'react';
import { Button, Card } from './ui';
import './CompactDashboard.css';

const CompactDashboard = ({ user, onNavigateToTool }) => {
  const handleNavigateToTool = (toolId) => {
    if (onNavigateToTool) {
      onNavigateToTool(toolId);
    }
  };

  return (
    <div className="compact-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back{user?.full_name ? `, ${user.full_name}` : ''}!</h1>
        <p className="dashboard-subtitle">Create stunning flyers and manage social media campaigns with AI-powered tools</p>
      </div>

      {/* Main Tools Grid */}
      <div className="tools-grid">
        {/* FlyerPro Tool */}
        <Card variant="glass" hoverable className="tool-card flyerpro-card">
          <div className="tool-header">
            <div className="tool-icon flyerpro-icon">🎨</div>
            <div className="tool-info">
              <h3 className="tool-title">AI Flyer Creator</h3>
              <p className="tool-description">Create stunning flyers with AI-powered design</p>
            </div>
          </div>
          <div className="tool-actions">
            <Button variant="primary" onClick={() => handleNavigateToTool('flyerpro')}>Start Creating</Button>
            <Button variant="secondary" onClick={() => handleNavigateToTool('templates')}>View Templates</Button>
          </div>
        </Card>

        {/* SocialSpark Tool */}
        <Card variant="glass" hoverable className="tool-card socialspark-card">
          <div className="tool-header">
            <div className="tool-icon socialspark-icon">📱</div>
            <div className="tool-info">
              <h3 className="tool-title">Social Media Manager</h3>
              <p className="tool-description">Schedule and manage social media content</p>
            </div>
          </div>
          <div className="tool-actions">
            <Button variant="primary" onClick={() => handleNavigateToTool('socialspark')}>Create Post</Button>
            <Button variant="secondary">View Calendar</Button>
          </div>
        </Card>

        {/* Templates Tool */}
        <Card variant="glass" hoverable className="tool-card templates-card">
          <div className="tool-header">
            <div className="tool-icon templates-icon">📄</div>
            <div className="tool-info">
              <h3 className="tool-title">Template Library</h3>
              <p className="tool-description">Browse professional design templates</p>
            </div>
          </div>
          <div className="tool-actions">
            <Button variant="primary" onClick={() => handleNavigateToTool('templates')}>Browse Templates</Button>
            <Button variant="secondary">My Templates</Button>
          </div>
        </Card>

        {/* Analytics Tool */}
        <Card variant="glass" hoverable className="tool-card analytics-card">
          <div className="tool-header">
            <div className="tool-icon analytics-icon">📊</div>
            <div className="tool-info">
              <h3 className="tool-title">Analytics Dashboard</h3>
              <p className="tool-description">Track performance and engagement</p>
            </div>
          </div>
          <div className="tool-actions">
            <Button variant="primary">View Analytics</Button>
            <Button variant="secondary">Download Report</Button>
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="stats-section">
        <h2 className="section-title">Your Activity</h2>
        <div className="stats-grid">
          <Card variant="stat" className="stat-card">
            <div className="promosuite-card__icon">🎨</div>
            <div className="stat-info">
              <span className="promosuite-card__value">12</span>
              <span className="promosuite-card__label">Flyers Created</span>
            </div>
          </Card>
          <Card variant="stat" className="stat-card">
            <div className="promosuite-card__icon">📱</div>
            <div className="stat-info">
              <span className="promosuite-card__value">24</span>
              <span className="promosuite-card__label">Posts Scheduled</span>
            </div>
          </Card>
          <Card variant="stat" className="stat-card">
            <div className="promosuite-card__icon">👥</div>
            <div className="stat-info">
              <span className="promosuite-card__value">1.2K</span>
              <span className="promosuite-card__label">Total Reach</span>
            </div>
          </Card>
          <Card variant="stat" className="stat-card">
            <div className="promosuite-card__icon">💎</div>
            <div className="stat-info">
              <span className="promosuite-card__value">{user?.credits || 500}</span>
              <span className="promosuite-card__label">Credits Remaining</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompactDashboard;

