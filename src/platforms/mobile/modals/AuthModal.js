import React, { useState, useEffect, useCallback } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import authService from '../../../services/authService';
import { runDatabaseTests, getSupabaseInfo } from '../../../utils/databaseTest';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSocialAuth = async (provider) => {
    setLoading(true);
    setError('');
    
    try {
      console.log(`Starting ${provider} authentication`);
      
      // Use simple Supabase OAuth without complex callback handling  
      const result = await authService.socialAuth(provider, {
        redirectTo: window.location.origin
      });
      
      if (result.error) {
        throw result.error;
      }
      
      if (error) {
        throw error;
      }
      
      // Let Supabase handle the redirect
      console.log(`Redirecting to ${provider}...`);
      
    } catch (error) {
      console.error('Social auth error:', error);
      setError(`${provider} authentication failed: ${error.message}`);
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Password validation
    if (!formData.password || formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    // Name validation for registration
    if (!isLogin && (!formData.name || formData.name.trim().length < 2)) {
      errors.push('Please enter your full name (at least 2 characters)');
    }
    
    return errors;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]); // Show first error
      return;
    }
    
    setLoading(true);
    
    try {
      let userData;
      
      if (isLogin) {
        userData = await authService.login(formData.email.trim(), formData.password);
      } else {
        // Prevent duplicate registrations
        if (isRegistering || confirmationSent) {
          console.log('🔍 Registration already in progress or completed');
          return;
        }
        
        setIsRegistering(true);
        
        // FIRST: Check for existing accounts BEFORE attempting registration
        console.log('🔍 Registration Debug - Checking for existing accounts...');
        try {
          const email = formData.email.trim().toLowerCase();
          const existingUserCheck = await authService.checkUserExists(email);
          
          if (existingUserCheck.exists) {
            // User already exists - provide specific error message
            const conflictMessage = await authService.getAuthConflictMessage(email);
            throw new Error(conflictMessage);
          }
        } catch (conflictError) {
          // If it's our conflict message, re-throw it
          if (conflictError.message.includes('already exists')) {
            throw conflictError;
          }
          // Otherwise, continue with registration (the check might have failed)
          console.log('🔍 Registration Debug - User existence check failed, proceeding with registration:', conflictError.message);
        }
        
        // For registration, run database tests first to diagnose issues
        console.log('🔍 Registration Debug - Running pre-registration database tests...');
        const dbTests = await runDatabaseTests();
        const supabaseInfo = getSupabaseInfo();
        
        console.log('🔍 Registration Debug - Supabase info:', supabaseInfo);
        console.log('🔍 Registration Debug - Database test results:', dbTests);
        
        if (dbTests.errors.length > 0) {
          console.warn('🔍 Registration Debug - Database issues detected:', dbTests.errors);
        }
        
        userData = await authService.register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });
        
        // Handle email confirmation required
        if (userData.emailConfirmationRequired) {
          setError('');
          setConfirmationSent(true); // Mark confirmation as sent
          // Show email confirmation message
          setError(`\u2709\ufe0f Account created! Please check your email (${formData.email}) and click the confirmation link to complete your registration.`);
          return; // Don't close modal, let user see the message
        }
      }
      
      // Only proceed if we have a proper user session
      if (userData && userData.session) {
        onAuthSuccess(userData);
        onClose();
      } else {
        throw new Error('Login successful but session not available. Please try again.');
      }
    } catch (error) {
      console.error('Email auth error:', error);
      setError(error.message || `${isLogin ? 'Login' : 'Registration'} failed`);
      // Reset registration state on error
      if (!isLogin) {
        setIsRegistering(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.forgotPassword(formData.email);
      setPasswordResetSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const resetModalState = () => {
    setShowForgotPassword(false);
    setPasswordResetSent(false);
    setIsLogin(true);
    setFormData({ email: '', password: '', name: '' });
    setError('');
    setIsRegistering(false);
    setConfirmationSent(false);
  };

  const handleClose = useCallback(() => {
    resetModalState();
    onClose();
  }, [onClose]);

  const handleOverlayClick = (e) => {
    // Only close if clicking on the overlay itself, not the modal content
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleModalClick = (e) => {
    // Prevent the modal from closing when clicking inside the modal content
    e.stopPropagation();
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal" onClick={handleModalClick}>
        {showForgotPassword ? (
          <div className="forgot-password-section">
            {!passwordResetSent ? (
              <>
                <div className="back-button-container">
                  <button 
                    type="button" 
                    className="back-button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError('');
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
                
                {error && (
                  <div className="auth-error">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
                
                <form onSubmit={handlePasswordReset} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="reset-email">Email Address</label>
                    <div className="input-with-icon">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        id="reset-email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      'Send Reset Instructions'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="reset-success">
                <div className="success-icon">📧</div>
                <p className="success-message">
                  If an account with that email exists, you'll receive password reset instructions within a few minutes.
                </p>
                <button 
                  type="button" 
                  className="auth-submit-btn secondary"
                  onClick={() => {
                    setPasswordResetSent(false);
                    setShowForgotPassword(false);
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <div className="logo-container" style={{ 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '2rem',
                gap: '1rem'
              }}>
                {/* Logo Icon */}
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <defs>
                    <linearGradient id="authPinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e91e63" />
                      <stop offset="100%" stopColor="#d81b60" />
                    </linearGradient>
                  </defs>
                  
                  {/* Circular background */}
                  <circle cx="40" cy="40" r="35" stroke="url(#authPinkGradient)" strokeWidth="3" fill="none" />
                  
                  {/* House icon */}
                  <g transform="translate(25, 25)">
                    {/* House roof */}
                    <path d="M2 20L15 7L28 20H26V28H4V20H2Z" stroke="url(#authPinkGradient)" strokeWidth="2.5" fill="none" />
                    
                    {/* House base */}
                    <rect x="4" y="20" width="22" height="8" stroke="url(#authPinkGradient)" strokeWidth="2.5" fill="none" />
                    
                    {/* Play button triangle */}
                    <path d="M11 17L21 22L11 27V17Z" fill="url(#authPinkGradient)" />
                  </g>
                </svg>
                
                {/* Logo Text */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <span style={{
                      fontSize: '2rem',
                      fontWeight: '400',
                      color: 'rgba(255,255,255,0.9)',
                      letterSpacing: '-0.5px'
                    }}>Promo</span>
                    <span style={{
                      fontSize: '2rem',
                      fontWeight: '600',
                      color: '#e91e63',
                      letterSpacing: '-0.5px'
                    }}>Suite</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '400',
                    color: 'rgba(255,255,255,0.6)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>AI Marketing Platform</span>
                </div>
              </div>
              <h2 style={{
                fontSize: '20px',
                lineHeight: '28px',
                fontWeight: '600',
                color: '#ffffff',
                margin: '0 0 24px 0'
              }}>
                Welcome back
              </h2>
            </div>

            <button
              className="social-provider-btn google"
              onClick={() => handleSocialAuth('google')}
              disabled={loading}
            >
              <svg className="provider-icon" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign in with Google
            </button>

            <button
              className="social-provider-btn linkedin"
              onClick={() => handleSocialAuth('linkedin_oidc')}
              disabled={loading}
            >
              <svg className="provider-icon" viewBox="0 0 24 24">
                <path fill="#fff" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Sign in with LinkedIn
            </button>

            <div className="auth-divider">
              <span>Or continue with email</span>
            </div>

            {error && (
              <div className="auth-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Work Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button" 
                  className="forgot-password-link" 
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading || confirmationSent}
              >
                {loading ? 'Signing in...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </button>
            </form>

            <div className="auth-modal-footer">
              <p>
                {isLogin ? (
                  <>Don't have an account? <button type="button" onClick={() => setIsLogin(false)}>Sign Up</button></>
                ) : (
                  <>Already have an account? <button type="button" onClick={() => setIsLogin(true)}>Sign In</button></>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;