import React, { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';

import './PricingView.css';

const PricingView = () => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        '2 AI Flyers/month',
        '1 AI Property Reel/month',
        'Basic Video & Flyer Templates',
        'Basic Analytics Dashboard',
        '720p Video Quality',
        'Standard Image Resolution',
        'Watermarked Exports',
        'Community Support'
      ]
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 5.99,
      features: [
        '10 AI Flyers/month',
        '5 AI Property Reels/month',
        'Premium Templates Library',
        '10 Text-to-Video Generations',
        'AI Script & Copy Generator',
        'Property Showcase Effects',
        '1080p Video Quality',
        'HD Image Resolution',
        'Basic Analytics',
        'Automated Posting Schedule',
        'Email Support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29.99,
      popular: true,
      features: [
        '50 AI Flyers/month',
        '15 AI Property Reels/month',
        '30 Text-to-Video Generations',
        'Custom Template Creation',
        'Advanced AI Script & Copy',
        'Viral Content Analytics',
        'Premium Effects Pack',
        '4K Video Quality',
        'Ultra HD Image Resolution',
        'Multi-Platform Publishing',
        'Trend-Based Content AI',
        'Remove Watermark',
        'Priority Support'
      ]
    }
  ];
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await subscriptionService.getCurrentSubscription();
        setCurrentSubscription(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading pricing information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error loading pricing information: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="pricing-view">
      <div className="pricing-header">
        <h1>Choose Your Plan</h1>
        <p className="subtitle">Simple, transparent pricing for everyone</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`pricing-card ${plan.popular ? 'popular' : ''}`}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            
            <div className="pricing-card-header">
              <h2>{plan.name}</h2>
              <div className="price">
                {plan.price === 0 ? (
                  <span className="amount">Free</span>
                ) : (
                  <>
                    <span className="currency">$</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">/mo</span>
                  </>
                )}
              </div>
            </div>

            <ul className="features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <span className="check">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`select-plan-btn ${plan.popular ? 'select-plan-btn--highlight' : ''}`}
              onClick={() => console.log(`Selected ${plan.name} plan`)}
            >
              {plan.price === 0 ? 'Get Started Free' : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingView;
