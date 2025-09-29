import React, { useState, useEffect, useCallback } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import authService from '../../../services/authService';
import { runDatabaseTests, getSupabaseInfo } from '../../../utils/databaseTest';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors = [];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!formData.password || formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (!isLogin && (!formData.name || formData.name.trim().length < 2)) {
      errors.push('Please enter your full name (at least 2 characters)');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }
    
    setLoading(true);
    
    try {
      let userData;
      
      if (isLogin) {
        userData = await authService.login(formData.email.trim(), formData.password);
      } else {
        if (isRegistering || confirmationSent) {
          return;
        }
        
        setIsRegistering(true);
        
        // Check for existing accounts
        try {
          const email = formData.email.trim().toLowerCase();
          const existingUserCheck = await authService.checkUserExists(email);
          
          if (existingUserCheck.exists) {
            const conflictMessage = await authService.getAuthConflictMessage(email);
            throw new Error(conflictMessage);
          }
        } catch (conflictError) {
          if (conflictError.message.includes('already exists')) {
            throw conflictError;
          }
        }
        
        userData = await authService.register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });
        
        if (userData.emailConfirmationRequired) {
          setError('');
          setConfirmationSent(true);
          setError(`📧 Account created! Please check your email (${formData.email}) and click the confirmation link to complete your registration.`);
          return;
        }
      }
      
      if (userData && userData.session) {
        onAuthSuccess(userData);
        onClose();
      } else {
        throw new Error('Login successful but session not available. Please try again.');
      }
    } catch (error) {
      console.error('Email auth error:', error);
      setError(error.message || `${isLogin ? 'Login' : 'Registration'} failed`);
      if (!isLogin) {
        setIsRegistering(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setLoading(true);
    setError('');
    
    try {
      console.log(`Starting ${provider} authentication`);
      
      const result = await authService.socialAuth(provider, {
        redirectTo: window.location.origin
      });
      
      if (result.error) {
        throw result.error;
      }
      
      console.log(`Redirecting to ${provider}...`);
      
    } catch (error) {
      console.error('Social auth error:', error);
      setError(`${provider} authentication failed: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="mobile-auth-modal">
      <div className="mobile-auth-backdrop" onClick={onClose} />
      
      <div className="mobile-auth-container">
        {/* Header */}
        <div className="mobile-auth-header">
          <button 
            className="mobile-auth-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
          <h2 className="mobile-auth-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mobile-auth-subtitle">
            {isLogin ? 'Sign in to your PromoSuite account' : 'Join PromoSuite and start creating'}
          </p>
        </div>

        {/* Content */}
        <div className="mobile-auth-content">
          {error && (
            <div className="mobile-auth-error">
              {error}
            </div>
          )}

          {/* Social Auth */}
          <div className="mobile-auth-social">
            <Button
              variant="secondary"
              size="large"
              fullWidth
              onClick={() => handleSocialAuth('google')}
              disabled={loading}
              className="mobile-social-button google"
            >
              <span className="mobile-auth-google-icon">G</span>
              Continue with Google
            </Button>
            
            <Button
              variant="secondary"
              size="large"
              fullWidth
              onClick={() => handleSocialAuth('linkedin_oidc')}
              disabled={loading}
              className="mobile-social-button linkedin"
            >
              <span className="mobile-auth-linkedin-icon">in</span>
              Continue with LinkedIn
            </Button>
          </div>

          {/* Divider */}
          <div className="mobile-auth-divider">
            <span>or</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mobile-auth-form">
            {!isLogin && (
              <div className="mobile-form-group">
                <label className="mobile-form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="mobile-form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div className="mobile-form-group">
              <label className="mobile-form-label">Email</label>
              <input
                type="email"
                name="email"
                className="mobile-form-input"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mobile-form-group">
              <label className="mobile-form-label">Password</label>
              <input
                type="password"
                name="password"
                className="mobile-form-input"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mobile-auth-toggle">
            <span>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              className="mobile-auth-toggle-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Terms */}
          <div className="mobile-auth-terms">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAuthModal;