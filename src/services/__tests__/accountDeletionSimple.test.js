import accountDeletionService from '../accountDeletionService';

describe('accountDeletionService', () => {
  describe('verifyDeletionEligibility', () => {
    it('allows deletion for a user with an id', () => {
      expect(
        accountDeletionService.verifyDeletionEligibility({ id: 'test-user-123', email: 'test@example.com' })
      ).toEqual({ eligible: true, reason: null });
    });

    it('allows deletion for a user whose id is only on the profile', () => {
      expect(
        accountDeletionService.verifyDeletionEligibility({ profile: { id: 'test-user-123' } })
      ).toEqual({ eligible: true, reason: null });
    });

    it('denies deletion when no user is logged in', () => {
      expect(accountDeletionService.verifyDeletionEligibility(null)).toEqual({
        eligible: false,
        reason: 'User not authenticated'
      });
    });

    it('denies deletion for a user without an id', () => {
      expect(
        accountDeletionService.verifyDeletionEligibility({ email: 'test@example.com' })
      ).toEqual({ eligible: false, reason: 'Invalid user data' });
    });
  });

  describe('getDataDeletionSummary', () => {
    it('lists every category of data that will be deleted', () => {
      const summary = accountDeletionService.getDataDeletionSummary({ id: 'test-user-123' });

      expect(summary.map((item) => item.type)).toEqual([
        'Profile Information',
        'Created Content',
        'Media Assets',
        'Collections & Favorites',
        'Usage Analytics',
        'Subscription Data',
        'App Preferences'
      ]);
      summary.forEach((item) => expect(item.description).toEqual(expect.any(String)));
    });
  });
});
