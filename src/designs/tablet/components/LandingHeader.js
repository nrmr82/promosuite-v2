import React, { useState } from 'react';
import { FaRocket, FaPalette, FaVideo } from 'react-icons/fa';
import './LandingHeader.css';

const LandingHeader = ({ onGetStarted }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleMouseEnter = (dropdown) => {
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <header className="landing-header">
      <div className="container">
        <div className="header-content">
          {/* Logo Section */}
          <div className="header-logo">
            <div className="logo-icon">
              <FaRocket />
            </div>
            <div className="logo-text">
              <span className="logo-title">PROMO</span>
              <span className="logo-subtitle">SUITE</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="header-nav">
            <div 
              className="nav-item"
              onMouseEnter={() => handleMouseEnter('flyerpro')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="nav-button">
                <FaPalette className="nav-icon" />
                <span>FlyerPro</span>
              </button>
              {activeDropdown === 'flyerpro' && (
                <div className="nav-dropdown">
                  <div className="dropdown-content">
                    <h4>AI-Powered Flyer Creation</h4>
                    <p>Create stunning property flyers in minutes with AI assistance</p>
                    <div className="dropdown-features">
                      <div className="feature-item">✨ 200+ Templates</div>
                      <div className="feature-item">🎨 Custom Branding</div>
                      <div className="feature-item">📱 Mobile Optimized</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div 
              className="nav-item"
              onMouseEnter={() => handleMouseEnter('socialspark')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="nav-button">
                <FaVideo className="nav-icon" />
                <span>SocialSpark</span>
              </button>
              {activeDropdown === 'socialspark' && (
                <div className="nav-dropdown">
                  <div className="dropdown-content">
                    <h4>Social Media Management</h4>
                    <p>Schedule and manage your social media presence</p>
                    <div className="dropdown-features">
                      <div className="feature-item">📅 Auto Scheduling</div>
                      <div className="feature-item">📊 Analytics Dashboard</div>
                      <div className="feature-item">🎥 Video Content</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Get Started Button */}
          <div className="header-actions">
            <button onClick={onGetStarted} className="get-started-btn">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;