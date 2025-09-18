import React, { useState } from 'react';
import { 
  CheckCircle, 
  Sparkles, 
  Crown, 
  Zap, 
  Video, 
  Image, 
  FileText,
  Users,
  Download,
  Cloud,
  Shield,
  Headphones,
  Star,
  X,
  Coins,
  CreditCard
} from 'lucide-react';
import './Pricing.css';

const Pricing = ({ user, onUpgrade, onClose }) => {
  const [activeTab, setActiveTab] = useState('subscription');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Great for casual creators who want more flexibility and creative power.',
      price: { monthly: 0, annually: 0 },
      popular: true,
      features: [
        '✨ Generate short AI videos (up to 30 sec)',
        '🎬 Basic AI voiceover support',
        '🔒 Limited access to story templates',
        '🎨 Basic 3D cartoon image generation',
        '❌ No commercial rights'
      ],
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      id: 'starter',
      name: 'Starter Plan',
      description: 'Great for casual creators who want more flexibility and creative power.',
      price: { monthly: 6.99, annually: 5.99 },
      popular: false,
      features: [
        '1500 Credits',
        'Edit story modes & episodic generation',
        'Enable Different Video Style Video Generator',
        'No Watermark',
        'Project autosave & exports'
      ],
      icon: <FileText className="w-6 h-6" />
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      description: 'Powerful tools for professional creators, studios, and indie animators.',
      price: { monthly: 12.99, annually: 10.99 },
      popular: false,
      features: [
        '3000 Credits',
        'Edit story modes & episodic generation',
        'Enable Different Video Style Video Generator',
        'No Watermark',
        'Project autosave & exports'
      ],
      icon: <Crown className="w-6 h-6" />
    }
  ];

  const creditPackages = [
    {
      id: 'credits-500',
      name: '500 Credits',
      description: 'Perfect for getting started with AI content creation',
      price: 9.99,
      credits: 500,
      popular: false
    },
    {
      id: 'credits-1500',
      name: '1,500 Credits',
      description: 'Great value for regular content creators',
      price: 24.99,
      credits: 1500,
      popular: true,
      bonus: '25% bonus credits'
    },
    {
      id: 'credits-5000',
      name: '5,000 Credits',
      description: 'Best for agencies and heavy users',
      price: 79.99,
      credits: 5000,
      popular: false,
      bonus: '40% bonus credits'
    }
  ];

  const handlePlanSelect = (planId) => {
    if (planId === 'free') {
      return; // Already on free plan
    }
    
    if (onUpgrade) {
      onUpgrade(planId, billingCycle);
    } else {
      console.log(`Upgrade to ${planId} plan (${billingCycle})`);
    }
  };

  const handleCreditPurchase = (packageId) => {
    if (onUpgrade) {
      onUpgrade(packageId, 'credits');
    } else {
      console.log(`Purchase credits package: ${packageId}`);
    }
  };

  const getCurrentPlan = () => {
    if (user?.subscription?.plan) {
      return user.subscription.plan;
    }
    return 'free';
  };

  const isCurrentPlan = (planId) => {
    return getCurrentPlan() === planId;
  };

  const getCurrentCredits = () => {
    return user?.credits || 500; // Default 500 remaining credits
  };

  return (
    <div className="pricing-page-kravix">
      {/* Header */}
      <div className="pricing-header">
        <h1 className="pricing-title">Pricing</h1>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="pricing-tabs">
        <button
          className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          Subscription
        </button>
        <button
          className={`tab-btn ${activeTab === 'credits' ? 'active' : ''}`}
          onClick={() => setActiveTab('credits')}
        >
          Credits
        </button>
      </div>

      {/* Content Area */}
      <div className="pricing-content">
        {activeTab === 'subscription' ? (
          <div className="subscription-plans">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`kravix-plan-card ${plan.popular ? 'active' : ''} ${isCurrentPlan(plan.id) ? 'current' : ''}`}
              >
                {plan.popular && (
                  <div className="active-badge">
                    Active
                  </div>
                )}
                
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                </div>

                <div className="plan-pricing">
                  <div className="price-display">
                    <span className="currency">$</span>
                    <span className="amount">{plan.price.monthly}</span>
                    {plan.price.monthly > 0 && (
                      <span className="period">/month</span>
                    )}
                  </div>
                  {plan.price.monthly === 0 && (
                    <div className="free-label">Always free</div>
                  )}
                  {plan.price.monthly > 0 && (
                    <div className="billing-info">
                      <div className="billing-toggle-small">
                        <input 
                          type="checkbox" 
                          id={`billing-${plan.id}`}
                          checked={billingCycle === 'annually'}
                          onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
                        />
                        <label htmlFor={`billing-${plan.id}`}>Billed annually</label>
                      </div>
                    </div>
                  )}
                </div>

                <ul className="features-list-kravix">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="feature-item-kravix">
                      <span className="feature-icon">{feature.includes('❌') ? '🚫' : '✓'}</span>
                      <span className="feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`subscribe-btn ${plan.popular ? 'primary' : 'secondary'} ${isCurrentPlan(plan.id) ? 'current' : ''}`}
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isCurrentPlan(plan.id)}
                >
                  {isCurrentPlan(plan.id) ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="credits-packages">
            <div className="credits-header">
              <div className="remaining-credits">
                <Coins className="w-5 h-5" />
                <span>Remaining Credits: {getCurrentCredits()}</span>
              </div>
            </div>
            
            <div className="credits-grid">
              {creditPackages.map((pkg) => (
                <div 
                  key={pkg.id}
                  className={`credit-package-card ${pkg.popular ? 'popular' : ''}`}
                >
                  {pkg.popular && (
                    <div className="popular-badge-credits">
                      Best Value
                    </div>
                  )}
                  
                  <div className="package-header">
                    <h3 className="package-name">{pkg.name}</h3>
                    <p className="package-description">{pkg.description}</p>
                  </div>

                  <div className="package-pricing">
                    <div className="price-display">
                      <span className="currency">$</span>
                      <span className="amount">{pkg.price}</span>
                    </div>
                    {pkg.bonus && (
                      <div className="bonus-badge">
                        {pkg.bonus}
                      </div>
                    )}
                  </div>

                  <div className="credit-info">
                    <div className="credit-amount">
                      <Coins className="w-4 h-4" />
                      <span>{pkg.credits.toLocaleString()} Credits</span>
                    </div>
                  </div>

                  <button 
                    className="buy-credits-btn"
                    onClick={() => handleCreditPurchase(pkg.id)}
                  >
                    <CreditCard className="w-4 h-4" />
                    Add Credits
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;