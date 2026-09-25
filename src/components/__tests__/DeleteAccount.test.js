import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteAccountModal from '../DeleteAccountModal';
import Settings from '../../pages/Settings';
import accountDeletionService from '../../services/accountDeletionService';

// jest.mock factories are hoisted above imports, so the mock is defined inline
jest.mock('../../services/accountDeletionService', () => ({
  __esModule: true,
  default: {
    verifyDeletionEligibility: jest.fn(),
    deleteUserAccount: jest.fn()
  }
}));

// Mock auth service
jest.mock('../../services/authService', () => ({
  __esModule: true,
  default: {
    deleteAccount: jest.fn()
  }
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
    accountDeletionService.verifyDeletionEligibility.mockReturnValue({ eligible: true, reason: null });
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

    it('proceeds to step 2 when Continue is clicked', () => {
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
      expect(screen.getByText('🚨 Final Confirmation Required')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type DELETE here')).toBeInTheDocument();
    });

    it('requires typing DELETE to enable final confirmation', () => {
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

      const confirmationInput = screen.getByPlaceholderText('Type DELETE here');
      const deleteButton = screen.getByText('Delete Account Forever');

      expect(deleteButton).toBeDisabled();

      fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });

      expect(deleteButton).not.toBeDisabled();
    });

    it('calls onConfirmDelete when final button is clicked', () => {
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

      const confirmationInput = screen.getByPlaceholderText('Type DELETE here');
      fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });

      const deleteButton = screen.getByText('Delete Account Forever');
      fireEvent.click(deleteButton);

      expect(mockOnConfirmDelete).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during deletion', () => {
      const mockOnConfirmDelete = jest.fn();

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

      // Step 2 appears; type DELETE
      expect(screen.getByText('🚨 Final Confirmation Required')).toBeInTheDocument();

      const confirmationInput = screen.getByPlaceholderText('Type DELETE here');
      fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });

      const deleteButton = screen.getByText('Delete Account Forever');
      fireEvent.click(deleteButton);

      // Now check if loading states appear
      expect(mockOnConfirmDelete).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Deleting your account and all associated data...')).toBeInTheDocument();
      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });
  });

  describe('Settings Page Integration', () => {
    it('shows delete account button in settings', () => {
      render(<Settings user={mockUser} onLogout={mockOnLogout} />);

      expect(screen.getByRole('button', { name: 'Delete Account' })).toBeInTheDocument();
      expect(screen.getByText('Permanently delete your account and all data')).toBeInTheDocument();
    });

    it('opens modal when delete account button is clicked', () => {
      render(<Settings user={mockUser} onLogout={mockOnLogout} />);

      const deleteButton = screen.getByRole('button', { name: 'Delete Account' });
      fireEvent.click(deleteButton);

      expect(screen.getByText('⚠️ This action cannot be undone')).toBeInTheDocument();
    });

    it('deletes the account via accountDeletionService and shows failures', async () => {
      accountDeletionService.deleteUserAccount.mockResolvedValue({
        success: false,
        message: 'Server deletion failed'
      });

      render(<Settings user={mockUser} onLogout={mockOnLogout} />);

      fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
      fireEvent.click(screen.getByLabelText(/I understand that this action is permanent/));
      fireEvent.click(screen.getByText('Continue'));
      fireEvent.change(screen.getByPlaceholderText('Type DELETE here'), { target: { value: 'DELETE' } });
      fireEvent.click(screen.getByText('Delete Account Forever'));

      expect(accountDeletionService.verifyDeletionEligibility).toHaveBeenCalledWith(mockUser);
      expect(accountDeletionService.deleteUserAccount).toHaveBeenCalledWith(mockOnLogout);
      expect(await screen.findByText('Server deletion failed')).toBeInTheDocument();
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