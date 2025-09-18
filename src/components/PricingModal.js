import React, { useState } from 'react';
import { X, Check, ArrowRight, Star, Zap, Crown, Building } from 'lucide-react';

const PricingModal = ({ isOpen, onClose, selectedProduct = null }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'

  // All pricing data organized by product
  const pricingData = {
    flyerpro: {
      name: "FlyerPro",
      description: "Professional Real Estate Flyer Design",
      icon: "🎨",
      plans: [
        {
          id: "flyerpro-starter",
          name: "Starter",
          monthlyPrice: 19,
          yearlyPrice: 190,
          description: "Perfect for new agents",
          icon: <Zap className="w-5 h-5" />,
          features: [
            "50 flyer downloads/month",
            "Basic templates access",
            "Standard image library",
            "Email support",
            "Basic customization",
            "PDF & PNG export"
          ],
          popular: false
        },
        {
          id: "flyerpro-professional",
          name: "Professional",
          monthlyPrice: 39,
          yearlyPrice: 390,
          description: "Most popular for active agents",
          icon: <Star className="w-5 h-5" />,
          features: [
            "Unlimited flyer downloads",
            "All premium templates",
            "Premium image library",
            "Priority support",
            "Advanced customization",
            "Brand kit storage",
            "Team collaboration",
            "High-res export"
          ],
          popular: true
        },
        {
          id: "flyerpro-agency",
          name: "Agency",
          monthlyPrice: 99,
          yearlyPrice: 990,
          description: "For teams and brokerages",
          icon: <Building className="w-5 h-5" />,
          features: [
            "Everything in Professional",
            "Unlimited team members",
            "White-label options",
            "Custom templates",
            "API access",
            "Dedicated support",
            "Analytics dashboard",
            "Custom branding"
          ],
          popular: false
        }
      ]
    },
    socialspark: {
      name: "SocialSpark",
      description: "Social Media Marketing Automation",
      icon: "⚡",
      plans: [
        {
          id: "socialspark-starter",
          name: "Starter",
          monthlyPrice: 29,
          yearlyPrice: 290,
          description: "Perfect for individual agents",
          icon: <Zap className="w-5 h-5" />,
          features: [
            "3 social media accounts",
            "30 scheduled posts/month",
            "Basic analytics",
            "Content templates",
            "Email support",
            "Post scheduling"
          ],
          popular: false
        },
        {
          id: "socialspark-professional",
          name: "Professional",
          monthlyPrice: 79,
          yearlyPrice: 790,
          description: "Most popular for growing teams",
          icon: <Star className="w-5 h-5" />,
          features: [
            "10 social media accounts",
            "Unlimited scheduled posts",
            "Advanced analytics & reports",
            "AI content suggestions",
            "Social listening",
            "Priority support",
            "Team collaboration",
            "Hashtag optimization"
          ],
          popular: true
        },
        {
          id: "socialspark-agency",
          name: "Agency",
          monthlyPrice: 199,
          yearlyPrice: 1990,
          description: "For agencies and large teams",
          icon: <Building className="w-5 h-5" />,
          features: [
            "Unlimited accounts",
            "White-label reporting",
            "Custom integrations",
            "Dedicated account manager",
            "Advanced automation",
            "API access",
            "Custom training",
            "Enterprise security"
          ],
          popular: false
        }
      ]
    },
    creatorscore: {
      name: "CreatorsCore",
      description: "Creative Content Management Platform",
      icon: "💡",
      plans: [
        {
          id: "creatorscore-individual",
          name: "Individual",
          monthlyPrice: 49,
          yearlyPrice: 490,
          description: "Perfect for solo creators",
          icon: <Zap className="w-5 h-5" />,
          features: [
            "Unlimited projects",
            "50GB cloud storage",
            "Basic brand management",
            "Standard templates",
            "Email support",
            "Export in all formats",
            "Version history"
          ],
          popular: false
        },
        {
          id: "creatorscore-team",
          name: "Team",
          monthlyPrice: 99,
          yearlyPrice: 990,
          description: "Most popular for growing teams",
          icon: <Star className="w-5 h-5" />,
          features: [
            "Everything in Individual",
            "Unlimited team members",
            "Advanced brand management",
            "Premium templates",
            "Real-time collaboration",
            "Version control",
            "Priority support",
            "Analytics dashboard"
          ],
          popular: true
        },
        {
          id: "creatorscore-enterprise",
          name: "Enterprise",
          monthlyPrice: 299,
          yearlyPrice: 2990,
          description: "For large organizations",
          icon: <Crown className="w-5 h-5" />,
          features: [
            "Everything in Team",
            "Custom integrations",
            "Advanced security",
            "Dedicated support",
            "Custom templates",
            "API access",
            "Training & onboarding",
            "SLA guarantee"
          ],
          popular: false
        }
      ]
    }
  };

  // Bundle pricing for all three products
  const bundleData = {
    name: "PromoSuite Complete",
    description: "All three products in one powerful bundle",
    icon: "🚀",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    savings: billingPeriod === 'yearly' ? 47 : 38, // percentage savings
    features: [
      "Everything from all three products",
      "Unified brand management",
      "Cross-platform content sync",
      "Advanced team collaboration",
      "Priority support across all tools",
      "Bulk export capabilities",
      "Advanced analytics dashboard",
      "Custom integrations"
    ],
    popular: true
  };

  const getPrice = (plan) => {
    return billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getYearlySavings = (plan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  const handlePlanSelection = (productType, planId) => {
    setSelectedPlan({ productType, planId });
  };

  const handleStartTrial = (productType, planId) => {
    // Here you would integrate with your signup/payment system
    console.log(`Starting trial for ${productType} - ${planId}`);
    onClose();
  };

  if (!isOpen) return null;

  // Determine which products to show
  const productsToShow = selectedProduct ? [selectedProduct] : ['flyerpro', 'socialspark', 'creatorscore'];
  const showBundle = !selectedProduct; // Only show bundle when viewing all products

  return (
    <div className="pricing-modal-overlay">
      <div className="pricing-modal">
        <div className="pricing-modal-header">
          <div className="pricing-modal-title">
            <h2>Choose Your Plan</h2>
            <p>Start with a free trial. No credit card required.</p>
          </div>
          <button className="pricing-modal-close" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="billing-toggle">
          <span className={billingPeriod === 'monthly' ? 'active' : ''}>Monthly</span>
          <button 
            className="toggle-switch"
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
          >
            <div className={`toggle-slider ${billingPeriod === 'yearly' ? 'active' : ''}`}></div>
          </button>
          <span className={billingPeriod === 'yearly' ? 'active' : ''}>
            Yearly
            <span className="savings-badge">Save up to 20%</span>
          </span>
        </div>

        <div className="pricing-modal-content">
          {/* Bundle Option (only when viewing all products) */}
          {showBundle && (
            <div className="bundle-section">
              <div className="bundle-header">
                <h3>🎯 Most Popular Choice</h3>
                <p>Get all three products together and save big</p>
              </div>
              
              <div className="bundle-card">
                <div className="bundle-badge">Best Value</div>
                <div className="bundle-icon">{bundleData.icon}</div>
                <h4 className="bundle-name">{bundleData.name}</h4>
                <p className="bundle-description">{bundleData.description}</p>
                
                <div className="bundle-pricing">
                  <div className="bundle-price">
                    <span className="price">
                      ${billingPeriod === 'yearly' ? bundleData.yearlyPrice : bundleData.monthlyPrice}
                    </span>
                    <span className="period">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <div className="bundle-savings">
                      Save ${(bundleData.monthlyPrice * 12) - bundleData.yearlyPrice}/year
                    </div>
                  )}
                </div>

                <ul className="bundle-features">
                  {bundleData.features.map((feature, index) => (
                    <li key={index}>
                      <Check className="w-4 h-4" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className="bundle-cta"
                  onClick={() => handleStartTrial('bundle', 'complete')}
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Individual Product Sections */}
          <div className="products-section">
            {productsToShow.map(productKey => {
              const product = pricingData[productKey];
              return (
                <div key={productKey} className="product-pricing-section">
                  <div className="product-header">
                    <div className="product-info">
                      <span className="product-icon">{product.icon}</span>
                      <div>
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="plans-grid">
                    {product.plans.map(plan => (
                      <div 
                        key={plan.id} 
                        className={`plan-card ${plan.popular ? 'popular' : ''} ${
                          selectedPlan?.planId === plan.id ? 'selected' : ''
                        }`}
                      >
                        {plan.popular && <div className="plan-badge">Most Popular</div>}
                        
                        <div className="plan-header">
                          <div className="plan-icon">{plan.icon}</div>
                          <h4 className="plan-name">{plan.name}</h4>
                          <p className="plan-description">{plan.description}</p>
                          
                          <div className="plan-pricing">
                            <div className="plan-price">
                              <span className="price">${getPrice(plan)}</span>
                              <span className="period">/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
                            </div>
                            {billingPeriod === 'yearly' && (
                              <div className="plan-savings">
                                Save {getYearlySavings(plan)}%
                              </div>
                            )}
                          </div>
                        </div>

                        <ul className="plan-features">
                          {plan.features.map((feature, index) => (
                            <li key={index}>
                              <Check className="w-4 h-4" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button 
                          className={`plan-cta ${plan.popular ? 'primary' : 'secondary'}`}
                          onClick={() => handleStartTrial(productKey, plan.id)}
                        >
                          Start Free Trial
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pricing-modal-footer">
          <div className="footer-features">
            <div className="footer-feature">
              <Check className="w-4 h-4" />
              <span>14-day free trial</span>
            </div>
            <div className="footer-feature">
              <Check className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="footer-feature">
              <Check className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
          <p className="footer-note">
            Questions? <a href="#contact">Contact our sales team</a> for a personalized demo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
