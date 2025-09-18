import React, { useState, useEffect } from 'react';
import { X, Cookie, Check } from 'lucide-react';
import './CookiePopup.css';

const CookiePopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieAccepted = localStorage.getItem('cookieAccepted');
    if (!cookieAccepted) {
      // Show popup after a short delay
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieAccepted', 'true');
    setIsAccepted(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleLearnMore = () => {
    // You can implement navigation to full cookie policy page here
    window.open('/cookie-policy.html', '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <div className={`cookie-popup ${isAccepted ? 'accepted' : ''}`}>
      <div className="cookie-popup-content">
        <div className="cookie-popup-header">
          <div className="cookie-icon">
            <Cookie className="w-5 h-5" />
          </div>
          <button 
            className="cookie-close-btn"
            onClick={handleClose}
            aria-label="Close cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="cookie-popup-body">
          <h4 className="cookie-title">We use cookies</h4>
          <p className="cookie-description">
            We use cookies to enhance your browsing experience, analyze site traffic, 
            and provide personalized content. By continuing to use our site, you consent 
            to our use of cookies.
          </p>
        </div>
        
        <div className="cookie-popup-actions">
          <button 
            className="cookie-btn cookie-btn-secondary"
            onClick={handleLearnMore}
          >
            Learn More
          </button>
          <button 
            className="cookie-btn cookie-btn-primary"
            onClick={handleAccept}
          >
            <Check className="w-4 h-4" />
            Accept All Cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookiePopup;
