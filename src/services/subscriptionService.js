/**
 * PromoSuite V2 - Supabase Subscription Service
 * Handles subscription plans, payments, and billing management using Supabase
 */

import { supabase, handleSupabaseError, getCurrentUser, TABLES } from '../utils/supabase';
import apiClient from '../utils/api';
import API_ENDPOINTS from '../config/apiEndpoints';

class SupabaseSubscriptionService {
  /**
   * Get all available subscription plans
   */
  async getPlans() {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTION_PLANS)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return { success: true, plans: data };
    } catch (error) {
      console.error('Get plans error:', error);
      throw handleSupabaseError(error, 'getting subscription plans');
    }
  }

  /**
   * Get current user subscription
   */
  async getCurrentSubscription() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found
      return { success: true, subscription: data };
    } catch (error) {
      console.error('Get current subscription error:', error);
      throw handleSupabaseError(error, 'getting current subscription');
    }
  }

  /**
   * Create new subscription
   */
  async createSubscription(planId, paymentMethodId, stripeCustomerId = null) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create subscription record in database
      const subscriptionData = {
        user_id: currentUser.id,
        plan_id: planId,
        stripe_customer_id: stripeCustomerId,
        status: 'inactive', // Will be updated by Stripe webhook
        metadata: {
          payment_method_id: paymentMethodId,
          created_via: 'web_app'
        }
      };

      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .insert(subscriptionData)
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (error) throw error;

      // Update user data in localStorage
      const userData = JSON.parse(localStorage.getItem('promosuiteUser') || '{}');
      userData.subscription = data;
      localStorage.setItem('promosuiteUser', JSON.stringify(userData));
      
      return { success: true, subscription: data };
    } catch (error) {
      console.error('Create subscription error:', error);
      throw handleSupabaseError(error, 'creating subscription');
    }
  }

  /**
   * Update existing subscription
   */
  async updateSubscription(subscriptionId, updates) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', currentUser.id) // Ensure user can only update their own subscription
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .single();

      if (error) throw error;

      // Update user data in localStorage
      const userData = JSON.parse(localStorage.getItem('promosuiteUser') || '{}');
      userData.subscription = data;
      localStorage.setItem('promosuiteUser', JSON.stringify(userData));
      
      return { success: true, subscription: data };
    } catch (error) {
      console.error('Update subscription error:', error);
      throw handleSupabaseError(error, 'updating subscription');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, reason = '') {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.SUBSCRIPTION.CANCEL}/${subscriptionId}`, {
        reason,
      });

      if (response.success) {
        // Update user data in localStorage
        const userData = JSON.parse(localStorage.getItem('promosuiteUser') || '{}');
        if (userData.subscription) {
          userData.subscription.status = 'cancelled';
          userData.subscription.cancelledAt = new Date().toISOString();
        }
        localStorage.setItem('promosuiteUser', JSON.stringify(userData));
        
        return response.subscription || { status: 'cancelled' };
      }
      
      throw new Error(response.message || 'Subscription cancellation failed');
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  }

  /**
   * Get subscription history
   */
  async getSubscriptionHistory() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION.HISTORY);
      return response.history || response;
    } catch (error) {
      console.error('Get subscription history error:', error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription
   */
  hasActiveSubscription(user) {
    if (!user) return false;
    
    // Check stored subscription data
    const subscription = user.subscription || user.profile?.subscription;
    if (!subscription) return false;
    
    return subscription.status === 'active' || subscription.status === 'trialing';
  }

  /**
   * Check if user is within trial period
   */
  isInTrialPeriod(user) {
    if (!user || !user.trialStatus) return false;
    
    // Check if user has used fewer than the allowed trial tools
    const usedTools = Object.values(user.trialStatus || {}).filter(status => status.used).length;
    return usedTools < 2; // Assuming 2 tools can be tried for free
  }

  /**
   * Check if user can access a specific tool
   */
  canAccessTool(user, toolName) {
    // If user has active subscription, they can access everything
    if (this.hasActiveSubscription(user)) return true;
    
    // If user is in trial period, check if they've used this tool
    if (this.isInTrialPeriod(user)) {
      const toolStatus = user.trialStatus?.[toolName];
      return !toolStatus?.used;
    }
    
    return false;
  }

  /**
   * Get trial usage count
   */
  getTrialUsageCount(user) {
    if (!user || !user.trialStatus) return 0;
    
    return Object.values(user.trialStatus).filter(status => status.used).length;
  }

  /**
   * Mark tool as used in trial
   */
  async markToolAsUsed(toolName) {
    try {
      // Get current user data
      const userData = JSON.parse(localStorage.getItem('promosuiteUser') || '{}');
      
      if (!userData.trialStatus) {
        userData.trialStatus = {};
      }
      
      // Mark tool as used
      userData.trialStatus[toolName] = {
        used: true,
        usedAt: new Date().toISOString(),
        count: (userData.trialStatus[toolName]?.count || 0) + 1,
      };
      
      // Update localStorage
      localStorage.setItem('promosuiteUser', JSON.stringify(userData));
      
      // Sync with backend
      await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, {
        trialStatus: userData.trialStatus,
      });
      
      return userData;
    } catch (error) {
      console.error('Mark tool as used error:', error);
      // Don't throw error to not break the user experience
      // Just log it and continue
    }
  }

  /**
   * Create payment method (for Stripe integration)
   */
  async createPaymentMethod(paymentData) {
    try {
      const response = await apiClient.post('/subscription/payment-methods', paymentData);
      return response.paymentMethod || response;
    } catch (error) {
      console.error('Create payment method error:', error);
      throw error;
    }
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await apiClient.get('/subscription/payment-methods');
      return response.paymentMethods || response;
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw error;
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId) {
    try {
      const response = await apiClient.delete(`/subscription/payment-methods/${paymentMethodId}`);
      return response;
    } catch (error) {
      console.error('Delete payment method error:', error);
      throw error;
    }
  }

  /**
   * Preview subscription changes
   */
  async previewSubscriptionChange(subscriptionId, newPlanId) {
    try {
      const response = await apiClient.get(`/subscription/preview/${subscriptionId}`, {
        planId: newPlanId,
      });
      return response.preview || response;
    } catch (error) {
      console.error('Preview subscription change error:', error);
      throw error;
    }
  }

  /**
   * Get billing information
   */
  async getBillingInfo() {
    try {
      const response = await apiClient.get('/subscription/billing');
      return response.billing || response;
    } catch (error) {
      console.error('Get billing info error:', error);
      throw error;
    }
  }

  /**
   * Update billing information
   */
  async updateBillingInfo(billingData) {
    try {
      const response = await apiClient.put('/subscription/billing', billingData);
      return response.billing || response;
    } catch (error) {
      console.error('Update billing info error:', error);
      throw error;
    }
  }

  /**
   * Download invoice
   */
  async downloadInvoice(invoiceId) {
    try {
      const response = await apiClient.get(`/subscription/invoices/${invoiceId}/download`, {}, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error('Download invoice error:', error);
      throw error;
    }
  }

  /**
   * Get usage analytics for subscription
   */
  async getUsageAnalytics(period = '30d') {
    try {
      const response = await apiClient.get('/subscription/usage', { period });
      return response.usage || response;
    } catch (error) {
      console.error('Get usage analytics error:', error);
      throw error;
    }
  }

  /**
   * Open Stripe Customer Portal for subscription management
   */
  async openCustomerPortal() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION.CUSTOMER_PORTAL, {
        return_url: window.location.href
      });
      
      if (response.success && response.url) {
        return response.url;
      }
      
      throw new Error(response.message || 'Failed to create customer portal session');
    } catch (error) {
      console.error('Open customer portal error:', error);
      throw error;
    }
  }

  /**
   * Get detailed usage breakdown for the current user
   */
  async getUsageBreakdown() {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get current subscription with limits (for potential future use)
      // const { subscription } = await this.getCurrentSubscription();
      
      // Get usage analytics from database
      const { data: analytics, error: analyticsError } = await supabase
        .from(TABLES.USER_ANALYTICS)
        .select('*')
        .eq('user_id', currentUser.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 30 days
        .order('date', { ascending: false });

      if (analyticsError) throw analyticsError;

      // Get current month usage from subscription
      const { data: currentSub, error: subError } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;

      // Aggregate usage data
      const totalUsage = analytics?.reduce((acc, day) => {
        acc.flyersCreated += day.flyers_created || 0;
        acc.templatesUsed += day.templates_used || 0;
        acc.socialPostsCreated += day.social_posts_created || 0;
        acc.socialPostsPublished += day.social_posts_published || 0;
        acc.mediaUploaded += day.media_uploaded || 0;
        acc.sessionTimeMinutes += day.session_time_minutes || 0;
        return acc;
      }, {
        flyersCreated: 0,
        templatesUsed: 0,
        socialPostsCreated: 0,
        socialPostsPublished: 0,
        mediaUploaded: 0,
        sessionTimeMinutes: 0
      }) || {
        flyersCreated: 0,
        templatesUsed: 0,
        socialPostsCreated: 0,
        socialPostsPublished: 0,
        mediaUploaded: 0,
        sessionTimeMinutes: 0
      };

      // Get current month usage from subscription table
      const currentMonthUsage = {
        flyersUsed: currentSub?.flyers_used_this_month || 0,
        socialPostsUsed: currentSub?.social_posts_used_this_month || 0,
        storageUsedMB: currentSub?.storage_used_mb || 0
      };

      // Get limits from subscription plan
      const limits = {
        maxFlyersPerMonth: currentSub?.plan?.max_flyers_per_month || null,
        maxSocialPostsPerMonth: currentSub?.plan?.max_social_posts_per_month || null,
        maxStorageGB: currentSub?.plan?.max_storage_gb || null
      };

      return {
        success: true,
        usage: {
          current: currentMonthUsage,
          total: totalUsage,
          limits,
          subscription: {
            plan: currentSub?.plan?.name || 'Free',
            status: currentSub?.status || 'trial',
            planType: currentSub?.plan?.plan_type || 'free'
          },
          dailyBreakdown: analytics || []
        }
      };
    } catch (error) {
      console.error('Get usage breakdown error:', error);
      throw handleSupabaseError(error, 'getting usage breakdown');
    }
  }

}

// Create singleton instance
const subscriptionService = new SupabaseSubscriptionService();

export default subscriptionService;

// Also export the class for testing or custom instances
export { SupabaseSubscriptionService as SubscriptionService };
