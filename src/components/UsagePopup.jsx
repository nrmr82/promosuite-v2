import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, Calendar, Zap, Image, Video, FileText, Users } from 'lucide-react';
import subscriptionService from '../services/subscriptionService';
import './UsagePopup.css';

const UsagePopup = ({ isOpen, onClose, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && !usage) {
      fetchUsageData();
    }
  }, [isOpen, usage]);

  const fetchUsageData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await subscriptionService.getUsageBreakdown();
      setUsage(response.usage);
    } catch (err) {
      console.error('Usage fetch error:', err);
      setError(err.message || 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (used, limit) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'var(--danger-color, #ef4444)';
    if (percentage >= 75) return 'var(--warning-color, #f59e0b)';
    return 'var(--primary-pink)';
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="usage-popup-overlay" onClick={handleOverlayClick}>
      <div className="usage-popup">
        <div className="usage-popup-header">
          <div className="usage-popup-title">
            <BarChart3 className="title-icon" />
            <h2>Usage Overview</h2>
          </div>
          <button className="usage-popup-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="usage-popup-content">
          {loading && (
            <div className="usage-loading">
              <div className="loading-spinner"></div>
              <p>Loading your usage data...</p>
            </div>
          )}

          {error && (
            <div className="usage-error">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h3>Unable to load usage data</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchUsageData}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {usage && !loading && !error && (
            <>
              {/* Plan Info */}
              <div className="usage-plan-info">
                <div className="plan-badge">
                  <Zap size={16} />
                  <span>{usage.subscription.plan}</span>
                </div>
                <div className="plan-status">
                  Status: <span className={`status-${usage.subscription.status}`}>
                    {usage.subscription.status.charAt(0).toUpperCase() + usage.subscription.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Current Month Usage */}
              <div className="usage-section">
                <h3 className="section-title">
                  <Calendar size={18} />
                  This Month's Usage
                </h3>
                
                <div className="usage-metrics">
                  {/* Flyers */}
                  <div className="usage-metric">
                    <div className="metric-header">
                      <div className="metric-info">
                        <FileText size={16} />
                        <span className="metric-name">Flyers Created</span>
                      </div>
                      <div className="metric-value">
                        {usage.current.flyersUsed}
                        {usage.limits.maxFlyersPerMonth && (
                          <span className="metric-limit">/{usage.limits.maxFlyersPerMonth}</span>
                        )}
                      </div>
                    </div>
                    {usage.limits.maxFlyersPerMonth && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${calculatePercentage(usage.current.flyersUsed, usage.limits.maxFlyersPerMonth)}%`,
                            backgroundColor: getProgressColor(calculatePercentage(usage.current.flyersUsed, usage.limits.maxFlyersPerMonth))
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Social Posts */}
                  <div className="usage-metric">
                    <div className="metric-header">
                      <div className="metric-info">
                        <Users size={16} />
                        <span className="metric-name">Social Posts</span>
                      </div>
                      <div className="metric-value">
                        {usage.current.socialPostsUsed}
                        {usage.limits.maxSocialPostsPerMonth && (
                          <span className="metric-limit">/{usage.limits.maxSocialPostsPerMonth}</span>
                        )}
                      </div>
                    </div>
                    {usage.limits.maxSocialPostsPerMonth && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${calculatePercentage(usage.current.socialPostsUsed, usage.limits.maxSocialPostsPerMonth)}%`,
                            backgroundColor: getProgressColor(calculatePercentage(usage.current.socialPostsUsed, usage.limits.maxSocialPostsPerMonth))
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Storage */}
                  <div className="usage-metric">
                    <div className="metric-header">
                      <div className="metric-info">
                        <Image size={16} />
                        <span className="metric-name">Storage Used</span>
                      </div>
                      <div className="metric-value">
                        {formatBytes(usage.current.storageUsedMB * 1024 * 1024)}
                        {usage.limits.maxStorageGB && (
                          <span className="metric-limit">/{usage.limits.maxStorageGB}GB</span>
                        )}
                      </div>
                    </div>
                    {usage.limits.maxStorageGB && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${calculatePercentage(usage.current.storageUsedMB, usage.limits.maxStorageGB * 1024)}%`,
                            backgroundColor: getProgressColor(calculatePercentage(usage.current.storageUsedMB, usage.limits.maxStorageGB * 1024))
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="usage-section">
                <h3 className="section-title">
                  <TrendingUp size={18} />
                  30-Day Activity Summary
                </h3>
                
                <div className="activity-grid">
                  <div className="activity-item">
                    <div className="activity-icon">
                      <FileText size={20} />
                    </div>
                    <div className="activity-details">
                      <div className="activity-value">{usage.total.flyersCreated}</div>
                      <div className="activity-label">Flyers Created</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon">
                      <Users size={20} />
                    </div>
                    <div className="activity-details">
                      <div className="activity-value">{usage.total.socialPostsCreated}</div>
                      <div className="activity-label">Posts Created</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon">
                      <Video size={20} />
                    </div>
                    <div className="activity-details">
                      <div className="activity-value">{usage.total.socialPostsPublished}</div>
                      <div className="activity-label">Posts Published</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon">
                      <Image size={20} />
                    </div>
                    <div className="activity-details">
                      <div className="activity-value">{usage.total.mediaUploaded}</div>
                      <div className="activity-label">Media Uploaded</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon">
                      <BarChart3 size={20} />
                    </div>
                    <div className="activity-details">
                      <div className="activity-value">{usage.total.templatesUsed}</div>
                      <div className="activity-label">Templates Used</div>
                    </div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-icon">
                      <Calendar size={20} />
                    </div>
                    <div className="activity-details">
                      <div className="activity-value">{formatTime(usage.total.sessionTimeMinutes)}</div>
                      <div className="activity-label">Time Spent</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Notice for Free Users */}
              {usage.subscription.planType === 'free' && (
                <div className="usage-upgrade-notice">
                  <div className="upgrade-content">
                    <h4>Ready to create more?</h4>
                    <p>Upgrade to unlock unlimited flyers, posts, and premium templates.</p>
                    <button 
                      className="upgrade-btn"
                      onClick={() => {
                        onClose();
                        if (onNavigate) {
                          onNavigate('pricing');
                        }
                      }}
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsagePopup;