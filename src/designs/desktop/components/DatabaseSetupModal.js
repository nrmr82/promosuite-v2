import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, ExternalLink, Copy, RefreshCw } from 'lucide-react';
import { databaseInit } from '../utils/databaseInit';
import './DatabaseSetupModal.css';

const DatabaseSetupModal = ({ isOpen, onClose, onSetupComplete }) => {
  const [status, setStatus] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const dbStatus = await databaseInit.getDatabaseStatus();
      setStatus(dbStatus);
      setInstructions(databaseInit.getSetupInstructions(dbStatus));
    } catch (error) {
      console.error('Failed to check database status:', error);
      setStatus({ isHealthy: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const recheckStatus = async () => {
    // Reset the database initializer cache
    databaseInit.resetSetupCheck();
    await checkStatus();
    
    if (status?.isHealthy) {
      setTimeout(() => {
        onSetupComplete?.();
        onClose();
      }, 1000);
    }
  };

  const copySetupScript = async () => {
    try {
      // Copy setup instructions instead of the full script
      const instructions = `Go to your Supabase SQL Editor and run the script from your project folder:
\ndatabase/safe_setup.sql
\nThis script will safely set up your profiles table and fix the 406 errors.`;
      await navigator.clipboard.writeText(instructions);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy instructions:', error);
      // Show alert as fallback
      alert('Please manually run the database/safe_setup.sql script in your Supabase SQL Editor to fix the database setup.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="database-setup-modal-overlay">
      <div className="database-setup-modal">
        <div className="database-setup-header">
          <div className="database-setup-title">
            <AlertTriangle className="title-icon" />
            <h2>Database Setup Required</h2>
          </div>
          <button className="database-setup-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="database-setup-content">
          {loading ? (
            <div className="loading-state">
              <RefreshCw className="loading-spinner" />
              <p>Checking database status...</p>
            </div>
          ) : status?.isHealthy ? (
            <div className="success-state">
              <CheckCircle className="success-icon" />
              <h3>Database Setup Complete! 🎉</h3>
              <p>Your database is properly configured and ready to use.</p>
              <button 
                className="btn-primary"
                onClick={() => {
                  onSetupComplete?.();
                  onClose();
                }}
              >
                Continue to App
              </button>
            </div>
          ) : (
            <div className="setup-required-state">
              <div className="status-section">
                <h3>Current Status</h3>
                <div className="status-details">
                  {status?.details && Object.entries(status.details).map(([key, value]) => (
                    <div key={key} className="status-item">
                      <span className="status-text">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {status?.issues && status.issues.length > 0 && (
                <div className="issues-section">
                  <h3>Issues Detected</h3>
                  <ul className="issues-list">
                    {status.issues.map((issue, index) => (
                      <li key={index} className="issue-item">
                        <AlertTriangle className="issue-icon" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {instructions && (
                <div className="instructions-section">
                  <h3>{instructions.title}</h3>
                  <p className="instructions-description">{instructions.message}</p>
                  
                  <div className="setup-steps">
                    {instructions.steps.map((step, index) => (
                      <div key={index} className="setup-step">
                        <div className="step-number">{step.step}</div>
                        <div className="step-content">
                          <h4>{step.title}</h4>
                          <p>{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="action-buttons">
                    <button 
                      className="btn-secondary"
                      onClick={copySetupScript}
                      disabled={copied}
                    >
                      <Copy className="btn-icon" />
                      {copied ? 'Copied!' : 'Copy Setup Script'}
                    </button>
                    
                    <a 
                      href="https://app.supabase.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      <ExternalLink className="btn-icon" />
                      Open Supabase Dashboard
                    </a>
                  </div>
                </div>
              )}

              <div className="recheck-section">
                <p className="recheck-description">
                  After running the setup script, click below to verify the setup:
                </p>
                <button 
                  className="btn-outline"
                  onClick={recheckStatus}
                  disabled={loading}
                >
                  <RefreshCw className={`btn-icon ${loading ? 'spinning' : ''}`} />
                  Recheck Database Status
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="database-setup-footer">
          <p className="footer-note">
            💡 This setup is only needed once. After completion, your app will work seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetupModal;
