import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Shield } from 'lucide-react';
import './DeleteAccountModal.css';

const DeleteAccountModal = ({ isOpen, onClose, onConfirmDelete, user, loading = false }) => {
  const [step, setStep] = useState(1); // 1: Initial warning, 2: Confirmation with typing
  const [confirmationText, setConfirmationText] = useState('');
  const [understood, setUnderstood] = useState(false);

  const resetModal = () => {
    setStep(1);
    setConfirmationText('');
    setUnderstood(false);
  };

  const handleClose = () => {
    if (!loading) {
      resetModal();
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  const handleProceedToConfirmation = () => {
    if (understood) {
      setStep(2);
    }
  };

  const handleDeleteAccount = () => {
    if (confirmationText === 'DELETE' && onConfirmDelete) {
      onConfirmDelete();
    }
  };

  const handleGoBack = () => {
    setStep(1);
    setConfirmationText('');
  };

  if (!isOpen) return null;

  return (
    <div className="delete-account-overlay" onClick={handleOverlayClick}>
      <div className="delete-account-modal">
        <div className="delete-account-header">
          <div className="header-content">
            <div className="warning-icon">
              <AlertTriangle size={24} />
            </div>
            <h2>Delete Account</h2>
          </div>
          {!loading && (
            <button className="close-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="delete-account-content">
          {step === 1 && (
            <>
              {/* Step 1: Initial Warning */}
              <div className="warning-section">
                <div className="warning-message">
                  <h3>⚠️ This action cannot be undone</h3>
                  <p>
                    Deleting your account will permanently remove all of your data, including:
                  </p>
                </div>
                
                <div className="data-list">
                  <div className="data-item">
                    <Trash2 size={16} />
                    <span>All your flyers and designs</span>
                  </div>
                  <div className="data-item">
                    <Trash2 size={16} />
                    <span>Social media posts and templates</span>
                  </div>
                  <div className="data-item">
                    <Trash2 size={16} />
                    <span>Media uploads and assets</span>
                  </div>
                  <div className="data-item">
                    <Trash2 size={16} />
                    <span>Account settings and preferences</span>
                  </div>
                  <div className="data-item">
                    <Trash2 size={16} />
                    <span>Subscription and billing information</span>
                  </div>
                  <div className="data-item">
                    <Trash2 size={16} />
                    <span>Usage analytics and history</span>
                  </div>
                </div>

                <div className="alternative-section">
                  <div className="alternative-header">
                    <Shield size={20} />
                    <h4>Consider these alternatives:</h4>
                  </div>
                  <ul>
                    <li>Export your data before deleting</li>
                    <li>Cancel your subscription instead</li>
                    <li>Contact support for account suspension</li>
                  </ul>
                </div>

                <div className="understanding-check">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={understood}
                      onChange={(e) => setUnderstood(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    I understand that this action is permanent and cannot be undone
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger" 
                  onClick={handleProceedToConfirmation}
                  disabled={!understood || loading}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Step 2: Final Confirmation */}
              <div className="confirmation-section">
                <div className="final-warning">
                  <h3>🚨 Final Confirmation Required</h3>
                  <p>
                    You are about to permanently delete the account for{' '}
                    <strong>{user?.email || user?.profile?.email}</strong>
                  </p>
                  <p className="emphasis-text">
                    This will immediately remove all your data and cannot be reversed.
                  </p>
                </div>

                <div className="type-confirmation">
                  <label htmlFor="confirmation-input">
                    Type <strong>DELETE</strong> to confirm:
                  </label>
                  <input
                    id="confirmation-input"
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                    placeholder="Type DELETE here"
                    className="confirmation-input"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {loading && (
                  <div className="deletion-progress">
                    <div className="loading-spinner"></div>
                    <p>Deleting your account and all associated data...</p>
                    <p className="loading-subtext">This may take a few moments.</p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={handleGoBack}
                  disabled={loading}
                >
                  Go Back
                </button>
                <button 
                  className="btn-danger-confirm" 
                  onClick={handleDeleteAccount}
                  disabled={confirmationText !== 'DELETE' || loading}
                >
                  {loading ? 'Deleting...' : 'Delete Account Forever'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;