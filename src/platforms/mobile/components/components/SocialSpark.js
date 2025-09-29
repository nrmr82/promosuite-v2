import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SocialSpark.css';

const SocialSpark = ({ user, onOpenAuth, onToolUsage }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('compose');
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter']);
  const [scheduledPosts, setScheduledPosts] = useState([]);

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1da1f2' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877f2' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: '#e4405f' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0077b5' }
  ];

  const mockAnalytics = {
    followers: '2.5K',
    engagement: '4.2%',
    posts: '156',
    reach: '12.8K'
  };

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePostSubmit = () => {
    if (!postContent.trim()) return;
    
    const newPost = {
      id: Date.now(),
      content: postContent,
      platforms: selectedPlatforms,
      scheduled: new Date().toLocaleString(),
      status: 'scheduled'
    };
    
    setScheduledPosts(prev => [newPost, ...prev]);
    setPostContent('');
    
    if (onToolUsage) {
      onToolUsage();
    }
  };

  const tabs = [
    { id: 'compose', label: 'Compose', icon: '✏️' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ];

  return (
    <div className="socialspark socialspark--mobile">
      <div className="container-mobile">
        {/* Header */}
        <div className="socialspark-header">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              ← Back
            </button>
            <h1 className="page-title">SocialSpark</h1>
          </div>
          <p className="page-subtitle">Manage your social media presence</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="tab-content">
            <section className="compose-section">
              <div className="compose-form">
                <div className="form-group">
                  <label>What's on your mind?</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write your post here..."
                    className="post-textarea"
                    rows="4"
                  />
                  <div className="character-count">
                    {postContent.length}/280
                  </div>
                </div>

                <div className="form-group">
                  <label>Select Platforms</label>
                  <div className="platform-grid">
                    {platforms.map(platform => (
                      <div
                        key={platform.id}
                        className={`platform-option ${
                          selectedPlatforms.includes(platform.id) ? 'platform-option--selected' : ''
                        }`}
                        onClick={() => handlePlatformToggle(platform.id)}
                      >
                        <span className="platform-icon">{platform.icon}</span>
                        <span className="platform-name">{platform.name}</span>
                        {selectedPlatforms.includes(platform.id) && (
                          <span className="platform-check">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="compose-actions">
                  <button className="btn-secondary">
                    📎 Add Media
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handlePostSubmit}
                    disabled={!postContent.trim() || selectedPlatforms.length === 0}
                  >
                    🚀 Post Now
                  </button>
                </div>
              </div>
            </section>

            {/* AI Suggestions */}
            <section className="suggestions-section">
              <h3 className="section-title">AI Suggestions</h3>
              <div className="suggestion-cards">
                <div className="suggestion-card">
                  <div className="suggestion-content">
                    <strong>Trending Hashtags:</strong>
                    <span>#Marketing #SocialMedia #Growth</span>
                  </div>
                </div>
                <div className="suggestion-card">
                  <div className="suggestion-content">
                    <strong>Best Posting Time:</strong>
                    <span>Today at 3:00 PM</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="tab-content">
            <section className="schedule-section">
              <h3 className="section-title">Scheduled Posts</h3>
              
              {scheduledPosts.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📅</span>
                  <h4>No scheduled posts</h4>
                  <p>Create your first post to see it here</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setActiveTab('compose')}
                  >
                    Create Post
                  </button>
                </div>
              ) : (
                <div className="posts-list">
                  {scheduledPosts.map(post => (
                    <div key={post.id} className="post-item">
                      <div className="post-content">
                        <p>{post.content}</p>
                        <div className="post-meta">
                          <span className="post-time">📅 {post.scheduled}</span>
                          <div className="post-platforms">
                            {post.platforms.map(platformId => {
                              const platform = platforms.find(p => p.id === platformId);
                              return (
                                <span key={platformId} className="platform-badge">
                                  {platform?.icon}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="post-actions">
                        <button className="btn-small">Edit</button>
                        <button className="btn-small btn-danger">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
            <section className="analytics-section">
              <h3 className="section-title">Social Media Analytics</h3>
              
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-icon">👥</div>
                  <div className="analytics-value">{mockAnalytics.followers}</div>
                  <div className="analytics-label">Total Followers</div>
                </div>
                
                <div className="analytics-card">
                  <div className="analytics-icon">❤️</div>
                  <div className="analytics-value">{mockAnalytics.engagement}</div>
                  <div className="analytics-label">Engagement Rate</div>
                </div>
                
                <div className="analytics-card">
                  <div className="analytics-icon">📝</div>
                  <div className="analytics-value">{mockAnalytics.posts}</div>
                  <div className="analytics-label">Posts Published</div>
                </div>
                
                <div className="analytics-card">
                  <div className="analytics-icon">👁️</div>
                  <div className="analytics-value">{mockAnalytics.reach}</div>
                  <div className="analytics-label">Total Reach</div>
                </div>
              </div>

              <div className="insights-section">
                <h4>Quick Insights</h4>
                <div className="insight-cards">
                  <div className="insight-card">
                    <div className="insight-icon">📈</div>
                    <div className="insight-content">
                      <strong>Growth Trend</strong>
                      <p>Your engagement is up 15% this week!</p>
                    </div>
                  </div>
                  
                  <div className="insight-card">
                    <div className="insight-icon">⏰</div>
                    <div className="insight-content">
                      <strong>Best Posting Time</strong>
                      <p>Your audience is most active at 3-5 PM</p>
                    </div>
                  </div>
                  
                  <div className="insight-card">
                    <div className="insight-icon">🔥</div>
                    <div className="insight-content">
                      <strong>Top Content</strong>
                      <p>Posts with images get 3x more engagement</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialSpark;