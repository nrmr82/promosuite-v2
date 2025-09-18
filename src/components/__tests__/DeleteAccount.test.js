import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteAccountModal from '../DeleteAccountModal';
import Settings from '../../pages/Settings';

// Mock the account deletion service
const mockAccountDeletionService = {
  verifyDeletionEligibility: jest.fn(() => ({ eligible: true, reason: null })),
  deleteUserAccount: jest.fn()
};
jest.mock('../../services/accountDeletionService', () => mockAccountDeletionService);

// Mock auth service
jest.mock('../../services/authService', () => ({
  deleteAccount: jest.fn()
}));

describe('Account Deletion', () => {
  const mockUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    profile: {
      full_name: 'Test User',
      email: 'test@example.com'
    }
  };

  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DeleteAccountModal', () => {
    it('renders step 1 warning when opened', () => {
      render(
        <DeleteAccountModal
          isOpen={true}
          onClose={() => {}}
          onConfirmDelete={() => {}}
          user={mockUser}
          loading={false}
        />
      );

      expect(screen.getByText('Delete Account')).toBeInTheDocument();
      expect(screen.getByText('⚠️ This action cannot be undone')).toBeInTheDocument();
      expect(screen.getByText('All your flyers and designs')).toBeInTheDocument();
      expect(screen.getByText('Continue')).toBeDisabled();
    });

    it('enables Continue button when user checks understanding', () => {
      render(
        <DeleteAccountModal
          isOpen={true}
          onClose={() => {}}
          onConfirmDelete={() => {}}
          user={mockUser}
          loading={false}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(screen.getByText('Continue')).not.toBeDisabled();
    });

    it('proceeds to step 2 when Continue is clicked', async () => {
      render(
        <DeleteAccountModal
          isOpen={true}
          onClose={() => {}}
          onConfirmDelete={() => {}}
          user={mockUser}
          loading={false}
        />
      );

      // Check the understanding checkbox
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Click Continue
      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      // Should now show step 2
      await waitFor(() => {
        expect(screen.getByText('🚨 Final Confirmation Required')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type DELETE here')).toBeInTheDocument();
      });
    });

    it('requires typing DELETE to enable final confirmation', async () => {
      render(
        <DeleteAccountModal
          isOpen={true}
          onClose={() => {}}
          onConfirmDelete={() => {}}
          user={mockUser}
          loading={false}
        />
      );

      // Get to step 2
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      await waitFor(() => {
        const confirmationInput = screen.getByPlaceholderText('Type DELETE here');
        const deleteButton = screen.getByText('Delete Account Forever');

        expect(deleteButton).toBeDisabled();

        fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });

        expect(deleteButton).not.toBeDisabled();
      });
    });

    it('calls onConfirmDelete when final button is clicked', async () => {
      const mockOnConfirmDelete = jest.fn();
      
      render(
        <DeleteAccountModal
          isOpen={true}
          onClose={() => {}}
          onConfirmDelete={mockOnConfirmDelete}
          user={mockUser}
          loading={false}
        />
      );

      // Get to step 2 and type DELETE
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      await waitFor(async () => {
        const confirmationInput = screen.getByPlaceholderText('Type DELETE here');
        fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });

        const deleteButton = screen.getByText('Delete Account Forever');
        fireEvent.click(deleteButton);

        expect(mockOnConfirmDelete).toHaveBeenCalled();
      });
    });

    it('shows loading state during deletion', async () => {
      let loadingState = false;
      const mockOnConfirmDelete = jest.fn(() => {
        loadingState = true;
      });

      const TestWrapper = () => {
        const [loading, setLoading] = React.useState(false);
        
        const handleConfirmDelete = () => {
          setLoading(true);
          mockOnConfirmDelete();
        };

        return (
          <DeleteAccountModal
            isOpen={true}
            onClose={() => {}}
            onConfirmDelete={handleConfirmDelete}
            user={mockUser}
            loading={loading}
          />
        );
      };

      render(<TestWrapper />);

      // First proceed to step 2
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);

      // Wait for step 2 to appear and type DELETE
      await waitFor(() => {
        expect(screen.getByText('🚨 Final Confirmation Required')).toBeInTheDocument();
      });

      const confirmationInput = screen.getByPlaceholderText('Type DELETE here');
      fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });

      const deleteButton = screen.getByText('Delete Account Forever');
      fireEvent.click(deleteButton);

      // Now check if loading states appear
      await waitFor(() => {
        expect(screen.getByText('Deleting your account and all associated data...')).toBeInTheDocument();
        expect(screen.getByText('Deleting...')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Page Integration', () => {
    it('shows delete account button in settings', () => {
      render(<Settings user={mockUser} onLogout={mockOnLogout} />);

      expect(screen.getByRole('button', { name: 'Delete Account' })).toBeInTheDocument();
      expect(screen.getByText('Permanently delete your account and all data')).toBeInTheDocument();
    });

    it('opens modal when delete account button is clicked', async () => {
      render(<Settings user={mockUser} onLogout={mockOnLogout} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete Account' });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('⚠️ This action cannot be undone')).toBeInTheDocument();
      });
    });

    it('shows export data button', () => {
      render(<Settings user={mockUser} onLogout={mockOnLogout} />);

      expect(screen.getByRole('button', { name: 'Export Data' })).toBeInTheDocument();
      expect(screen.getByText('Download a copy of your account data')).toBeInTheDocument();
    });
  });

  describe('Modal does not render when closed', () => {
    it('does not render modal when isOpen is false', () => {
      render(
        <DeleteAccountModal
          isOpen={false}
          onClose={() => {}}
          onConfirmDelete={() => {}}
          user={mockUser}
          loading={false}
        />
      );

      expect(screen.queryByText('Delete Account')).not.toBeInTheDocument();
    });
  });
});