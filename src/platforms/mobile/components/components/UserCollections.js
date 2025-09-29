import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserCollections.css';

const UserCollections = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('flyers');

  // Mock collections data
  const collections = {
    flyers: [
      {
        id: 1,
        title: 'Modern Real Estate',
        description: 'Clean property listings',
        count: 12,
        thumbnail: '🏠',
        category: 'Real Estate',
        lastUsed: '2 days ago'
      },
      {
        id: 2,
        title: 'Business Promotions', 
        description: 'Professional business cards',
        count: 8,
        thumbnail: '💼',
        category: 'Business',
        lastUsed: '1 week ago'
      },
      {
        id: 3,
        title: 'Event Flyers',
        description: 'Party and event designs',
        count: 15,
        thumbnail: '🎉',
        category: 'Events', 
        lastUsed: '3 days ago'
      }
    ],
    social: [
      {
        id: 4,
        title: 'Instagram Posts',
        description: 'Square social media posts',
        count: 24,
        thumbnail: '📷',
        category: 'Social Media',
        lastUsed: '1 day ago'
      },
      {
        id: 5,
        title: 'Facebook Covers',
        description: 'Business page covers',
        count: 6,
        thumbnail: '📘',
        category: 'Social Media',
        lastUsed: '5 days ago'
      }
    ],
    templates: [
      {
        id: 6,
        title: 'Saved Templates',
        description: 'Your favorite templates',
        count: 18,
        thumbnail: '⭐',
        category: 'Templates',
        lastUsed: '1 day ago'
      }
    ]
  };

  const tabs = [
    { id: 'flyers', label: 'Flyers', icon: '🎨', count: collections.flyers.length },
    { id: 'social', label: 'Social', icon: '📱', count: collections.social.length },
    { id: 'templates', label: 'Templates', icon: '📋', count: collections.templates.length }
  ];

  const handleCollectionClick = (collection) => {
    console.log('Opening collection:', collection.title);
    // Navigate to collection details or editor
  };

  const handleCreateNew = () => {
    navigate('/dashboard');
  };

  return (
    <div className="collections collections--mobile">
      <div className="container-mobile">
        {/* Header */}
        <div className="collections-header">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              ← Back
            </button>
            <h1 className="page-title">My Collections</h1>
          </div>
          <p className="page-subtitle">Your saved designs and templates</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-number">
              {collections.flyers.length + collections.social.length + collections.templates.length}
            </div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">3</div>
            <div className="stat-label">Collections</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">47</div>
            <div className="stat-label">Templates</div>
          </div>
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
              <span className="tab-text">{tab.label}</span>
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Collections Grid */}
        <div className="collections-content">
          {collections[activeTab]?.length > 0 ? (
            <div className="collections-grid">
              {collections[activeTab].map(collection => (
                <div
                  key={collection.id}
                  className="collection-card"
                  onClick={() => handleCollectionClick(collection)}
                >
                  <div className="card-thumbnail">
                    <span className="thumbnail-icon">{collection.thumbnail}</span>
                    <div className="item-count">{collection.count}</div>
                  </div>
                  
                  <div className="card-content">
                    <h3 className="card-title">{collection.title}</h3>
                    <p className="card-description">{collection.description}</p>
                    
                    <div className="card-meta">
                      <span className="category">{collection.category}</span>
                      <span className="last-used">Used {collection.lastUsed}</span>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button className="action-btn action-btn--secondary">
                      👁️ View
                    </button>
                    <button className="action-btn action-btn--primary">
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No {activeTab} yet</h3>
              <p>Create your first design to see it here</p>
              <button className="cta-button" onClick={handleCreateNew}>
                <span>+ Create New</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="action-buttons">
            <button className="quick-action-btn" onClick={() => navigate('/flyerpro')}>
              <span className="action-icon">🎨</span>
              <span className="action-text">Create Flyer</span>
            </button>
            
            <button className="quick-action-btn" onClick={() => navigate('/socialspark')}>
              <span className="action-icon">📱</span>
              <span className="action-text">Social Post</span>
            </button>
            
            <button className="quick-action-btn" onClick={() => navigate('/templates')}>
              <span className="action-icon">📋</span>
              <span className="action-text">Browse Templates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCollections;