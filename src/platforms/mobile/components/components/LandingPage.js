import React, { useState, useEffect } from 'react';
import AuthModal from '../../../components/AuthModal';
import './LandingPage.css';

const LandingPage = ({ onAuthSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to larger screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAuthClick = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const handleAuthSuccess = (userData) => {
    setShowAuthModal(false);
    if (onAuthSuccess) {
      onAuthSuccess(userData);
    }
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: '🎨',
      title: 'FlyerPro',
      description: 'Create stunning professional flyers with AI-powered design tools and 500+ templates.',
      highlights: ['AI-Powered Design', '500+ Templates', 'Custom Branding', 'Real Estate Focus']
    },
    {
      icon: '📱', 
      title: 'SocialSpark',
      description: 'Manage and schedule your social media content across all major platforms.',
      highlights: ['Multi-Platform Posting', 'Content Scheduler', 'Analytics Dashboard', 'Team Collaboration']
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Real Estate Agent",
      content: "PromoSuite has transformed how I create marketing materials. The AI suggestions are spot-on!"
    },
    {
      name: "Mike Chen", 
      role: "Marketing Director",
      content: "Our social media engagement increased 300% since using SocialSpark. Game changer!"
    }
  ];

  return (
    <div className="landing-page-mobile">
      {/* Mobile Header */}
      <header className="header-mobile">
        <div className="header-content-mobile">
          <div className="logo-mobile">
            <div className="logo-icon-mobile">PS</div>
            <div className="logo-text-mobile">
              <h1 className="logo-title-mobile">PromoSuite</h1>
              <span className="logo-subtitle-mobile">V2</span>
            </div>
          </div>
          
          <button 
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <>
            <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
            <nav className="mobile-menu">
              <div className="mobile-menu-content">
                <button 
                  className="mobile-menu-close"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                >
                  ✕
                </button>
                
                <div className="mobile-menu-items">
                  <button 
                    className="mobile-menu-item"
                    onClick={() => handleAuthClick('login')}
                  >
                    <span className="menu-icon">👤</span>
                    <span>Sign In</span>
                  </button>
                  
                  <button 
                    className="mobile-menu-item"
                    onClick={() => handleAuthClick('signup')}
                  >
                    <span className="menu-icon">🚀</span>
                    <span>Get Started</span>
                  </button>
                  
                  <div className="mobile-menu-divider"></div>
                  
                  <div className="mobile-menu-item">
                    <span className="menu-icon">🎨</span>
                    <span>FlyerPro</span>
                  </div>
                  
                  <div className="mobile-menu-item">
                    <span className="menu-icon">📱</span>
                    <span>SocialSpark</span>
                  </div>
                  
                  <div className="mobile-menu-item">
                    <span className="menu-icon">💎</span>
                    <span>Pricing</span>
                  </div>
                </div>
              </div>
            </nav>
          </>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero-mobile">
        <div className="container-mobile">
          <div className="hero-content-mobile">
            <div className="hero-badge-mobile">
              <span className="badge-icon">✨</span>
              <span>AI-Powered Design Suite</span>
            </div>
            
            <h1 className="hero-title-mobile">
              Create Stunning 
              <span className="title-highlight"> Marketing Materials</span>
              <br />in Minutes
            </h1>
            
            <p className="hero-description-mobile">
              Professional flyers, social media content, and marketing materials 
              powered by AI. Perfect for real estate agents, small businesses, and marketers.
            </p>
            
            <div className="hero-buttons-mobile">
              <button 
                className="cta-primary-mobile"
                onClick={() => handleAuthClick('signup')}
              >
                <span className="cta-text">Start Creating Free</span>
                <span className="cta-arrow">→</span>
              </button>
              
              <button 
                className="cta-secondary-mobile"
                onClick={() => handleAuthClick('login')}
              >
                <span className="cta-icon">👤</span>
                <span>Sign In</span>
              </button>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="hero-visual-mobile">
            <div className="preview-stack-mobile">
              <div className="preview-card-mobile card-1">
                <div className="card-header">
                  <span className="card-logo">🏠</span>
                  <span className="card-type">FLYER</span>
                </div>
                <div className="card-content">
                  <div className="card-image">📸</div>
                  <div className="card-text">
                    <div className="card-title">$299,000</div>
                    <div className="card-subtitle">3BR • 2BA • 1,200 sq ft</div>
                  </div>
                </div>
              </div>
              
              <div className="preview-card-mobile card-2">
                <div className="card-header">
                  <span className="card-logo">📱</span>
                  <span className="card-type">SOCIAL</span>
                </div>
                <div className="card-content">
                  <div className="social-stats">
                    <div className="stat">2.5K</div>
                    <div className="stat">156</div>
                    <div className="stat">89</div>
                  </div>
                  <div className="social-icons">
                    <span>📘</span>
                    <span>📷</span>
                    <span>🐦</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-mobile">
        <div className="container-mobile">
          <div className="section-header-mobile">
            <h2 className="section-title-mobile">Powerful Tools for Modern Marketing</h2>
            <p className="section-subtitle-mobile">
              Everything you need to create professional marketing materials
            </p>
          </div>
          
          <div className="features-grid-mobile">
            {features.map((feature, index) => (
              <div key={index} className="feature-card-mobile">
                <div className="feature-icon-mobile">{feature.icon}</div>
                <div className="feature-content-mobile">
                  <h3 className="feature-title-mobile">{feature.title}</h3>
                  <p className="feature-description-mobile">{feature.description}</p>
                  
                  <ul className="feature-highlights-mobile">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="highlight-item-mobile">
                        <span className="highlight-check">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className="feature-cta-mobile">
                    <span>Try {feature.title}</span>
                    <span className="cta-arrow">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="testimonials-mobile">
        <div className="container-mobile">
          <h2 className="testimonials-title-mobile">Loved by Professionals</h2>
          
          <div className="testimonials-grid-mobile">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card-mobile">
                <div className="testimonial-content-mobile">
                  <div className="quote-icon">💬</div>
                  <p className="testimonial-text-mobile">"{testimonial.content}"</p>
                </div>
                <div className="testimonial-author-mobile">
                  <div className="author-avatar-mobile">
                    {testimonial.name[0]}
                  </div>
                  <div className="author-info-mobile">
                    <div className="author-name-mobile">{testimonial.name}</div>
                    <div className="author-role-mobile">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-mobile">
        <div className="container-mobile">
          <div className="cta-content-mobile">
            <h2 className="cta-title-mobile">Ready to Transform Your Marketing?</h2>
            <p className="cta-description-mobile">
              Join thousands of professionals who create stunning marketing materials with PromoSuite
            </p>
            
            <div className="cta-buttons-mobile">
              <button 
                className="cta-primary-mobile large"
                onClick={() => handleAuthClick('signup')}
              >
                <span>Start Free Trial</span>
                <span className="cta-arrow">🚀</span>
              </button>
            </div>
            
            <p className="cta-disclaimer-mobile">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-mobile">
        <div className="container-mobile">
          <div className="footer-content-mobile">
            <div className="footer-logo-mobile">
              <div className="logo-icon-mobile">PS</div>
              <div className="logo-text-mobile">
                <div className="logo-title-mobile">PromoSuite</div>
                <div className="logo-subtitle-mobile">V2</div>
              </div>
            </div>
            
            <div className="footer-links-mobile">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Support</span>
            </div>
          </div>
          
          <div className="footer-bottom-mobile">
            <p>&copy; 2024 PromoSuite. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onAuthSuccess={handleAuthSuccess}
          onClose={handleAuthClose}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
};

export default LandingPage;