/**
 * Mobile Landing Page Component
 * Mobile-optimized landing page with desktop theme and all features
 */

import React, { useState } from 'react';
import Button from './Button';
import AuthModal from '../modals/AuthModal';
import './LandingPage.css';

const MobileLandingPage = ({ onAuthSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="mobile-landing">
      {/* Hero Section - Mobile Optimized */}
      <section className="mobile-hero">
        <div className="mobile-hero-content">
          <div className="mobile-hero-badge">
            ✨ AI-Powered Marketing Suite
          </div>
          
          <h1 className="mobile-hero-title">
            Create Stunning
            <span className="mobile-hero-highlight"> Marketing Content </span>
            in Minutes
          </h1>
          
          <p className="mobile-hero-subtitle">
            Generate professional flyers, social media posts, and marketing materials with AI. 
            Perfect for businesses, creators, and marketers.
          </p>
          
          <div className="mobile-hero-buttons">
            <Button 
              variant="primary" 
              size="large" 
              fullWidth
              onClick={() => setShowAuthModal(true)}
            >
              Get Started Free
            </Button>
            
            <Button 
              variant="ghost" 
              size="large" 
              fullWidth
            >
              See Examples
            </Button>
          </div>
        </div>
        
        {/* Mobile Hero Visual */}
        <div className="mobile-hero-visual">
          <div className="mobile-preview-stack">
            <div className="mobile-preview-card mobile-card-1">
              <div className="mobile-card-header">📄 FlyerPro</div>
              <div className="mobile-card-content">AI Flyer Generator</div>
            </div>
            <div className="mobile-preview-card mobile-card-2">
              <div className="mobile-card-header">✨ SocialSpark</div>
              <div className="mobile-card-content">Social Media AI</div>
            </div>
            <div className="mobile-preview-card mobile-card-3">
              <div className="mobile-card-header">🎨 Templates</div>
              <div className="mobile-card-content">Professional Designs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Stacked */}
      <section className="mobile-features">
        <h2 className="mobile-section-title">Everything You Need</h2>
        
        <div className="mobile-features-list">
          <div className="mobile-feature-item">
            <div className="mobile-feature-icon">📄</div>
            <div className="mobile-feature-content">
              <h3>AI Flyer Generator</h3>
              <p>Create professional flyers with AI in seconds</p>
            </div>
          </div>
          
          <div className="mobile-feature-item">
            <div className="mobile-feature-icon">✨</div>
            <div className="mobile-feature-content">
              <h3>Social Media Content</h3>
              <p>Generate engaging posts for all platforms</p>
            </div>
          </div>
          
          <div className="mobile-feature-item">
            <div className="mobile-feature-icon">🎨</div>
            <div className="mobile-feature-content">
              <h3>Professional Templates</h3>
              <p>Choose from hundreds of designer templates</p>
            </div>
          </div>
          
          <div className="mobile-feature-item">
            <div className="mobile-feature-icon">⚡</div>
            <div className="mobile-feature-content">
              <h3>Lightning Fast</h3>
              <p>Generate content in under 30 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mobile-cta">
        <div className="mobile-cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of businesses creating amazing content with AI</p>
          
          <Button 
            variant="primary" 
            size="large" 
            fullWidth
            onClick={() => setShowAuthModal(true)}
          >
            Start Creating Now
          </Button>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(userData) => {
            setShowAuthModal(false);
            onAuthSuccess(userData);
          }}
        />
      )}
    </div>
  );
};

export default MobileLandingPage;