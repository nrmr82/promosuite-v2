// Mock all dependencies first
jest.mock('../../utils/supabase', () => ({
  auth: {
    getUser: jest.fn(),
    admin: {
      deleteUser: jest.fn()
    }
  },
  from: jest.fn(() => ({
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}));

jest.mock('../../utils/api', () => ({
  TABLES: {
    PROFILES: 'user_profiles',
    USER_USAGE: 'user_analytics'
  }
}));

import accountDeletionService from '../accountDeletionService';
import supabase from '../../utils/supabase';

// Mock window methods
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    replace: jest.fn()
  },
  writable: true
});

// Mock localStorage
const localStorageMock = {
  clear: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  clear: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('Account Deletion Services', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset window.location.href
    window.location.href = '';
  });

  describe('accountDeletionService', () => {
    const mockOnLogout = jest.fn();

    beforeEach(() => {
      mockOnLogout.mockClear();
    });

    it('verifies deletion eligibility for active user', () => {
      const result = accountDeletionService.verifyDeletionEligibility(mockUser);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('denies deletion for missing user', () => {
      const result = accountDeletionService.verifyDeletionEligibility(null);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('No user logged in');
    });

    it('successfully deletes user account with logout and redirect', async () => {
      // Mock the internal deleteAccount function to return success
      const mockDeleteAccount = jest.fn().mockResolvedValue({
        success: true,
        message: 'Account successfully deleted'
      });
      
      // Replace the service implementation temporarily
      const originalService = require('../accountDeletionService').default;
      jest.doMock('../authService', () => ({ deleteAccount: mockDeleteAccount }));
      
      const result = await accountDeletionService.deleteUserAccount(mockUser, mockOnLogout);

      expect(result.success).toBe(true);
      expect(mockOnLogout).toHaveBeenCalled();
      
      // Check redirect after a short delay
      setTimeout(() => {
        expect(window.location.replace).toHaveBeenCalledWith('/');
      }, 1100);
    });

    it('handles deletion failure without logout', async () => {
      authService.deleteAccount.mockResolvedValue({
        success: false,
        error: 'Deletion failed'
      });

      const result = await accountDeletionService.deleteUserAccount(mockUser, mockOnLogout);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Deletion failed');
      expect(mockOnLogout).not.toHaveBeenCalled();
      expect(window.location.replace).not.toHaveBeenCalled();
    });

    it('handles ineligible users', async () => {
      const result = await accountDeletionService.deleteUserAccount(null, mockOnLogout);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User is not eligible for account deletion: No user logged in');
      expect(authService.deleteAccount).not.toHaveBeenCalled();
      expect(mockOnLogout).not.toHaveBeenCalled();
    });

    it('handles unexpected errors during deletion process', async () => {
      authService.deleteAccount.mockRejectedValue(new Error('Service error'));

      const result = await accountDeletionService.deleteUserAccount(mockUser, mockOnLogout);

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred during account deletion: Service error');
      expect(mockOnLogout).not.toHaveBeenCalled();
    });
  });

  describe('Integration test', () => {
    it('full deletion flow works end-to-end', async () => {
      // Setup successful mocks
      supabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      });
      supabase.auth.admin.deleteUser.mockResolvedValue({ error: null });

      const mockOnLogout = jest.fn();

      // Run full deletion
      const result = await accountDeletionService.deleteUserAccount(mockUser, mockOnLogout);

      expect(result.success).toBe(true);
      expect(mockOnLogout).toHaveBeenCalled();
      
      // Verify cleanup happened
      expect(localStorageMock.clear).toHaveBeenCalled();
      expect(sessionStorageMock.clear).toHaveBeenCalled();
    });
  });
});