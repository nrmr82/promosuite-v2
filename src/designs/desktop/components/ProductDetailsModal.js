import React from 'react';
import Icon from './common/Icon';
import './ProductDetailsModal.css';

const ProductDetailsModal = ({ isOpen, onClose, product, onOpenAuth, user }) => {
  if (!isOpen) return null;

  const productDetails = {
    flyerpro: {
      name: 'FlyerPro',
      tagline: 'Professional flyer design made simple',
      icon: <Icon name="palette" />,
      badge: 'Most Popular',
      badgeClass: 'popular',
      features: [
        { icon: <Icon name="star" />, text: 'AI-Powered Design Generation' },
        { icon: <Icon name="description" />, text: '500+ Professional Templates' },
        { icon: <Icon name="palette" />, text: 'Brand Customization Tools' },
        { icon: <Icon name="upload" />, text: 'High-Resolution Export' }
      ],
      buttonText: user ? 'Use FlyerPro' : 'Start Creating'
    },
    socialspark: {
      name: 'SocialSpark',
      tagline: 'Social media automation for agents',
      icon: <Icon name="videocam" />,
      badge: 'Coming Soon',
      badgeClass: 'new',
      features: [
        { icon: <Icon name="share" />, text: 'AI Content Generation' },
        { icon: <Icon name="devices" />, text: 'Multi-Platform Posting' },
        { icon: <Icon name="calendar_month" />, text: 'Smart Scheduling' },
        { icon: <Icon name="analytics" />, text: 'Performance Analytics' }
      ],
      buttonText: user ? 'Use SocialSpark' : 'Get Early Access'
    }
  };

  const details = productDetails[product];
  if (!details) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="product-modal-backdrop" onClick={handleBackdropClick}>
      <div className="product-modal">
        <button className="product-modal-close" onClick={onClose}>
          <Icon name="close" />
        </button>
        
        <div className="product-modal-header">
          <div className="product-modal-icon-wrapper">
            <div className="product-modal-icon">
              {details.icon}
            </div>
          </div>
          <div className={`product-modal-badge ${details.badgeClass}`}>
            {details.badge}
          </div>
        </div>

        <div className="product-modal-content">
          <h2 className="product-modal-name">{details.name}</h2>
          <p className="product-modal-tagline">{details.tagline}</p>

          <div className="product-modal-features">
            {details.features.map((feature, index) => (
              <div key={index} className="product-feature-row">
                <span className="product-feature-icon">{feature.icon}</span>
                <span className="product-feature-text">{feature.text}</span>
              </div>
            ))}
          </div>

          <button className="product-modal-cta" onClick={onOpenAuth}>
            {details.buttonText}
            <Icon name="arrow_forward" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
