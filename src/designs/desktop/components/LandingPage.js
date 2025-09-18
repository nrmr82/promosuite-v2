import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import AuthModal from './AuthModal';
import './LandingPage.css';

const LandingPage = ({ onAuthSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFlyerTooltip, setShowFlyerTooltip] = useState(false);
  const [showSocialTooltip, setShowSocialTooltip] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentWindowView, setCurrentWindowView] = useState(0); // 0 = FlyerPro, 1 = SocialSpark
  
  const features = [
    'AI-Powered Flyers',
    'Social Media Posts', 
    'Video Campaigns',
    'Email Marketing',
    'Professional Results'
  ];
  
  const windowViews = [
    {
      name: 'FlyerPro',
      color: '#e91e63',
      title: 'Real Estate Pro',
      subtitle: 'AI-Generated Flyer',
      price: '$850,000',
      address: '123 Luxury Lane',
      details: '4 Beds • 3 Baths • 2,400 sqft'
    },
    {
      name: 'SocialSpark',
      color: '#e91e63',
      title: 'Social Campaign',
      subtitle: 'Multi-Platform Post',
      price: '15 Posts',
      address: 'Instagram • Facebook • LinkedIn',
      details: 'Scheduled • Analytics • Auto-Post'
    }
  ];
  
  // Animation effect for cycling through features
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentFeatureIndex((prevIndex) => 
          prevIndex === features.length - 1 ? 0 : prevIndex + 1
        );
        setIsAnimating(false);
      }, 250); // Half of transition duration
    }, 3000); // Change every 3 seconds
    
    return () => clearInterval(interval);
  }, [features.length]);
  
  // Animation effect for window views
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWindowView((prevView) => 
        prevView === windowViews.length - 1 ? 0 : prevView + 1
      );
    }, 4000); // Change every 4 seconds
    
    return () => clearInterval(interval);
  }, [windowViews.length]);
  
  const handleAuthClick = (e) => {
    console.log('🔥 LandingPage: Button clicked!');
    setShowAuthModal(true);
  };
  
  const handleAuthSuccess = (userData) => {
    console.log('🔥 Auth success:', userData);
    setShowAuthModal(false);
    if (onAuthSuccess) {
      onAuthSuccess(userData);
    }
  };
  return (
    <div style={{ 
      background: '#1a1a1a', 
      color: '#ffffff', 
      minHeight: '100vh', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header exactly like Kravix */}
      <header style={{
        background: '#1a1a1a',
        borderBottom: '1px solid #333',
        padding: '1rem 0',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left side: Logo + Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-1.5rem' }}>
                <svg width="315" height="70" viewBox="0 0 180 40" fill="none" style={{ cursor: 'pointer' }}>
                  <defs>
                    <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e91e63" />
                      <stop offset="100%" stopColor="#d81b60" />
                    </linearGradient>
                  </defs>
                  
                  {/* Circular background - Smaller */}
                  <circle cx="20" cy="20" r="14" stroke="url(#pinkGradient)" strokeWidth="2" fill="none" />
                  
                  {/* House icon - Smaller */}
                  <g transform="translate(12, 12)">
                    {/* House roof */}
                    <path d="M1 10L8 3L15 10H13.5V14H2.5V10H1Z" stroke="url(#pinkGradient)" strokeWidth="1.2" fill="none" />
                    
                    {/* House base */}
                    <rect x="2.5" y="10" width="11" height="4" stroke="url(#pinkGradient)" strokeWidth="1.2" fill="none" />
                    
                    {/* Play button triangle */}
                    <path d="M6 8L10 10L6 12V8Z" fill="url(#pinkGradient)" />
                  </g>
                  
                  {/* PromoSuite Text - Horizontal, Larger */}
                  <text x="42" y="25" fontSize="18" fontWeight="400" fill="rgba(255,255,255,0.9)" letterSpacing="-0.3px">Promo</text>
                  <text x="95" y="25" fontSize="18" fontWeight="600" fill="#e91e63" letterSpacing="-0.3px">Suite</text>
                </svg>
              </div>

              {/* Navigation */}
              <nav style={{ display: 'flex', gap: '2rem', position: 'relative' }}>
              <div 
                onMouseEnter={() => setShowFlyerTooltip(true)}
                onMouseLeave={() => setShowFlyerTooltip(false)}
                style={{
                  color: showFlyerTooltip ? '#ffffff' : '#cccccc',
                  fontSize: '1.1rem',
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'color 0.2s ease',
                  fontWeight: 600
                }}>
                <Icon type="design" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
                FlyerPro
                {showFlyerTooltip && (
                    <div 
                      onMouseEnter={() => setShowFlyerTooltip(true)}
                      onMouseLeave={() => setShowFlyerTooltip(false)}
                      style={{
                      position: 'absolute',
                      top: 'calc(100% + 12px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '20px',
                      background: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '17px',
                      width: '350px',
                      zIndex: 1001,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                    }}>
                    <div style={{ marginBottom: '15px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#e91e63', marginBottom: '8px' }}>FlyerPro</h3>
                      <p style={{ color: '#ccc', lineHeight: '1.4', marginBottom: '15px', fontSize: '16px' }}>
                        Create stunning real estate flyers in seconds with AI-powered design
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon type="check" style={{ width: '15px', height: '15px', color: '#e91e63' }} />
                        <span style={{ fontSize: '16px' }}>200+ Professional Templates</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon type="check" style={{ width: '15px', height: '15px', color: '#e91e63' }} />
                        <span style={{ fontSize: '16px' }}>AI-Powered Auto-Design</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon type="check" style={{ width: '15px', height: '15px', color: '#e91e63' }} />
                        <span style={{ fontSize: '16px' }}>Brand Customization</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon type="check" style={{ width: '15px', height: '15px', color: '#e91e63' }} />
                        <span style={{ fontSize: '16px' }}>HD Export Ready</span>
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '0',
                      height: '0',
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderBottom: '10px solid #2a2a2a'
                    }} />
                  </div>
                )}
              </div>
              <div 
                onMouseEnter={() => setShowSocialTooltip(true)}
                onMouseLeave={() => setShowSocialTooltip(false)}
                style={{
                  color: showSocialTooltip ? '#ffffff' : '#cccccc',
                  fontSize: '1.1rem',
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'color 0.2s ease',
                  fontWeight: 600
                }}>
                <Icon type="video" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
                SocialSpark
                {showSocialTooltip && (
                    <div 
                      onMouseEnter={() => setShowSocialTooltip(true)}
                      onMouseLeave={() => setShowSocialTooltip(false)}
                      style={{
                      position: 'absolute',
                      top: 'calc(100% + 12px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '20px',
                      background: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '17px',
                      width: '375px',
                      zIndex: 1001,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                    }}>
                    <div style={{ marginBottom: '15px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#e91e63', marginBottom: '8px' }}>SocialSpark</h3>
                      <p style={{ color: '#ccc', lineHeight: '1.4', marginBottom: '15px', fontSize: '16px' }}>
                        Complete social media management suite for real estate professionals
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon type="check" style={{ width: '15px', height: '15px', color: '#e91e63' }} />
                        <span style={{ fontSize: '16px' }}>Multi-Platform Scheduling</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon type="check" style={{ width: '15px', height: '15px', color: '#e91e63' }} />
                        <span style={{ fontSize: '16px' }}>Content Calendar</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon type="check" style={{ width: '15px', height: '15px', color: '#e91e63' }} />
                        <span style={{ fontSize: '16px' }}>Analytics Dashboard</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon type="check" style={{ width: '15px', height: '15px', color: '#e91e63' }} />
                        <span style={{ fontSize: '16px' }}>Auto-Posting & Engagement</span>
                      </div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '0',
                      height: '0',
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderBottom: '10px solid #2a2a2a'
                    }} />
                  </div>
                )}
              </div>
            </nav>
            </div>

            {/* Header CTA Button */}
            <button
              onClick={handleAuthClick} 
              onMouseDown={(e) => console.log('Mouse down on button')}
              onMouseUp={(e) => console.log('Mouse up on button')}
              style={{
                background: '#e91e63',
                color: '#ffffff',
                border: 'none',
                padding: '0.7rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                zIndex: 1001
              }}>
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            {/* Hero Content */}
            <div style={{ maxWidth: '600px' }}>
              
              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(2.125rem, 4.25vw, 3.4rem)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
                marginTop: '8rem',
                marginBottom: '1.5rem',
                letterSpacing: '-0.02em'
              }}>
                Create Stunning{' '}
                <span style={{ 
                  color: '#e91e63',
                  display: 'inline-block',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isAnimating ? 'translateY(-10px)' : 'translateY(0)',
                  opacity: isAnimating ? 0 : 1,
                  minHeight: '1.2em',
                  position: 'relative',
                  minWidth: '320px',
                  textAlign: 'left'
                }}>
                  {features[currentFeatureIndex]}
                </span>
              </h1>
              
              {/* Description */}
              <p style={{
                fontSize: '1.1rem',
                color: '#aaaaaa',
                lineHeight: 1.6,
                marginBottom: '2rem',
                maxWidth: '500px'
              }}>
                Transform your real estate marketing with AI-powered design tools. Create professional flyers, 
                social media posts, and email campaigns that drive results.
              </p>
              
              {/* Feature list */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#ffffff' }}>
                  <Icon type="check" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  AI-Powered Design
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#ffffff' }}>
                  <Icon type="check" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  200+ Templates
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#ffffff' }}>
                  <Icon type="check" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  Social Media Ready
                </div>
              </div>
              
              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                <button 
                  onClick={handleAuthClick} 
                  onMouseDown={(e) => console.log('Hero button clicked')}
                  style={{
                    background: '#e91e63',
                    color: '#ffffff',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    zIndex: 10
                  }}>
                  Start Creating Free
                  <Icon type="rocket" style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6rem' }}>
              <div style={{
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                width: 'clamp(350px, 44vw, 500px)', // 10% bigger: 455px -> ~500px
                maxWidth: '500px',
                minWidth: '350px',
                overflow: 'hidden',
                transition: 'all 0.6s ease-in-out',
                transform: 'scale(1)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}>
                {/* Card header */}
                <div style={{
                  background: '#2a2a2a',
                  padding: '1rem 1.3rem',
                  borderBottom: '1px solid #444',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28ca42' }} />
                  </div>
                  <div style={{ 
                    color: '#ffffff', 
                    fontSize: '1rem', 
                    fontWeight: 600,
                    transition: 'all 0.6s ease'
                  }}>
                    PromoSuite - {windowViews[currentWindowView].name}
                  </div>
                </div>
                
                {/* Card content */}
                <div style={{ padding: 'clamp(1.1rem, 3.3vw, 2.15rem)' }}>
                  <div style={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    width: '100%',
                    height: 'clamp(220px, 27vw, 286px)', // 10% bigger: 260px -> 286px
                    marginBottom: 'clamp(0.9rem, 2.2vw, 1.43rem)',
                    overflow: 'hidden',
                    transition: 'all 0.6s ease-in-out'
                  }}>
                    {/* Dynamic header */}
                    <div style={{
                      background: windowViews[currentWindowView].color,
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.6s ease'
                    }}>
                      <Icon 
                        type={currentWindowView === 0 ? 'design' : 'video'} 
                        style={{ width: '18px', height: '18px', color: '#ffffff' }} 
                      />
                      <span style={{ 
                        color: '#ffffff', 
                        fontSize: '1rem', 
                        fontWeight: 600,
                        transition: 'all 0.6s ease'
                      }}>
                        {windowViews[currentWindowView].title}
                      </span>
                    </div>
                    
                    {/* Dynamic image area */}
                    <div style={{
                      background: currentWindowView === 0 ? '#111' : '#0a0a0a',
                      height: 'clamp(66px, 11vw, 114px)', // 10% bigger: 104px -> 114px
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.6s ease',
                      position: 'relative'
                    }}>
                      <Icon 
                        type={currentWindowView === 0 ? 'image' : 'video'} 
                        style={{ 
                          width: '31px', 
                          height: '31px', 
                          color: '#555',
                          transition: 'all 0.6s ease'
                        }} 
                      />
                      {currentWindowView === 1 && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(124, 58, 237, 0.8)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontWeight: 600
                        }}>
                          LIVE
                        </div>
                      )}
                    </div>
                    
                    {/* Dynamic details */}
                    <div style={{ padding: '1rem' }}>
                      <div style={{ 
                        color: '#ffffff', 
                        fontWeight: 700, 
                        fontSize: '1.1rem', 
                        marginBottom: '0.4rem',
                        transition: 'all 0.6s ease'
                      }}>
                        {windowViews[currentWindowView].price}
                      </div>
                      <div style={{ 
                        color: '#ccc', 
                        fontSize: '1rem', 
                        marginBottom: '0.4rem',
                        transition: 'all 0.6s ease'
                      }}>
                        {windowViews[currentWindowView].address}
                      </div>
                      <div style={{ 
                        color: '#888', 
                        fontSize: '0.9rem',
                        transition: 'all 0.6s ease'
                      }}>
                        {windowViews[currentWindowView].details}
                      </div>
                    </div>
                  </div>
                  
                  {/* AI indicator */}
                  <div style={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    transition: 'all 0.6s ease'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: windowViews[currentWindowView].color,
                      borderRadius: '50%',
                      transition: 'background 0.6s ease',
                      animation: 'pulse 2s infinite'
                    }} />
                    {windowViews[currentWindowView].subtitle}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        background: '#1e1e1e',
        padding: '2.4rem 0',
        borderTop: '1px solid #333'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
              Everything You Need to Scale Your Marketing
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#aaa', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Professional tools designed specifically for real estate professionals
            </p>
          </div>
          
          {/* Animated Technology Partners Strip */}
          <div style={{
            height: '80px',
            overflow: 'hidden',
            position: 'relative',
            background: 'linear-gradient(90deg, rgba(233, 30, 99, 0.05), rgba(233, 30, 99, 0.1), rgba(233, 30, 99, 0.05))',
            border: '1px solid rgba(233, 30, 99, 0.1)',
            borderRadius: '12px',
            marginBottom: '1.6rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              animation: 'scroll-horizontal 20s linear infinite'
            }}>
              {/* Technology/Feature Tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', whiteSpace: 'nowrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(233, 30, 99, 0.2)'
                }}>
                  <Icon type="sparkles" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>AI-Powered Design</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(233, 30, 99, 0.2)'
                }}>
                  <Icon type="rocket" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>Lightning Fast</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(233, 30, 99, 0.2)'
                }}>
                  <Icon type="design" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>Professional Templates</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(233, 30, 99, 0.2)'
                }}>
                  <Icon type="video" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>Multi-Platform</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(233, 30, 99, 0.2)'
                }}>
                  <Icon type="check" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>Brand Customization</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(233, 30, 99, 0.2)'
                }}>
                  <Icon type="users" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>Team Collaboration</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(233, 30, 99, 0.2)'
                }}>
                  <Icon type="star" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>HD Export Ready</span>
                </div>
                
                {/* Duplicate set for seamless loop */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(233, 30, 99, 0.2)'
                }}>
                  <Icon type="sparkles" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>AI-Powered Design</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(233, 30, 99, 0.2)'
                }}>
                  <Icon type="rocket" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>Lightning Fast</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(233, 30, 99, 0.2)'
                }}>
                  <Icon type="design" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>Professional Templates</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interactive Feature Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '3rem',
            alignItems: 'center'
          }}>
            {/* Left: Feature Highlights */}
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #2a2a2a, #1e1e1e)',
                border: '1px solid #444',
                borderRadius: '16px',
                padding: '2.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: 'radial-gradient(circle, rgba(233, 30, 99, 0.1), transparent)',
                  borderRadius: '50%'
                }} />
                
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '1.5rem',
                  position: 'relative'
                }}>
                  <Icon type="sparkles" style={{ width: '24px', height: '24px', color: '#e91e63', marginRight: '0.5rem' }} />
                  Powered by AI
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(233, 30, 99, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(233, 30, 99, 0.1)'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#e91e63',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon type="design" style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                    </div>
                    <div>
                      <div style={{ color: '#ffffff', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Smart Design Engine
                      </div>
                      <div style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.4 }}>
                        AI analyzes your content and creates professional designs in seconds
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(233, 30, 99, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(233, 30, 99, 0.1)'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#e91e63',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon type="video" style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                    </div>
                    <div>
                      <div style={{ color: '#ffffff', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Multi-Platform Content
                      </div>
                      <div style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.4 }}>
                        Create once, optimize for Instagram, Facebook, LinkedIn automatically
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(233, 30, 99, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(233, 30, 99, 0.1)'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#e91e63',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon type="rocket" style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                    </div>
                    <div>
                      <div style={{ color: '#ffffff', fontWeight: 600, marginBottom: '0.25rem' }}>
                        Lightning Fast
                      </div>
                      <div style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.4 }}>
                        Generate stunning marketing materials in under 30 seconds
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Testimonial */}
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
                border: '1px solid #444',
                borderRadius: '16px',
                padding: '2.5rem',
                position: 'relative',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #e91e63, #d81b60)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: '#ffffff',
                  fontSize: '2rem',
                  fontWeight: 600
                }}>
                  SR
                </div>
                
                <blockquote style={{
                  fontSize: '1.1rem',
                  color: '#ffffff',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                  fontStyle: 'italic',
                  position: 'relative'
                }}>
                  "PromoSuite transformed my marketing game. I went from spending hours on design to creating
                  professional flyers in minutes. My listings get 3x more engagement now!"
                </blockquote>
                
                <div style={{ color: '#e91e63', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Sarah Rodriguez
                </div>
                <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
                  Top Producer, Keller Williams
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  marginTop: '1rem'
                }}>
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} type="star" style={{ width: '16px', height: '16px', color: '#e91e63' }} />
                  ))}
                </div>
              </div>
              
              <div style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <div style={{
                  background: 'rgba(233, 30, 99, 0.1)',
                  border: '1px solid rgba(233, 30, 99, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  textAlign: 'center',
                  flex: 1
                }}>
                  <div style={{ color: '#e91e63', fontWeight: 700, fontSize: '1.2rem' }}>40%</div>
                  <div style={{ color: '#aaa', fontSize: '0.8rem' }}>More Leads</div>
                </div>
                <div style={{
                  background: 'rgba(233, 30, 99, 0.1)',
                  border: '1px solid rgba(233, 30, 99, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  textAlign: 'center',
                  flex: 1
                }}>
                  <div style={{ color: '#e91e63', fontWeight: 700, fontSize: '1.2rem' }}>75%</div>
                  <div style={{ color: '#aaa', fontSize: '0.8rem' }}>Time Saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: '#1a1a1a',
        padding: '2.4rem 0',
        textAlign: 'center',
        borderTop: '1px solid #333'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
            Ready to supercharge your real estate marketing?
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#aaa',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: 1.6
          }}>
            Join thousands of professionals who are saving time and closing more deals.
          </p>
          <button 
            onClick={handleAuthClick} 
            onMouseDown={(e) => console.log('CTA button clicked')}
            style={{
              background: '#e91e63',
              color: '#ffffff',
              border: 'none',
              padding: '1.2rem 3rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 10
            }}>
            Get Started Now
            <Icon type="rocket" style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1e1e1e',
        borderTop: '1px solid #333',
        padding: '1.6rem 0 0.8rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '1.6rem',
            marginBottom: '0.8rem'
          }}>
            <div style={{ maxWidth: '400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <svg width="120" height="28" viewBox="0 0 120 28" fill="none">
                  <defs>
                    <linearGradient id="footerPinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e91e63" />
                      <stop offset="100%" stopColor="#d81b60" />
                    </linearGradient>
                  </defs>
                  
                  {/* Circular background - Smaller */}
                  <circle cx="14" cy="14" r="9" stroke="url(#footerPinkGradient)" strokeWidth="1.2" fill="none" />
                  
                  {/* House icon - Smaller */}
                  <g transform="translate(8, 8)">
                    {/* House roof */}
                    <path d="M1 7L6 2L11 7H10V10H2V7H1Z" stroke="url(#footerPinkGradient)" strokeWidth="0.8" fill="none" />
                    
                    {/* House base */}
                    <rect x="2" y="7" width="8" height="3" stroke="url(#footerPinkGradient)" strokeWidth="0.8" fill="none" />
                    
                    {/* Play button triangle */}
                    <path d="M4.5 6L7.5 7.5L4.5 9V6Z" fill="url(#footerPinkGradient)" />
                  </g>
                  
                  {/* PromoSuite Text - Horizontal, Larger */}
                  <text x="30" y="17" fontSize="13" fontWeight="400" fill="rgba(255,255,255,0.9)" letterSpacing="-0.2px">Promo</text>
                  <text x="70" y="17" fontSize="13" fontWeight="600" fill="#e91e63" letterSpacing="-0.2px">Suite</text>
                </svg>
              </div>
              <p style={{ color: '#aaa', fontSize: '1rem', lineHeight: 1.6 }}>
                AI-powered marketing for real estate professionals
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem'
            }}>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Product</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#features" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9rem' }}>Features</a>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#pricing" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Company</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#about" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9rem' }}>About</a>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#careers" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9rem' }}>Careers</a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Support</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#help" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9rem' }}>Help Center</a>
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <a href="#api" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.9rem' }}>API</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #333', paddingTop: '0.8rem', textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>© 2024 PromoSuite. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;
