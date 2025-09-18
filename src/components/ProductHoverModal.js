import React from 'react';
import './ProductHoverModal.css';

const products = {
  flyerpro: {
    name: 'FlyerPro',
    tagline: 'Professional flyer creation made simple',
    icon: '🚀',
    badge: 'Popular',
features: [
      { 
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ), 
        text: 'AI-powered design suggestions'
      },
      { 
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        ), 
        text: '1000+ professional templates'
      },
      { 
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12" y2="18"/>
          </svg>
        ), 
        text: 'Mobile-responsive designs'
      },
      { 
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ), 
        text: 'Real-time collaboration'
      }
    ]
  },
  socialspark: {
    name: 'SocialSpark',
    tagline: 'Ignite your social media presence',
    icon: '⚡',
    badge: 'New',
features: [
      { 
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        ), 
        text: 'Analytics dashboard'
      },
      { 
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        ), 
        text: 'Content scheduling'
      },
      { 
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/>
          </svg>
        ), 
        text: 'AI caption generator'
      },
      { 
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 6l-9.5 9.5-5-5L2 17"/>
            <path d="M17 6h6v6"/>
          </svg>
        ), 
        text: 'Engagement insights'
      }
    ]
  }
};

const ProductHoverModal = ({ product, isVisible, position, onClose, onNavigate }) => {
  if (!isVisible || !products[product]) return null;

  const productData = products[product];
  
  const handleModalClick = (e) => {
    e.stopPropagation();
  };
  
  const handleCtaClick = () => {
    if (onNavigate) {
      onNavigate(product);
    }
    onClose();
  };

  return (
    <div className="product-hover-backdrop" onClick={onClose}>
      <div 
        className="product-hover-modal"
        onClick={handleModalClick}
      >
        <button className="product-hover-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        <div className="product-hover-visual">
          <div className="product-hover-icon-wrapper">
            <div className="product-hover-icon">{productData.icon}</div>
            <div className="product-hover-icon-bg"></div>
          </div>
          <span className={`product-hover-badge ${productData.badge.toLowerCase()}`}>
            {productData.badge}
          </span>
        </div>

      <div className="product-hover-content">
        <h3 className="product-hover-name">{productData.name}</h3>
        <p className="product-hover-tagline">{productData.tagline}</p>

        <div className="product-hover-features">
          {productData.features.map((feature, index) => (
            <div key={index} className="product-hover-feature">
              <span className="product-hover-feature-icon">{feature.icon}</span>
              <span className="product-hover-feature-text">{feature.text}</span>
            </div>
          ))}
        </div>

        <button className="product-hover-cta" onClick={handleCtaClick}>
          <span>Get Started with {productData.name}</span>
          <svg 
            width="20" 
            height="20" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 7l5 5m0 0l-5 5m5-5H6" 
            />
          </svg>
        </button>
      </div>
    </div>
    </div>
  );
};

export default ProductHoverModal;
