/**
 * PromoSuite V2 - Supabase Authentication Service
 * Handles user authentication, registration, and session management using Supabase Auth
 */

import { supabase, handleSupabaseError, getCurrentUser, getCurrentSession, TABLES } from '../utils/supabase';
import apiClient from '../utils/api';
import API_ENDPOINTS from '../config/apiEndpoints';
import sessionTimeoutService from './sessionTimeoutService';

class SupabaseAuthService {
  constructor() {
    this._dbAvailable = undefined; // undefined = unknown, true = working, false = unavailable
    this._dbUnavailableWarningShown = false;
    this._profileCache = new Map(); // Cache profiles to avoid repeated queries
    this._sessionTimeoutInitialized = false;
  }

  /**
   * User Login with Email/Password
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile data
      const profile = await this.getUserProfile(data.user.id);
      
      const userData = {
        ...data.user,
        profile,
        session: data.session,
      };
      
      // Store in localStorage for backward compatibility
      localStorage.setItem('promosuiteUser', JSON.stringify(userData));
      
      // Start session timeout tracking
      this.startSessionTimeout();
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      
      // Ensure session tracking is cleared on failed login
      this.stopSessionTimeout();
      
      // Provide specific error messages for login issues
      if (error.message?.includes('Invalid login credentials') ||
          error.message?.includes('Invalid credentials') ||
          error.message?.includes('invalid_credentials')) {
        throw new Error('Invalid email or password. If you signed up with Google or LinkedIn, please use that login method instead.');
      } else if (error.message?.includes('Email not confirmed') ||
                 error.message?.includes('email_not_confirmed') ||
                 (error.message?.includes('confirm') && error.message?.includes('email'))) {
        throw new Error('Please check your email and click the confirmation link to verify your account.');
      } else if (error.message?.includes('User not found') ||
                 error.message?.includes('user_not_found')) {
        throw new Error('No account found with this email address. Please sign up first, or try logging in with Google/LinkedIn if you used those methods.');
      } else if (error.message?.includes('Too many requests') ||
                 error.message?.includes('rate_limit') ||
                 error.message?.includes('rate limit')) {
        throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
      } else if (error.message?.includes('Signup requires a valid password') ||
                 error.message?.includes('Password not set')) {
        throw new Error('This account was created with Google or LinkedIn. Please use the social login buttons instead of email/password.');
      } else if (error.message?.includes('network') || error.message?.includes('fetch') ||
                 error.message?.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        // Clean up technical error messages for login
        let userMessage = error.message || 'Login failed. Please try again.';
        
        if (userMessage.includes('AuthApiError:')) {
          userMessage = userMessage.replace('AuthApiError:', '').trim();
        }
        
        // For very technical messages, provide friendly fallback
        if (userMessage.length > 100 || userMessage.includes('function') || userMessage.includes('SQL')) {
          userMessage = 'Login failed due to a technical issue. Please try again or use social login.';
        }
        
        throw new Error(userMessage);
      }
    }
  }

  /**
   * User Registration
   */
  async register(userData) {
    try {
      const { email, password, name, full_name, ...profileData } = userData;
      
      console.log('🔍 Registration Debug - Starting registration for:', email);
      
      // Use 'name' field from form or 'full_name' for consistency
      const displayName = name || full_name || '';
      console.log('🔍 Registration Debug - Display name:', displayName);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
            name: displayName,
            ...profileData
          }
        }
      });

      if (error) {
        console.error('🔍 Registration Debug - Supabase auth signup error:', error);
        throw error;
      }

      console.log('🔍 Registration Debug - Signup successful, data:', {
        user: data.user ? 'User created' : 'No user',
        session: data.session ? 'Session exists' : 'No session',
        userId: data.user?.id
      });

      // If registration successful but email confirmation required
      if (data.user && !data.session) {
        console.log('🔍 Registration Debug - Email confirmation required');
        return {
          user: data.user,
          emailConfirmationRequired: true,
          message: 'Please check your email to confirm your account'
        };
      }

      // If user is automatically confirmed and logged in
      if (data.user && data.session) {
        console.log('🔍 Registration Debug - User logged in, attempting to get profile');
        
        // Wait for profile creation and try multiple times with exponential backoff
        let profile = null;
        let attempts = 0;
        const maxAttempts = 8; // Increased attempts
        let lastError = null;
        
        while (!profile && attempts < maxAttempts) {
          attempts++;
          const waitTime = attempts * 300; // Wait 300ms, 600ms, 900ms, etc.
          console.log(`🔍 Registration Debug - Profile fetch attempt ${attempts}/${maxAttempts}, waiting ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          try {
            profile = await this.getUserProfile(data.user.id);
            if (profile) {
              console.log('🔍 Registration Debug - Profile fetched successfully:', profile);
            }
          } catch (profileError) {
            lastError = profileError;
            console.log(`🔍 Registration Debug - Profile fetch attempt ${attempts} failed:`, {
              message: profileError.message,
              code: profileError.code,
              details: profileError.details
            });
          }
        }
        
        if (!profile && lastError) {
          console.error('🔍 Registration Debug - All profile fetch attempts failed. Last error:', lastError);
          // Check if this is a database/table issue
          if (lastError.message?.includes('relation "profiles" does not exist') ||
              lastError.message?.includes('table') ||
              lastError.code === 'PGRST102') {
            throw new Error('Database setup incomplete. Please ensure the profiles table exists.');
          }
        }
        
        const fallbackProfile = {
          id: data.user.id,
          email: data.user.email,
          full_name: displayName,
          created_at: new Date().toISOString()
        };
        
        const newUserData = {
          ...data.user,
          profile: profile || fallbackProfile,
          session: data.session,
        };
        
        console.log('🔍 Registration Debug - Final user data created:', {
          hasUser: !!newUserData.id,
          hasProfile: !!newUserData.profile,
          hasSession: !!newUserData.session,
          profileSource: profile ? 'database' : 'fallback'
        });
        
        localStorage.setItem('promosuiteUser', JSON.stringify(newUserData));
        
        // Start session timeout tracking
        this.startSessionTimeout();
        
        return newUserData;
      }
      
      throw new Error('Registration failed - no user or session returned');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Provide more specific error messages based on error type
      if (error.message?.includes('User already registered') || 
          error.message?.includes('email address is already registered') ||
          error.message?.includes('Email address is already registered') ||
          error.code === '23505' || // PostgreSQL unique violation
          error.message?.includes('duplicate key value violates unique constraint') ||
          error.message?.includes('user_already_exists')) {
        
        // Try to determine if this is an OAuth/email conflict
        const email = userData?.email;
        if (email) {
          // Use helper method to get specific conflict message
          try {
            const conflictMessage = await this.getAuthConflictMessage(email);
            throw new Error(conflictMessage);
          } catch (checkError) {
            // Fallback if the check fails
            throw new Error(`An account with ${email} already exists. If you previously signed up with Google or LinkedIn, please use that login method instead. Otherwise, try the 'Sign In' tab if you have an account.`);
          }
        } else {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        }
        
      } else if (error.message?.includes('Password should be at least') ||
                 (error.message?.includes('password') && error.message?.includes('6')) ||
                 error.message?.includes('Password is too weak')) {
        throw new Error('Password must be at least 6 characters long. Please choose a stronger password.');
      } else if (error.message?.includes('Invalid email') ||
                 (error.message?.includes('email') && error.message?.includes('invalid')) ||
                 error.message?.includes('Email address is invalid')) {
        throw new Error('Please enter a valid email address.');
      } else if (error.message?.includes('signup is disabled') ||
                 error.message?.includes('Signups not allowed') ||
                 error.message?.includes('Sign up is disabled')) {
        throw new Error('User registration is currently disabled. Please contact support.');
      } else if (error.message?.includes('Email not confirmed') ||
                 (error.message?.includes('confirm') && error.message?.includes('email')) ||
                 error.message?.includes('email_not_confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.');
      } else if (error.message?.includes('Invalid login credentials') ||
                 error.message?.includes('Invalid credentials') ||
                 error.message?.includes('invalid_credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message?.includes('User not found') ||
                 error.message?.includes('user_not_found')) {
        throw new Error('No account found with this email address. Please sign up first.');
      } else if (error.message?.includes('rate_limit') ||
                 error.message?.includes('Too many requests') ||
                 error.message?.includes('rate limit')) {
        throw new Error('Too many attempts. Please wait a few minutes before trying again.');
      } else if (error.message?.includes('network') || error.message?.includes('fetch') ||
                 error.message?.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.message?.includes('profile') || error.message?.includes('database')) {
        // This was our original error - make it more user-friendly
        throw new Error('Account created but there was an issue setting up your profile. Please try signing in.');
      } else if (error.message?.includes('Email rate limit exceeded')) {
        throw new Error('Too many email attempts. Please wait before requesting another confirmation email.');
      } else if (error.message?.includes('For security purposes')) {
        throw new Error('For security reasons, please wait before attempting registration again.');
      } else {
        // Generic fallback error with the original message for debugging
        console.error('Unhandled registration error:', error);
        
        // Extract useful parts of the error message
        let userMessage = error.message || 'Registration failed. Please try again.';
        
        // Clean up technical error messages
        if (userMessage.includes('AuthApiError:')) {
          userMessage = userMessage.replace('AuthApiError:', '').trim();
        }
        
        // If it's a very technical message, provide a friendly fallback
        if (userMessage.length > 100 || userMessage.includes('function') || userMessage.includes('SQL')) {
          userMessage = 'Registration failed due to a technical issue. Please try again or contact support.';
        }
        
        throw new Error(userMessage);
      }
    }
  }

  /**
   * Social Media Authentication
   */
  async socialAuth(provider, options = {}) {
    try {
      // Add specific options for Google to allow account selection
      const authOptions = {
        redirectTo: `${window.location.origin}/auth/callback`,
        ...options
      };
      
      // For Google, add prompt parameter to allow account selection
      if (provider === 'google') {
        authOptions.queryParams = {
          prompt: 'select_account',
          ...authOptions.queryParams
        };
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: authOptions
      });

      if (error) throw error;

      // OAuth will redirect, so we don't get user data immediately
      // The callback will be handled by the auth state change listener
      return { success: true, redirecting: true };
    } catch (error) {
      console.error('Social auth error:', error);
      throw handleSupabaseError(error, 'during social authentication');
    }
  }

  /**
   * Logout user
   */
  async logout() {
    console.log('🔐 AuthService: Starting logout process');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('🔐 AuthService: Supabase signOut successful');
    } catch (error) {
      console.error('🔐 AuthService: Logout error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Stop session timeout tracking
      this.stopSessionTimeout();
      
      // Always clear all user-related storage
      localStorage.removeItem('promosuiteUser');
      sessionStorage.removeItem('sb-localhost-auth-token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Clear profile cache
      this._profileCache.clear();
      
      console.log('🔐 AuthService: Local cleanup completed');
    }
  }

  /**
   * Get current user from Supabase Auth
   */
  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      if (user) {
        const profile = await this.getUserProfile(user.id);
        return {
          ...user,
          profile
        };
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Get current user from localStorage (for backward compatibility)
   */
  getCurrentUserSync() {
    const userData = localStorage.getItem('promosuiteUser');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('promosuiteUser');
      }
    }
    return null;
  }

  /**
   * Get user profile - tries database first, falls back to session data
   */
  async getUserProfile(userId, retries = 1) {
    // Check cache first to avoid repeated calls
    if (this._profileCache.has(userId)) {
      return this._profileCache.get(userId);
    }

    // Check if we've already flagged database as unavailable to avoid repeated 406s
    if (!this._dbAvailable && this._dbAvailable !== undefined) {
      const fallbackProfile = this.createFallbackProfile(userId);
      this._profileCache.set(userId, fallbackProfile);
      return fallbackProfile;
    }

    // First, try to get fresh user data from current session
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === userId) {
        // Try database first for complete profile (only if we haven't confirmed it's unavailable)
        if (this._dbAvailable !== false) {
          try {
            const { data, error } = await supabase
              .from(TABLES.PROFILES)
              .select('*')
              .eq('id', userId)
              .single();

            if (data && !error) {
              // Database profile exists, merge with session data
              this._dbAvailable = true; // Mark database as working
              const profile = {
                ...data,
                email: user.email || data.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || data.full_name,
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || data.avatar_url
              };
              this._profileCache.set(userId, profile);
              return profile;
            }
          } catch (dbError) {
            // Database error (like 406), fall back to session-only profile
            if (dbError.message?.includes('406') || dbError.status === 406 || dbError.code === 'PGRST102') {
              if (!this._dbUnavailableWarningShown) {
                console.warn('⚠️ Database profile access failed (HTTP 406). Using session-based profile. This indicates the profiles table may not exist or has permission issues.');
                console.log('📋 To fix this permanently, run the database setup script in your Supabase SQL editor.');
                this._dbUnavailableWarningShown = true;
              }
              this._dbAvailable = false; // Mark database as unavailable to prevent repeated attempts
            } else {
              console.log('Database temporarily unavailable, using session data:', dbError.message);
            }
          }
        }
        
        // Create profile from OAuth/session user data
        const sessionProfile = this.createProfileFromAuthUser(user);
        this._profileCache.set(userId, sessionProfile);
        return sessionProfile;
      }
    } catch (error) {
      console.error('Error getting user session:', error);
    }
    
    // Ultimate fallback
    const fallbackProfile = this.createFallbackProfile(userId);
    this._profileCache.set(userId, fallbackProfile);
    return fallbackProfile;
  }

  /**
   * Create profile from OAuth user data
   */
  createProfileFromAuthUser(user) {
    const userData = user.user_metadata || {};
    const appData = user.app_metadata || {};
    
    const email = user.email || userData.email;
    const fullName = userData.full_name || userData.name || userData.display_name || email?.split('@')[0] || 'User';
    const avatarUrl = userData.avatar_url || userData.picture || userData.photo;
    const provider = appData.provider || 'email';
    
    console.log('✅ Creating profile from OAuth:', { 
      email: email?.substring(0, 10) + '...', 
      fullName, 
      provider,
      hasAvatar: !!avatarUrl 
    });
    
    return {
      id: user.id,
      email: email,
      full_name: fullName,
      avatar_url: avatarUrl,
      subscription_status: 'free',
      subscription_plan: 'free',
      credits: 3,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      preferences: {},
      provider: user.app_metadata?.provider || 'email',
      is_oauth: true // Flag to indicate this is from OAuth
    };
  }

  /**
   * Create a fallback profile when database access fails
   */
  createFallbackProfile(userId) {
    return {
      id: userId,
      email: null,
      full_name: 'User',
      avatar_url: null,
      subscription_status: 'free',
      subscription_plan: 'free',
      credits: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      preferences: {},
      is_fallback: true // Flag to indicate this is a fallback profile
    };
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const session = await getCurrentSession();
      return !!session?.user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user is authenticated (synchronous for backward compatibility)
   */
  isAuthenticatedSync() {
    const user = this.getCurrentUserSync();
    return !!(user && (user.session || user.token));
  }

  /**
   * Refresh authentication session
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session && data.user) {
        const profile = await this.getUserProfile(data.user.id);
        const userData = {
          ...data.user,
          profile,
          session: data.session,
        };
        
        localStorage.setItem('promosuiteUser', JSON.stringify(userData));
        return userData;
      }
      
      throw new Error('Session refresh failed');
    } catch (error) {
      console.error('Session refresh error:', error);
      // If refresh fails, logout user
      await this.logout();
      throw handleSupabaseError(error, 'during session refresh');
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw handleSupabaseError(error, 'during password reset request');
    }
  }

  /**
   * Reset password (called after clicking reset link)
   */
  async resetPassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Password reset successfully',
        user: data.user
      };
    } catch (error) {
      console.error('Reset password error:', error);
      throw handleSupabaseError(error, 'during password reset');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(TABLES.PROFILES)
        .update(profileData)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) throw error;

      // Update stored user data
      const storedUser = this.getCurrentUserSync();
      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          profile: data,
        };
        
        localStorage.setItem('promosuiteUser', JSON.stringify(updatedUser));
      }

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Profile update error:', error);
      throw handleSupabaseError(error, 'during profile update');
    }
  }

  /**
   * Get user usage statistics
   */
  async getUserUsage() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER.USAGE_STATS);
      return response.data || response;
    } catch (error) {
      console.error('Get user usage error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER.PREFERENCES, preferences);
      
      if (response.success) {
        // Update stored user data
        const currentUser = this.getCurrentUser();
        const updatedUser = {
          ...currentUser,
          preferences: response.preferences,
        };
        
        localStorage.setItem('promosuiteUser', JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      throw new Error(response.message || 'Preferences update failed');
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  /**
   * Set up authentication state listener
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthService: Auth state changed -', event, session ? 'with session' : 'no session');
      let userData = null;
      
      if (session?.user && event !== 'SIGNED_OUT') {
        console.log('🔐 AuthService: Processing sign-in for user:', session.user.email);
        try {
          const profile = await this.getUserProfile(session.user.id);
          userData = {
            ...session.user,
            profile,
            session,
          };
          
          localStorage.setItem('promosuiteUser', JSON.stringify(userData));
          
          // Start session timeout tracking for OAuth login
          this.startSessionTimeout();
        } catch (error) {
          console.error('Error getting user profile during auth state change:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🔐 AuthService: Processing sign-out - clearing data');
        // Stop session timeout tracking on logout
        this.stopSessionTimeout();
        localStorage.removeItem('promosuiteUser');
        sessionStorage.removeItem('sb-localhost-auth-token');
        sessionStorage.removeItem('supabase.auth.token');
        this._profileCache.clear();
        userData = null;
      }
      
      callback(event, userData);
    });
  }

  /**
   * Test database connection and table existence
   */
  async testDatabaseConnection() {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test basic connection
      const { /* data, */ error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('🔍 Database test failed:', error);
        return {
          connected: false,
          error: error.message,
          code: error.code,
          details: error.details
        };
      }
      
      console.log('🔍 Database test successful');
      return {
        connected: true,
        message: 'Database connection successful'
      };
    } catch (error) {
      console.error('🔍 Database connection test error:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Delete user account and all associated data via server-side function
   * Following proper pattern: React (anon key) -> Server (service_role key)
   */
  async deleteAccount() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('🗑️ Starting hard delete via server for user:', currentUser.id);

      // Call the server-side endpoint for hard deletion
      // The server will use the service_role key (never exposed to browser)
      const endpoint = process.env.NODE_ENV === 'production' 
        ? '/.netlify/functions/delete-account'
        : 'http://localhost:8888/.netlify/functions/delete-account';

      console.log('🗑️ Calling secure server endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          userId: currentUser.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server deletion failed:', errorText);
        throw new Error(`Server deletion failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Server-side hard delete completed:', result);

      // Clear local storage and cache immediately
      localStorage.removeItem('promosuiteUser');
      sessionStorage.clear();
      this._profileCache.clear();

      // Sign out from Supabase client-side (the auth user is already deleted server-side)
      await supabase.auth.signOut();

      return {
        success: true,
        message: result.message || 'Account permanently deleted',
        authDeleted: true,
        deletionResults: result.deletionResults
      };
      
    } catch (error) {
      console.error('🗑️ Account deletion failed:', error);
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  }

  /**
   * Check if user exists by email and detect auth providers
   */
  async checkUserExists(email) {
    try {
      // Try to initiate password reset - this will tell us if user exists
      // without actually sending a reset email (we'll catch the error)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://example.com/nowhere' // Use invalid redirect to avoid sending email
      });
      
      // If no error, user exists
      if (!error) {
        return { 
          exists: true,
          message: 'User exists - can use password reset'
        };
      }
      
      // Check specific error messages
      if (error.message?.includes('User not found') || 
          error.message?.includes('user_not_found')) {
        return { exists: false };
      }
      
      // Check for OAuth-only accounts
      if (error.message?.includes('Signup requires a valid password') ||
          error.message?.includes('Password not set') ||
          error.message?.includes('User created via oauth')) {
        return { 
          exists: true, 
          isOAuthOnly: true,
          message: 'This account was created with Google or LinkedIn. Please use the social login buttons.'
        };
      }
      
      // For other errors, we can't determine - assume user might exist
      console.warn('Could not determine if user exists:', error);
      return { exists: null, error: error.message };
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { exists: null, error: error.message };
    }
  }
  
  /**
   * Helper method to provide user-friendly error messages for auth conflicts
   */
  async getAuthConflictMessage(email) {
    const userCheck = await this.checkUserExists(email);
    
    if (userCheck.isOAuthOnly) {
      return `An account with ${email} already exists and was created with Google or LinkedIn. Please use the social login buttons instead.`;
    } else if (userCheck.exists) {
      return `An account with ${email} already exists. You can login with your password or reset it if you've forgotten.`;
    }
    
    return `Unable to determine account status for ${email}. Please try signing up or logging in.`;
  }

  /**
   * Initialize session timeout service
   * @param {Object} options - Configuration options for session timeout
   */
  initializeSessionTimeout(options = {}) {
    if (this._sessionTimeoutInitialized) {
      return;
    }

    const defaultConfig = {
      timeoutAfterClose: 30, // 30 minutes after browser close
      inactivityTimeout: 120, // 2 hours of inactivity
    };

    const config = { ...defaultConfig, ...options };

    // Setup initial session data with grace period
    const sessionData = {
      startTime: Date.now(),
      graceperiod: true
    };
    sessionStorage.setItem('sessionData', JSON.stringify(sessionData));

    // Remove grace period after 5 seconds
    setTimeout(() => {
      const data = JSON.parse(sessionStorage.getItem('sessionData') || '{}');
      data.graceperiod = false;
      sessionStorage.setItem('sessionData', JSON.stringify(data));
      console.log('🕒 Grace period ended');
    }, 5000);

    // Initialize session timeout with automatic logout callback
    sessionTimeoutService.initialize((reason) => {
      if (this.isInGracePeriod()) {
        console.log('🕒 Ignoring timeout during grace period');
        return;
      }
      console.log('🕒 Session timeout triggered, reason:', reason);
      this.handleSessionTimeout(reason);
    }, config);

    this._sessionTimeoutInitialized = true;
    console.log('🕒 Session timeout service initialized with config:', config);
  }

  isInGracePeriod() {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('sessionData') || '{}');
      const isInGrace = sessionData.graceperiod && 
        (Date.now() - sessionData.startTime) < 5000; // 5 second grace period
      
      if (isInGrace) {
        console.log('🕒 In grace period - session valid');
      }
      
      return isInGrace;
    } catch (error) {
      console.error('Error checking grace period:', error);
      return false;
    }
  }

  /**
   * Start session timeout tracking (called on successful login)
   */
  startSessionTimeout() {
    if (!this._sessionTimeoutInitialized) {
      this.initializeSessionTimeout();
    }
    
    sessionTimeoutService.startSession();
    console.log('🕒 Session timeout tracking started');
  }

  /**
   * Stop session timeout tracking (called on logout)
   */
  stopSessionTimeout() {
    sessionTimeoutService.clearSession();
    console.log('🕒 Session timeout tracking stopped');
  }

  /**
   * Extend current session (reset timeout)
   */
  extendSession() {
    sessionTimeoutService.extendSession();
    console.log('🕒 Session extended');
  }

  /**
   * Check if session is close to expiring
   * @param {number} warningMinutes - Minutes before expiry to show warning
   * @returns {boolean}
   */
  isSessionCloseToExpiring(warningMinutes = 5) {
    return sessionTimeoutService.isSessionCloseToExpiring(warningMinutes);
  }

  /**
   * Get remaining session time
   * @returns {Object} - Remaining time information
   */
  getSessionRemainingTime() {
    return sessionTimeoutService.getRemainingTime();
  }

  /**
   * Handle session timeout (automatic logout)
   * @param {string} reason - Reason for timeout
   */
  async handleSessionTimeout(reason) {
    console.log('🕒 Handling session timeout, reason:', reason);
    
    try {
      // Perform logout without calling stopSessionTimeout again (it's already called by sessionTimeoutService)
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Session timeout logout error (continuing):', error);
      }
    } catch (error) {
      console.warn('Session timeout logout failed (continuing):', error);
    }
    
    // Clear local storage
    localStorage.removeItem('promosuiteUser');
    this._profileCache.clear();
    
    // Force page reload to return to login state
    setTimeout(() => {
      window.location.href = '/?session=expired&reason=' + encodeURIComponent(reason);
    }, 100);
  }

  /**
   * Check session validity on app initialization
   * @returns {boolean} - True if session is valid, false if expired
   */
  checkInitialSessionValidity() {
    if (!this._sessionTimeoutInitialized) {
      this.initializeSessionTimeout();
    }

    // If browser was closed, check when it was closed
    const wasBrowserClosed = localStorage.getItem('ps_browser_closed') === 'true' || 
                            sessionStorage.getItem('ps_browser_closed') === 'true';
    if (wasBrowserClosed) {
      console.log('🕒 Detected previous browser close - checking timeout');
      const closeTime = parseInt(localStorage.getItem('ps_browser_close_time') || 
                                sessionStorage.getItem('ps_browser_close_time') || '0');
      const timeoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
      const timeSinceClose = Date.now() - closeTime;

      if (timeSinceClose > timeoutDuration) {
        console.log('🕒 Session expired due to browser close timeout');
        this.stopSessionTimeout();
        localStorage.removeItem('promosuiteUser');
        // Clear browser close flags and time
        localStorage.removeItem('ps_browser_closed');
        localStorage.removeItem('ps_browser_close_time');
        sessionStorage.removeItem('ps_browser_closed');
        sessionStorage.removeItem('ps_browser_close_time');
        return false;
      } else {
        console.log('🕒 Browser was closed but within timeout window - restoring session');
      }
    }
    
    const isValid = sessionTimeoutService.checkSessionValidity();
    if (!isValid) {
      console.log('🕒 Initial session check failed - session expired');
      // Clear any stored user data
      localStorage.removeItem('promosuiteUser');
    }
    
    return isValid;
  }

  /**
   * Reset database availability cache (useful after fixing database issues)
   */
  resetDatabaseCache() {
    this._dbAvailable = undefined;
    this._dbUnavailableWarningShown = false;
    this._profileCache.clear();
    console.log('🔄 Database cache reset - will retry database connections');
  }

  /**
   * Initialize authentication state on app startup
   */
  async initializeAuth() {
    try {
      const session = await getCurrentSession();
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id);
        const userData = {
          ...session.user,
          profile,
          session,
        };
        
        localStorage.setItem('promosuiteUser', JSON.stringify(userData));
        return userData;
      }
      
      // Clear any stale data
      localStorage.removeItem('promosuiteUser');
      return null;
    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('promosuiteUser');
      return null;
    }
  }


}

// Create singleton instance
const authService = new SupabaseAuthService();

export default authService;

// Also export the class for testing or custom instances
export { SupabaseAuthService as AuthService };
