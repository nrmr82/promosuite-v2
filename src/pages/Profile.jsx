import React, { useState } from 'react';
import Icon from '../components/Icon';
import UsagePopup from '../components/UsagePopup';
import subscriptionService from '../services/subscriptionService';
import './Profile.css';

const Profile = ({ user: initialUser, onNavigate }) => {
  
  // Use actual user data, with fallback for missing fields
  const [user, setUser] = useState({
    name: initialUser?.profile?.full_name || initialUser?.email?.split('@')[0] || 'User',
    email: initialUser?.email || 'user@example.com',
    phone: initialUser?.profile?.phone || '',
    location: initialUser?.profile?.location || '',
    company: initialUser?.profile?.company_name || '',
    website: initialUser?.profile?.website || '',
    bio: initialUser?.profile?.bio || '',
    avatar: initialUser?.profile?.avatar_url || null,
    subscription: {
      plan: initialUser?.subscription?.plan || initialUser?.profile?.subscription_plan || 'Free',
      status: initialUser?.subscription?.status || initialUser?.profile?.subscription_status || 'active',
      nextBilling: initialUser?.subscription?.nextBilling || 'N/A',
      planType: initialUser?.subscription?.planType || initialUser?.profile?.subscription_plan || 'free'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showUsagePopup, setShowUsagePopup] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, revert changes
      setEditedUser(user);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
    console.log('Profile updated:', editedUser);
    // Here you would typically make an API call to save the profile
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadingAvatar(true);
      
      // Create a temporary URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedUser(prev => ({
          ...prev,
          avatar: e.target.result
        }));
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
      
      // In a real app, you'd upload to your storage service here
      console.log('Uploading avatar:', file.name);
    }
  };

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    
    try {
      if (user.subscription.planType === 'free') {
        // Redirect to pricing page for free users
        if (onNavigate) {
          onNavigate('pricing');
        }
      } else {
        // Open Stripe customer portal for paid users
        const url = await subscriptionService.openCustomerPortal();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Manage subscription error:', error);
      // Show error message to user
      alert('Unable to open subscription management. Please try again later.');
    } finally {
      setManagingSubscription(false);
    }
  };

  const handleViewUsage = () => {
    setShowUsagePopup(true);
  };

  const currentData = isEditing ? editedUser : user;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-title-section">
          <h1 className="profile-title">Profile</h1>
          <p className="profile-subtitle">Manage your account information and preferences</p>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button className="btn-secondary" onClick={handleEditToggle}>
                <Icon name="close" /> Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                <Icon name="save" /> Save Changes
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={handleEditToggle}>
              <Icon name="edit" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-card avatar-card">
          <div className="avatar-section">
            <div className="avatar-container">
              {currentData.avatar ? (
                <img src={currentData.avatar} alt={currentData.name} className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <Icon name="person" />
                </div>
              )}
              {isEditing && (
                <div className="avatar-overlay">
                  <label htmlFor="avatar-upload" className="avatar-upload-label">
                    <Icon name="camera_alt" />
                    {uploadingAvatar && <div className="upload-spinner"></div>}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
            <div className="avatar-info">
              <h3 className="user-display-name">{currentData.name}</h3>
              <p className="user-email">{currentData.email}</p>
              {currentData.subscription && (
                <span className="subscription-badge">
                  {currentData.subscription.plan} Member
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-cards-grid">
          {/* Basic Information */}
          <div className="profile-card">
            <h3 className="card-title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <Icon name="person" className="field-icon" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={editedUser.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="form-value">{currentData.name}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Icon name="mail" className="field-icon" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    className="form-input"
                    value={editedUser.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="form-value">{currentData.email}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Icon name="phone" className="field-icon" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    className="form-input"
                    value={editedUser.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="form-value">{currentData.phone}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Icon name="location_on" className="field-icon" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={editedUser.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="form-value">{currentData.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="profile-card">
            <h3 className="card-title">Professional Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <Icon name="business" className="field-icon" />
                  Company
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-input"
                    value={editedUser.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Enter your company name"
                  />
                ) : (
                  <p className="form-value">{currentData.company}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Icon name="language" className="field-icon" />
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    className="form-input"
                    value={editedUser.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="Enter your website URL"
                  />
                ) : (
                  <p className="form-value">
                    <a href={`https://${currentData.website}`} target="_blank" rel="noopener noreferrer">
                      {currentData.website}
                    </a>
                  </p>
                )}
              </div>

              <div className="form-group full-width">
                <label className="form-label">Bio</label>
                {isEditing ? (
                  <textarea
                    className="form-textarea"
                    value={editedUser.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself and your expertise..."
                    rows="4"
                  />
                ) : (
                  <p className="form-value">{currentData.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="profile-card">
            <h3 className="card-title">Subscription</h3>
            <div className="subscription-info">
              <div className="subscription-status">
                <div className="subscription-plan">
                  <span className="plan-name">{currentData.subscription?.plan || 'Free'} Plan</span>
                  <span className={`status-badge ${currentData.subscription?.status || 'inactive'}`}>
                    {currentData.subscription?.status || 'Inactive'}
                  </span>
                </div>
                {currentData.subscription?.nextBilling && (
                  <p className="billing-info">
                    Next billing: {new Date(currentData.subscription.nextBilling).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="subscription-actions">
                <button 
                  className="btn-outline"
                  onClick={handleManageSubscription}
                  disabled={managingSubscription}
                >
                  {managingSubscription ? 'Loading...' : 'Manage Subscription'}
                </button>
                <button className="btn-outline" onClick={handleViewUsage}>
                  View Usage
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Usage Popup */}
      <UsagePopup 
        isOpen={showUsagePopup}
        onClose={() => setShowUsagePopup(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default Profile;
