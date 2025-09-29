/**
 * Mobile SocialSpark Component
 * Mobile-optimized social media content generator
 */

import React, { useState } from 'react';
import Button from './Button';
import './SocialSpark.css';

const MobileSocialSpark = ({ user, onOpenAuth, onToolUsage }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: '#1DA1F2' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0077B5' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
    { id: 'youtube', name: 'YouTube', icon: '📹', color: '#FF0000' }
  ];

  const templates = [
    { id: 'promo', title: 'Promotional Post', description: 'Promote your product or service' },
    { id: 'tips', title: 'Tips & Advice', description: 'Share valuable insights' },
    { id: 'behind', title: 'Behind the Scenes', description: 'Show your process' },
    { id: 'quote', title: 'Inspirational Quote', description: 'Motivate your audience' },
    { id: 'question', title: 'Engagement Question', description: 'Start a conversation' },
    { id: 'announcement', title: 'News & Updates', description: 'Share important news' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    onToolUsage();
    
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
            <Button variant="primary" size="large" fullWidth onClick={onOpenAuth}>
              Sign In to Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-socialspark">
      {/* Header */}
      <div className="mobile-socialspark-header">
        <h1>✨ SocialSpark</h1>
        <p>AI-powered social media content generator</p>
      </div>

      {/* Platform Selection */}
      <section className="mobile-platform-section">
        <h2>Choose Platform</h2>
        <div className="mobile-platform-grid">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              className={`mobile-platform-btn ${selectedPlatform === platform.id ? 'active' : ''}`}
              onClick={() => setSelectedPlatform(platform.id)}
              style={{
                borderColor: selectedPlatform === platform.id ? platform.color : 'var(--mobile-border-card)'
              }}
            >
              <span className="mobile-platform-icon">{platform.icon}</span>
              <span className="mobile-platform-name">{platform.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Content Input */}
      <section className="mobile-content-section">
        <h2>What do you want to create?</h2>
        <textarea
          className="mobile-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to post about... e.g., 'Promote my new coffee shop opening next week'"
          rows={4}
        />
        
        <Button
          variant="primary"
          size="large"
          fullWidth
          onClick={handleGenerate}
          loading={generating}
          disabled={!prompt.trim() || generating}
        >
          {generating ? 'Generating...' : `Generate ${platforms.find(p => p.id === selectedPlatform)?.name} Post`}
        </Button>
      </section>

      {/* Quick Templates */}
      <section className="mobile-templates-section">
        <h2>Quick Templates</h2>
        <div className="mobile-templates-grid">
          {templates.map((template) => (
            <button
              key={template.id}
              className="mobile-template-card"
              onClick={() => setPrompt(`Create a ${template.title.toLowerCase()}: `)}
            >
              <h3>{template.title}</h3>
              <p>{template.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mobile-tips-section">
        <h2>💡 Pro Tips</h2>
        <div className="mobile-tips-list">
          <div className="mobile-tip">
            <span className="mobile-tip-icon">🎯</span>
            <span>Be specific about your audience and goals</span>
          </div>
          <div className="mobile-tip">
            <span className="mobile-tip-icon">📝</span>
            <span>Include your brand tone (professional, casual, funny)</span>
          </div>
          <div className="mobile-tip">
            <span className="mobile-tip-icon">🏷️</span>
            <span>Mention if you want hashtags or call-to-actions</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MobileSocialSpark;