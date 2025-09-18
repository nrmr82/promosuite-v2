import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from '../../pages/Profile';

// Mock the subscription service
jest.mock('../../services/subscriptionService', () => ({
  openCustomerPortal: jest.fn(),
  getUsageBreakdown: jest.fn()
}));

// Mock the UsagePopup component
jest.mock('../../components/UsagePopup', () => {
  return function MockUsagePopup({ isOpen, onClose }) {
    return isOpen ? (
      <div data-testid="usage-popup">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

describe('Profile Component', () => {
  const mockUser = {
    profile: {
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company_name: 'Test Company',
      avatar_url: null
    },
    email: 'john@example.com',
    subscription: {
      plan: 'Free',
      status: 'active',
      planType: 'free'
    }
  };

  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile information correctly', () => {
    render(<Profile user={mockUser} onNavigate={mockOnNavigate} />);
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('Free Plan')).toBeInTheDocument();
  });

  it('shows Manage Subscription and View Usage buttons', () => {
    render(<Profile user={mockUser} onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Manage Subscription')).toBeInTheDocument();
    expect(screen.getByText('View Usage')).toBeInTheDocument();
  });

  it('calls onNavigate with pricing when Manage Subscription is clicked for free users', async () => {
    render(<Profile user={mockUser} onNavigate={mockOnNavigate} />);
    
    const manageButton = screen.getByText('Manage Subscription');
    fireEvent.click(manageButton);

    await waitFor(() => {
      expect(mockOnNavigate).toHaveBeenCalledWith('pricing');
    });
  });

  it('opens Usage popup when View Usage is clicked', () => {
    render(<Profile user={mockUser} onNavigate={mockOnNavigate} />);
    
    const viewUsageButton = screen.getByText('View Usage');
    fireEvent.click(viewUsageButton);

    expect(screen.getByTestId('usage-popup')).toBeInTheDocument();
  });

  it('does not show Account Security section', () => {
    render(<Profile user={mockUser} onNavigate={mockOnNavigate} />);
    
    expect(screen.queryByText('Account Security')).not.toBeInTheDocument();
    expect(screen.queryByText('Change Password')).not.toBeInTheDocument();
    expect(screen.queryByText('Two-Factor Authentication')).not.toBeInTheDocument();
  });

  it('allows editing profile information', () => {
    render(<Profile user={mockUser} onNavigate={mockOnNavigate} />);
    
    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    // Should show Cancel and Save buttons in edit mode
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
});