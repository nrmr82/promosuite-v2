import accountDeletionService from '../accountDeletionService';

// Mock window methods
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    replace: jest.fn()
  },
  writable: true
});

describe('Account Deletion Service', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com'
  };

  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
  });

  describe('verifyDeletionEligibility', () => {
    it('allows deletion for valid user', () => {
      const result = accountDeletionService.verifyDeletionEligibility(mockUser);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('denies deletion for missing user', () => {
      const result = accountDeletionService.verifyDeletionEligibility(null);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('No user logged in');
    });

    it('denies deletion for user without id', () => {
      const result = accountDeletionService.verifyDeletionEligibility({ email: 'test@example.com' });

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('No user logged in');
    });
  });

  describe('deleteUserAccount', () => {
    it('handles ineligible users', async () => {
      const result = await accountDeletionService.deleteUserAccount(null, mockOnLogout);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User is not eligible for account deletion: No user logged in');
      expect(mockOnLogout).not.toHaveBeenCalled();
    });

    it('handles users without proper structure', async () => {
      const invalidUser = { email: 'test@example.com' }; // missing id
      const result = await accountDeletionService.deleteUserAccount(invalidUser, mockOnLogout);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User is not eligible for account deletion: No user logged in');
      expect(mockOnLogout).not.toHaveBeenCalled();
    });
  });
});