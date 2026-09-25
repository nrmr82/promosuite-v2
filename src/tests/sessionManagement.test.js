import { render, act, screen, fireEvent } from '@testing-library/react';
import authService from '../services/authService';
import sessionTimeoutService from '../services/sessionTimeoutService';
import SessionTimeoutWarning from '../components/SessionTimeoutWarning';
import { supabase } from '../utils/supabase';

const GRACE_PERIOD_MS = 5000;
// SessionTimeoutWarning runs its first check 5.5s after mounting
const INITIAL_WARNING_CHECK_MS = 5500;

// Flush pending promise callbacks while fake timers are active
const flushPromises = async () => {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
  }
};

describe('Session Management', () => {
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
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '';

    // authService is a singleton; let each test initialize session timeout afresh
    authService._sessionTimeoutInitialized = false;

    jest.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null });
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    authService.stopSessionTimeout();
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const endGracePeriod = () => {
    act(() => {
      jest.advanceTimersByTime(GRACE_PERIOD_MS + 1000);
    });
  };

  it('should not trigger timeout during grace period', () => {
    authService.initializeSessionTimeout();

    expect(authService.isInGracePeriod()).toBe(true);

    render(<SessionTimeoutWarning />);

    // Warning should not be visible during grace period
    expect(screen.queryByText(/Session Expiring Soon/)).not.toBeInTheDocument();

    // Fast forward 3 seconds (still in grace period)
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(authService.isInGracePeriod()).toBe(true);
    expect(screen.queryByText(/Session Expiring Soon/)).not.toBeInTheDocument();
  });

  it('should show the expiry warning after the grace period and let the user extend', () => {
    authService.initializeSessionTimeout();
    endGracePeriod();

    expect(authService.isInGracePeriod()).toBe(false);

    // Simulate session near expiry
    jest.spyOn(sessionTimeoutService, 'getRemainingTime').mockReturnValue({
      remainingMinutes: 5,
      isValid: true
    });
    jest.spyOn(authService, 'isSessionCloseToExpiring').mockReturnValue(true);
    const extendSpy = jest.spyOn(authService, 'extendSession');

    render(<SessionTimeoutWarning />);

    expect(screen.queryByText(/Session Expiring Soon/)).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(INITIAL_WARNING_CHECK_MS);
    });

    expect(screen.getByText(/Session Expiring Soon/)).toBeInTheDocument();
    expect(screen.getByText('5 minutes')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Yes, Keep Me Logged In'));

    expect(extendSpy).toHaveBeenCalled();
    expect(screen.queryByText(/Session Expiring Soon/)).not.toBeInTheDocument();
  });

  it('should log out and redirect when the session expires from inactivity', async () => {
    authService.initializeSessionTimeout({ inactivityTimeout: 1 }); // 1 minute
    localStorage.setItem('promosuiteUser', JSON.stringify({ id: 'user-1' }));

    // Validity is checked every 60s; the first check lands exactly on the expiry
    // time (still valid), so the second check is the one that times out
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    await flushPromises();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(60000);
    });
    await flushPromises();

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(localStorage.getItem('promosuiteUser')).toBeNull();
    expect(localStorage.getItem('ps_session_start')).toBeNull();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(window.location.href).toBe('/?session=expired&reason=session_expired');
  });

  it('should cleanup on logout', async () => {
    authService.initializeSessionTimeout();

    // Session timeout tracking is active
    expect(localStorage.getItem('ps_session_start')).not.toBeNull();
    expect(localStorage.getItem('ps_session_expiry')).not.toBeNull();

    localStorage.setItem('promosuiteUser', JSON.stringify({ id: 'user-1' }));
    sessionStorage.setItem('supabase.auth.token', 'token');

    await authService.logout();

    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(localStorage.getItem('promosuiteUser')).toBeNull();
    expect(sessionStorage.getItem('supabase.auth.token')).toBeNull();
    expect(localStorage.getItem('ps_session_start')).toBeNull();
    expect(localStorage.getItem('ps_last_activity')).toBeNull();
    expect(localStorage.getItem('ps_session_expiry')).toBeNull();

    // Timeout tracking is stopped, so the expiry check no longer logs the user out
    supabase.auth.signOut.mockClear();
    act(() => {
      jest.advanceTimersByTime(10 * 60 * 1000);
    });
    await flushPromises();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it('should prevent infinite loops with error handling', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    authService.initializeSessionTimeout();
    endGracePeriod();

    // Make sessionTimeoutService throw an error
    jest.spyOn(sessionTimeoutService, 'getRemainingTime').mockImplementation(() => {
      throw new Error('Test error');
    });

    render(<SessionTimeoutWarning />);

    act(() => {
      jest.advanceTimersByTime(INITIAL_WARNING_CHECK_MS);
    });

    // Warning should not be visible despite error
    expect(screen.queryByText(/Session Expiring Soon/)).not.toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Error checking session status:', expect.any(Error));
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    // Checks keep running on their normal 30s interval rather than retrying in a loop
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(consoleSpy).toHaveBeenCalledTimes(2);
  });
});
