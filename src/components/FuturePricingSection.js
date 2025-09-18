// 🚧 FUTURE: AI-Powered Content Generation Pricing Section
import React from 'react';
import { FaVideo, FaImage, FaStar, FaUsers, FaCheck, FaRocket, FaCrown } from 'react-icons/fa';
import { aiPricingPlans, aiPricingMetadata } from '../data/aiPricingData';
import './FuturePricingSection.css';

const FuturePricingSection = ({ onJoinWaitlist }) => {
  const handleJoinWaitlist = (planId) => {
    if (onJoinWaitlist) {
      onJoinWaitlist(planId);
    } else {
      // Fallback: Open mailto
      const subject = encodeURIComponent('AI Content Generation - Early Access Request');
      const body = encodeURIComponent(`Hi PromoSuite team,

I'm interested in joining the waitlist for the AI-powered content generation feature (${planId} plan).

Please keep me updated on the launch!

Thank you.`);
      window.location.href = `mailto:hello@promosuite.com?subject=${subject}&body=${body}`;
    }
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'free':
        return <FaRocket className="plan-icon-svg" />;
      case 'starter':
        return <FaVideo className="plan-icon-svg" />;
      case 'pro':
        return <FaStar className="plan-icon-svg" />;
      case 'creator-plus':
        return <FaUsers className="plan-icon-svg" />;
      case 'agency':
        return <FaCrown className="plan-icon-svg" />;
      default:
        return <FaRocket className="plan-icon-svg" />;
    }
  };

  const formatNumber = (num) => {
    if (num >= 10000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`.replace('.0K', 'K');
    }
    return num.toString();
  };

  return (
    <section className="future-pricing-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="coming-soon-badge">
            <FaRocket />
            <span>{aiPricingMetadata.comingSoonBadge}</span>
          </div>
          
          <h2 className="section-title">
            {aiPricingMetadata.sectionTitle}
            <span className="gradient-text"> Plans</span>
          </h2>
          
          <p className="section-subtitle">
            {aiPricingMetadata.sectionSubtitle}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="future-pricing-grid">
          {aiPricingPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`future-pricing-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <FaStar />
                  <span>Most Popular</span>
                </div>
              )}

              {/* Plan Header */}
              <div className="plan-header">
                <div className="plan-icon">
                  {getPlanIcon(plan.id)}
                </div>
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-pricing">
                  <div className="price-display">
                    <span className="currency">$</span>
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                  <p className="billing-info">{plan.billing}</p>
                </div>
              </div>

              {/* AI Capabilities Highlight */}
              <div className="ai-capabilities">
                <div className="capability-item">
                  <FaVideo className="capability-icon" />
                  <span className="capability-text">
                    <strong>{formatNumber(plan.aiReels)}</strong> AI Reels
                  </span>
                </div>
                <div className="capability-item">
                  <FaImage className="capability-icon" />
                  <span className="capability-text">
                    <strong>{formatNumber(plan.aiImages)}</strong> AI Images
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="plan-features">
                <ul>
                  {plan.features.slice(0, 5).map((feature, index) => (
                    <li key={index}>
                      <FaCheck className="feature-check" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="feature-more">
                      <span>+ {plan.features.length - 5} more features</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* CTA Button */}
              <button 
                className={`plan-cta ${plan.popular ? 'primary' : 'secondary'}`}
                onClick={() => handleJoinWaitlist(plan.id)}
              >
                <span>{aiPricingMetadata.waitlistCta}</span>
              </button>

              {/* Coming Soon Overlay */}
              <div className="coming-soon-overlay">
                <div className="overlay-content">
                  <FaRocket className="overlay-icon" />
                  <span className="overlay-text">Coming Soon</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Replicate Attribution */}
        <div className="replicate-attribution">
          <div className="attribution-content">
            <span className="attribution-icon">🤖</span>
            <span className="attribution-text">{aiPricingMetadata.replicateNote}</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="section-bottom-cta">
          <h3>Ready to revolutionize your content creation?</h3>
          <p>Join thousands of creators already on our waitlist for early access to AI-powered content generation.</p>
          <button 
            className="bottom-cta-btn"
            onClick={() => handleJoinWaitlist('general')}
          >
            <FaRocket />
            <span>Join the Waitlist</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FuturePricingSection;
