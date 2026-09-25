import accountDeletionService from '../accountDeletionService';
import authService from '../authService';

jest.mock('../authService', () => ({
  __esModule: true,
  default: {
    deleteAccount: jest.fn()
  }
}));

describe('accountDeletionService.deleteUserAccount', () => {
  const originalLocation = window.location;

  beforeAll(() => {
    delete window.location;
    window.location = { href: '' };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    window.location.href = '';
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('deletes the account, logs out, then redirects home', async () => {
    authService.deleteAccount.mockResolvedValue({
      success: true,
      message: 'Account permanently deleted'
    });
    const onLogout = jest.fn().mockResolvedValue();

    const result = await accountDeletionService.deleteUserAccount(onLogout);

    expect(authService.deleteAccount).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      message: 'Your account has been successfully deleted. You will be redirected to the homepage.'
    });

    // Redirect happens after a short delay
    expect(window.location.href).toBe('');
    jest.advanceTimersByTime(1000);
    expect(window.location.href).toBe('/');
  });

  it('succeeds without a logout handler', async () => {
    authService.deleteAccount.mockResolvedValue({ success: true });

    const result = await accountDeletionService.deleteUserAccount();

    expect(result.success).toBe(true);
  });

  it('returns the failure message and still logs out when deletion is unsuccessful', async () => {
    authService.deleteAccount.mockResolvedValue({
      success: false,
      message: 'Deletion failed'
    });
    const onLogout = jest.fn().mockResolvedValue();

    const result = await accountDeletionService.deleteUserAccount(onLogout);

    expect(result).toEqual({ success: false, message: 'Deletion failed' });
    // Logged out for security even though deletion failed
    expect(onLogout).toHaveBeenCalledTimes(1);

    jest.runAllTimers();
    expect(window.location.href).toBe('');
  });

  it('uses a default message when an unsuccessful result has none', async () => {
    authService.deleteAccount.mockResolvedValue({ success: false });

    const result = await accountDeletionService.deleteUserAccount(jest.fn());

    expect(result).toEqual({ success: false, message: 'Account deletion failed' });
  });

  it('returns the error message when authService throws', async () => {
    authService.deleteAccount.mockRejectedValue(
      new Error('Failed to delete account: User not authenticated')
    );
    const onLogout = jest.fn().mockResolvedValue();

    const result = await accountDeletionService.deleteUserAccount(onLogout);

    expect(result).toEqual({
      success: false,
      message: 'Failed to delete account: User not authenticated'
    });
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('still returns a failure result when logout after an error also fails', async () => {
    authService.deleteAccount.mockRejectedValue(new Error('Service error'));
    const onLogout = jest.fn().mockRejectedValue(new Error('Logout error'));

    const result = await accountDeletionService.deleteUserAccount(onLogout);

    expect(result).toEqual({ success: false, message: 'Service error' });
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
