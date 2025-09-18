import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard, Calendar, Zap, Star, Lock } from 'lucide-react';
import subscriptionService from '../services/subscriptionService';

const SubscriptionModal = ({ isOpen, onClose, onSubscribe, trialUsageCount = 0 }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState({});
  const [error, setError] = useState('');
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Fetch subscription plans when modal opens
  useEffect(() => {
    if (isOpen && Object.keys(plans).length === 0) {
      fetchPlans();
    }
  }, [isOpen, plans]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const fetchedPlans = await subscriptionService.getPlans();
      
      // Convert array to object for easier access
      const plansObject = {};
      fetchedPlans.forEach(plan => {
        plansObject[plan.id] = {
          ...plan,
          icon: plan.id === 'yearly' ? <Star className="w-6 h-6" /> : <Calendar className="w-6 h-6" />
        };
      });
      
      setPlans(plansObject);
      
      // Set default selected plan to the popular one or first available
      const popularPlan = fetchedPlans.find(p => p.popular);
      if (popularPlan) {
        setSelectedPlan(popularPlan.id);
      } else if (fetchedPlans.length > 0) {
        setSelectedPlan(fetchedPlans[0].id);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load subscription plans');
      
      // Fallback to default plans
      const fallbackPlans = {
        monthly: {
          id: 'monthly',
          name: 'Monthly Plan',
          price: 9.99,
          period: '/month',
          billing: 'Billed monthly',
          savings: null,
          icon: <Calendar className="w-6 h-6" />
        },
        yearly: {
          id: 'yearly',
          name: 'Annual Plan',
          price: 100,
          period: '/year',
          billing: 'Billed annually',
          savings: 'Save $20/year',
          icon: <Star className="w-6 h-6" />,
          popular: true
        }
      };
      setPlans(fallbackPlans);
      setSelectedPlan('yearly'); // Set default to yearly for fallback
    } finally {
      setLoadingPlans(false);
    }
  };

  const features = [
    'Unlimited access to FlyerPro',
    'Unlimited access to SocialSpark', 
    'Unlimited access to CreatorsCore',
    'All premium templates and assets',
    'Priority customer support',
    'Regular feature updates',
    'Export in all formats',
    'Team collaboration tools',
    'Brand management system',
    'Advanced analytics'
  ];

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, you would collect payment method info first
      // For now, we'll simulate with a mock payment method
      const mockPaymentMethod = 'pm_mock_payment_method';
      
      const subscription = await subscriptionService.createSubscription(
        selectedPlan,
        mockPaymentMethod
      );
      
      onSubscribe(subscription);
      onClose();
    } catch (error) {
      console.error('Subscription error:', error);
      setError(error.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="subscription-modal-overlay" onClick={handleOverlayClick}>
      <div className="subscription-modal">
        <div className="subscription-modal-header">
          <button className="subscription-modal-close" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="subscription-modal-content">
          {/* Header Section */}
          <div className="subscription-header">
            <div className="lock-icon">
              <Lock className="w-12 h-12" />
            </div>
            <h2>Your Free Trial Has Ended</h2>
            <p className="trial-message">
              You've explored {trialUsageCount} tool{trialUsageCount !== 1 ? 's' : ''} in your free trial. 
              Subscribe now to continue creating amazing content!
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="subscription-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Plan Selection */}
          <div className="plan-selection">
            <h3>Choose Your Plan</h3>
            {loadingPlans ? (
              <div className="plans-loading">
                <div className="loading-spinner"></div>
                <span>Loading subscription plans...</span>
              </div>
            ) : (
              <div className="plans-container">
              {Object.values(plans).map((plan) => (
                <div
                  key={plan.id}
                  className={`plan-option ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="popular-badge">
                      <Zap className="w-4 h-4" />
                      <span>Best Value</span>
                    </div>
                  )}
                  
                  <div className="plan-header">
                    <div className="plan-icon">{plan.icon}</div>
                    <h4 className="plan-name">{plan.name}</h4>
                  </div>
                  
                  <div className="plan-pricing">
                    <div className="plan-price">
                      <span className="price">${plan.price || '9.99'}</span>
                      <span className="period">{plan.period || '/month'}</span>
                    </div>
                    <p className="plan-billing">{plan.billing}</p>
                    {plan.savings && (
                      <div className="plan-savings">{plan.savings}</div>
                    )}
                  </div>
                  
                  <div className="plan-selector">
                    <div className={`radio-button ${selectedPlan === plan.id ? 'selected' : ''}`}>
                      {selectedPlan === plan.id && <div className="radio-dot"></div>}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>

          {/* Features List */}
          <div className="features-section">
            <h3>What You Get</h3>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <Check className="feature-check" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription CTA */}
          <div className="subscription-cta">
            <button 
              className="subscribe-btn"
              onClick={handleSubscribe}
              disabled={loading || !selectedPlan || !plans[selectedPlan]}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>
                    {selectedPlan && plans[selectedPlan] 
                      ? `Subscribe for $${plans[selectedPlan].price}${plans[selectedPlan].period}`
                      : 'Subscribe Now'
                    }
                  </span>
                </>
              )}
            </button>
            
            <div className="subscription-benefits">
              <div className="benefit">
                <Check className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="benefit">
                <Check className="w-4 h-4" />
                <span>Secure payment</span>
              </div>
              <div className="benefit">
                <Check className="w-4 h-4" />
                <span>Instant access</span>
              </div>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="guarantee-section">
            <div className="guarantee-badge">
              <span className="guarantee-icon">🛡️</span>
              <div className="guarantee-text">
                <strong>30-Day Money Back Guarantee</strong>
                <p>Not satisfied? Get a full refund within 30 days.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="subscription-modal-footer">
          <p className="footer-text">
            By subscribing, you agree to our{' '}
            <a href="#terms" className="footer-link">Terms of Service</a> and{' '}
            <a href="#privacy" className="footer-link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
