import React, { useState } from 'react';
import Icon from '../components/Icon';
import DeleteAccountModal from '../components/DeleteAccountModal';
import accountDeletionService from '../services/accountDeletionService';
import './Settings.css';

const Settings = ({ user, onLogout }) => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: false,
      security: true
    },
    appearance: {
      theme: 'dark',
      sidebarCollapsed: false,
      animationsEnabled: true
    },
    privacy: {
      analytics: true,
      cookies: true,
      dataSharing: false
    },
    language: 'en-US',
    timezone: 'America/New_York'
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionError, setDeletionError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateTopLevelSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    setHasChanges(false);
    // Here you would typically make an API call to save settings
  };

  const handleReset = () => {
    // Reset to defaults or previously saved state
    setHasChanges(false);
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      // TODO: Implement actual data export functionality
      // For now, show a placeholder message
      alert('Data export functionality will be implemented soon. Please contact support if you need your data immediately.');
    } catch (error) {
      console.error('Export data error:', error);
      alert('Failed to export data. Please try again or contact support.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    // Verify user eligibility for account deletion
    const eligibility = accountDeletionService.verifyDeletionEligibility(user);
    
    if (!eligibility.eligible) {
      alert(`Cannot delete account: ${eligibility.reason}`);
      return;
    }

    setDeletionError('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeletionLoading(true);
    setDeletionError('');
    
    try {
      const result = await accountDeletionService.deleteUserAccount(onLogout);
      
      if (!result.success) {
        setDeletionError(result.message);
        return;
      }
      
      // Success - modal will be closed by redirection
      console.log('Account deletion successful');
      
    } catch (error) {
      console.error('Account deletion error:', error);
      setDeletionError(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deletionLoading) {
      setShowDeleteModal(false);
      setDeletionError('');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-title-section">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize your PromoSuite experience</p>
        </div>

        {hasChanges && (
          <div className="settings-actions">
            <button className="btn-secondary" onClick={handleReset}>
              <Icon name="close" /> Discard Changes
            </button>
            <button className="btn-primary" onClick={handleSave}>
              <Icon name="save" /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="settings-content">
        {/* Notifications Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Icon name="notifications" className="card-icon" />
            <h3>Notifications</h3>
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive updates about your account and projects</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Push Notifications</h4>
                <p>Get real-time updates in your browser</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Marketing Updates</h4>
                <p>Receive news about new features and promotions</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.marketing}
                  onChange={(e) => updateSetting('notifications', 'marketing', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Security Alerts</h4>
                <p>Important security notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.security}
                  onChange={(e) => updateSetting('notifications', 'security', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Icon name="palette" className="card-icon" />
            <h3>Appearance</h3>
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Theme</h4>
                <p>Choose your preferred color scheme</p>
              </div>
              <select
                className="setting-select"
                value={settings.appearance.theme}
                onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Animations</h4>
                <p>Enable smooth transitions and animations</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.appearance.animationsEnabled}
                  onChange={(e) => updateSetting('appearance', 'animationsEnabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Icon name="shield" className="card-icon" />
            <h3>Privacy & Security</h3>
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Analytics</h4>
                <p>Help improve our service by sharing usage data</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.analytics}
                  onChange={(e) => updateSetting('privacy', 'analytics', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Cookies</h4>
                <p>Allow cookies for better experience</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.cookies}
                  onChange={(e) => updateSetting('privacy', 'cookies', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Data Sharing</h4>
                <p>Share data with third-party integrations</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.dataSharing}
                  onChange={(e) => updateSetting('privacy', 'dataSharing', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Localization Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Icon name="language" className="card-icon" />
            <h3>Language & Region</h3>
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Language</h4>
                <p>Choose your preferred language</p>
              </div>
              <select
                className="setting-select"
                value={settings.language}
                onChange={(e) => updateTopLevelSetting('language', e.target.value)}
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Timezone</h4>
                <p>Set your local timezone</p>
              </div>
              <select
                className="setting-select"
                value={settings.timezone}
                onChange={(e) => updateTopLevelSetting('timezone', e.target.value)}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div className="settings-card danger-card">
          <div className="settings-card-header">
            <Icon name="delete" className="card-icon" />
            <h3>Account Management</h3>
          </div>
          <div className="settings-grid">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Export Data</h4>
                  <p>Download a copy of your account data</p>
                </div>
                <button 
                  className="btn-outline"
                  onClick={handleExportData}
                  disabled={exportLoading}
                >
                  {exportLoading ? 'Exporting...' : 'Export Data'}
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account and all data</p>
                  {deletionError && (
                    <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      {deletionError}
                    </p>
                  )}
                </div>
                <button 
                  className="btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={deletionLoading}
                >
                  {deletionLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirmDelete={handleConfirmDelete}
        user={user}
        loading={deletionLoading}
      />
    </div>
  );
};

export default Settings;
