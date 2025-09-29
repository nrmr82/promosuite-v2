import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';

const Pricing = ({ user, onUpgrade }) => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = {
    monthly: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        description: 'Perfect for getting started',
        features: [
          '5 flyer designs per month',
          '3 social media posts',
          'Basic templates',
          'Standard support',
          'PromoSuite watermark'
        ],
        limitations: [
          'Limited templates',
          'No AI features',
          'Basic export quality'
        ],
        cta: 'Current Plan',
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 19,
        description: 'Best for small businesses',
        features: [
          'Unlimited flyer designs',
          'Unlimited social posts',
          '500+ premium templates',
          'AI-powered design',
          'High-quality exports',
          'Priority support',
          'No watermarks',
          'Brand kit storage'
        ],
        cta: 'Upgrade to Pro',
        popular: true
      },
      {
        id: 'business',
        name: 'Business',
        price: 49,
        description: 'For growing teams',
        features: [
          'Everything in Pro',
          'Team collaboration',
          'Advanced analytics',
          'White-label options',
          'API access',
          'Custom integrations',
          'Dedicated support',
          '24/7 phone support'
        ],
        cta: 'Upgrade to Business',
        popular: false
      }
    ],
    yearly: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        description: 'Perfect for getting started',
        features: [
          '5 flyer designs per month',
          '3 social media posts',
          'Basic templates',
          'Standard support',
          'PromoSuite watermark'
        ],
        limitations: [
          'Limited templates',
          'No AI features',
          'Basic export quality'
        ],
        cta: 'Current Plan',
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 190,
        originalPrice: 228,
        description: 'Best for small businesses',
        features: [
          'Unlimited flyer designs',
          'Unlimited social posts',
          '500+ premium templates',
          'AI-powered design',
          'High-quality exports',
          'Priority support',
          'No watermarks',
          'Brand kit storage'
        ],
        cta: 'Upgrade to Pro',
        popular: true,
        savings: 'Save $38/year'
      },
      {
        id: 'business',
        name: 'Business',
        price: 490,
        originalPrice: 588,
        description: 'For growing teams',
        features: [
          'Everything in Pro',
          'Team collaboration',
          'Advanced analytics',
          'White-label options',
          'API access',
          'Custom integrations',
          'Dedicated support',
          '24/7 phone support'
        ],
        cta: 'Upgrade to Business',
        popular: false,
        savings: 'Save $98/year'
      }
    ]
  };

  const currentPlans = plans[billingCycle];

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    if (onUpgrade) {
      onUpgrade(plan.id, billingCycle);
    }
  };

  const handleBillingToggle = (cycle) => {
    setBillingCycle(cycle);
    setSelectedPlan(null);
  };

  return (
    <div className="pricing pricing--mobile">
      <div className="container-mobile">
        {/* Header */}
        <div className="pricing-header">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              ← Back
            </button>
            <h1 className="page-title">Choose Your Plan</h1>
          </div>
          <p className="page-subtitle">Unlock the full power of PromoSuite</p>
        </div>

        {/* Billing Toggle */}
        <div className="billing-toggle">
          <div className="toggle-container">
            <button
              className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => handleBillingToggle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
              onClick={() => handleBillingToggle('yearly')}
            >
              <span>Yearly</span>
              <span className="savings-badge">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="plans-container">
          {currentPlans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.popular ? 'plan-card--popular' : ''} ${
                selectedPlan?.id === plan.id ? 'plan-card--selected' : ''
              }`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-pricing">
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">/{billingCycle === 'monthly' ? 'mo' : 'year'}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="original-price">
                      <span>${plan.originalPrice}/{billingCycle === 'monthly' ? 'mo' : 'year'}</span>
                    </div>
                  )}
                  {plan.savings && (
                    <div className="savings">{plan.savings}</div>
                  )}
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="plan-features">
                <h4>What's included:</h4>
                <ul className="features-list">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-check">✓</span>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.limitations && (
                  <div className="limitations">
                    <h5>Limitations:</h5>
                    <ul className="limitations-list">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="limitation-item">
                          <span className="limitation-icon">−</span>
                          <span className="limitation-text">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="plan-action">
                <button
                  className={`plan-cta ${
                    plan.id === 'free' ? 'plan-cta--current' : 'plan-cta--upgrade'
                  } ${plan.popular ? 'plan-cta--popular' : ''}`}
                  onClick={() => handlePlanSelect(plan)}
                  disabled={plan.id === 'free'}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="features-comparison">
          <h3 className="comparison-title">Feature Comparison</h3>
          
          <div className="comparison-table">
            <div className="feature-row">
              <div className="feature-name">Flyer Designs</div>
              <div className="feature-values">
                <span className="value-free">5/month</span>
                <span className="value-pro">Unlimited</span>
                <span className="value-business">Unlimited</span>
              </div>
            </div>
            
            <div className="feature-row">
              <div className="feature-name">AI Features</div>
              <div className="feature-values">
                <span className="value-free">✗</span>
                <span className="value-pro">✓</span>
                <span className="value-business">✓</span>
              </div>
            </div>
            
            <div className="feature-row">
              <div className="feature-name">Premium Templates</div>
              <div className="feature-values">
                <span className="value-free">✗</span>
                <span className="value-pro">500+</span>
                <span className="value-business">500+</span>
              </div>
            </div>
            
            <div className="feature-row">
              <div className="feature-name">Team Collaboration</div>
              <div className="feature-values">
                <span className="value-free">✗</span>
                <span className="value-pro">✗</span>
                <span className="value-business">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="pricing-faq">
          <h3 className="faq-title">Frequently Asked Questions</h3>
          
          <div className="faq-item">
            <div className="faq-question">Can I cancel anytime?</div>
            <div className="faq-answer">Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.</div>
          </div>
          
          <div className="faq-item">
            <div className="faq-question">Is there a free trial?</div>
            <div className="faq-answer">Yes! All paid plans come with a 7-day free trial. No credit card required to start.</div>
          </div>
          
          <div className="faq-item">
            <div className="faq-question">What payment methods do you accept?</div>
            <div className="faq-answer">We accept all major credit cards, PayPal, and bank transfers for Business plans.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;