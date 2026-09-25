import { render, screen } from '@testing-library/react';
import App from './App';
import authService from './services/authService';

// The canvas editors pull in ESM-only packages (polotno, fabric) that Jest
// can't parse, and none of them render for a signed-out visitor.
jest.mock('./components/FlyerStudio/FlyerStudio', () => () => null);
jest.mock('./components/UnifiedImageEditor/UnifiedImageEditor', () => () => null);
jest.mock('./components/PortraitStudio/PortraitStudio', () => () => null);

// Keep app initialization offline.
jest.mock('./services/authService', () => ({
  __esModule: true,
  default: {
    initializeSessionTimeout: jest.fn(),
    checkInitialSessionValidity: jest.fn(),
    initializeAuth: jest.fn(),
    getCurrentUserSync: jest.fn(),
    onAuthStateChange: jest.fn(),
    isInGracePeriod: jest.fn(),
    logout: jest.fn()
  }
}));

beforeEach(() => {
  authService.checkInitialSessionValidity.mockReturnValue(true);
  authService.getCurrentUserSync.mockReturnValue(null);
  authService.onAuthStateChange.mockReturnValue({ data: { subscription: null } });
});

test('shows the loading screen while the app initializes', () => {
  authService.initializeAuth.mockReturnValue(new Promise(() => {}));

  render(<App />);

  expect(screen.getByText('Loading PromoSuite...')).toBeInTheDocument();
});

test('shows the landing page when no user is signed in', async () => {
  authService.initializeAuth.mockResolvedValue(null);

  render(<App />);

  expect(
    await screen.findByText('Everything You Need to Scale Your Marketing')
  ).toBeInTheDocument();
  expect(authService.initializeSessionTimeout).toHaveBeenCalled();
});
