import { render, act, screen, waitFor } from '@testing-library/react';
import authService from '../services/authService';
import sessionTimeoutService from '../services/sessionTimeoutService';
import SessionTimeoutWarning from '../components/SessionTimeoutWarning';

// Mock timer related functions
jest.useFakeTimers();

describe('Session Management', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('should not trigger timeout during grace period', async () => {
    // Initialize auth service with mock user
    await authService.initializeSessionTimeout();

    // Check if in grace period
    expect(authService.isInGracePeriod()).toBe(true);

    // Render warning component
    render(<SessionTimeoutWarning />);

    // Warning should not be visible during grace period
    expect(screen.queryByText('Session Expiring Soon')).not.toBeInTheDocument();

    // Fast forward 3 seconds (still in grace period)
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Warning should still not be visible
    expect(screen.queryByText('Session Expiring Soon')).not.toBeInTheDocument();
  });

  it('should properly timeout after grace period', async () => {
    // Initialize auth service
    await authService.initializeSessionTimeout();

    // Render warning component
    render(<SessionTimeoutWarning />);

    // Fast forward past grace period (6 seconds)
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    // Session should no longer be in grace period
    expect(authService.isInGracePeriod()).toBe(false);

    // Simulate session near expiry
    jest.spyOn(sessionTimeoutService, 'getRemainingTime').mockReturnValue({
      remainingMinutes: 5,
      isValid: true
    });
    jest.spyOn(authService, 'isSessionCloseToExpiring').mockReturnValue(true);

    // Wait for warning to appear
    await waitFor(() => {
      expect(screen.getByText('Session Expiring Soon')).toBeInTheDocument();
    });
  });

  it('should cleanup on logout', async () => {
    // Initialize session
    await authService.initializeSessionTimeout();

    // Add some session data
    const sessionData = {
      startTime: Date.now(),
      graceperiod: true
    };
    sessionStorage.setItem('sessionData', JSON.stringify(sessionData));
    localStorage.setItem('ps_session_start', Date.now().toString());

    // Perform logout
    await authService.logout();

    // Verify cleanup
    expect(sessionStorage.getItem('sessionData')).toBeNull();
    expect(localStorage.getItem('ps_session_start')).toBeNull();
    expect(authService.isInGracePeriod()).toBe(false);
  });

  it('should prevent infinite loops with error handling', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Make sessionTimeoutService throw an error
    jest.spyOn(sessionTimeoutService, 'getRemainingTime').mockImplementation(() => {
      throw new Error('Test error');
    });

    // Initialize and render
    await authService.initializeSessionTimeout();
    render(<SessionTimeoutWarning />);

    // Fast forward past grace period
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    // Warning should not be visible despite error
    expect(screen.queryByText('Session Expiring Soon')).not.toBeInTheDocument();

    // Error should be logged but not cause infinite loop
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error checking session status:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});