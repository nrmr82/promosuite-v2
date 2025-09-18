/**
 * Account Deletion Service
 * Handles the complete account deletion process with proper error handling and user feedback
 */

import authService from './authService';

class AccountDeletionService {
  /**
   * Delete user account with all associated data
   * @param {Function} onLogout - Callback to handle logout after deletion
   * @returns {Promise<Object>} Result of deletion process
   */
  async deleteUserAccount(onLogout) {
    try {
      console.log('🗑️ AccountDeletionService: Starting account deletion process');

      // Step 1: Delete account data via auth service
      const result = await authService.deleteAccount();
      
      if (!result.success) {
        throw new Error(result.message || 'Account deletion failed');
      }

      console.log('🗑️ AccountDeletionService: Account data deleted successfully');

      // Step 2: Call logout handler to update app state
      if (onLogout && typeof onLogout === 'function') {
        console.log('🗑️ AccountDeletionService: Calling logout handler');
        await onLogout();
      }

      // Step 3: Redirect to landing page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

      return {
        success: true,
        message: 'Your account has been successfully deleted. You will be redirected to the homepage.'
      };

    } catch (error) {
      console.error('🗑️ AccountDeletionService: Deletion failed', error);
      
      // Even if there's an error, try to logout the user for security
      if (onLogout && typeof onLogout === 'function') {
        try {
          await onLogout();
        } catch (logoutError) {
          console.error('🗑️ AccountDeletionService: Logout after error failed', logoutError);
        }
      }

      return {
        success: false,
        message: error.message || 'Failed to delete account. Please contact support if this issue persists.'
      };
    }
  }

  /**
   * Verify user can delete account (additional safety checks)
   * @param {Object} user - Current user object
   * @returns {Object} Verification result
   */
  verifyDeletionEligibility(user) {
    if (!user) {
      return {
        eligible: false,
        reason: 'User not authenticated'
      };
    }

    if (!user.id && !user.profile?.id) {
      return {
        eligible: false,
        reason: 'Invalid user data'
      };
    }

    // Add any additional business logic here
    // For example, checking if user has active subscriptions that need cancellation first
    
    return {
      eligible: true,
      reason: null
    };
  }

  /**
   * Get list of data that will be deleted
   * @param {Object} user - Current user object
   * @returns {Array} List of data types that will be deleted
   */
  getDataDeletionSummary(user) {
    const dataTypes = [
      {
        type: 'Profile Information',
        description: 'Your name, email, phone, and other profile details'
      },
      {
        type: 'Created Content',
        description: 'All flyers, designs, and social media posts you\'ve created'
      },
      {
        type: 'Media Assets',
        description: 'Uploaded images, videos, and other media files'
      },
      {
        type: 'Collections & Favorites',
        description: 'Your saved templates and organized collections'
      },
      {
        type: 'Usage Analytics',
        description: 'Your activity history and usage statistics'
      },
      {
        type: 'Subscription Data',
        description: 'Billing information and subscription history'
      },
      {
        type: 'App Preferences',
        description: 'Settings, notifications, and customization preferences'
      }
    ];

    return dataTypes;
  }
}

// Create singleton instance
const accountDeletionService = new AccountDeletionService();

export default accountDeletionService;