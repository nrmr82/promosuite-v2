import React, { useState, useRef } from 'react';
import {
  Home,
  Upload,
  X,
  Plus,
  User,
  Camera,
  Tag
} from 'lucide-react';
import './PropertyInput.css';

const PropertyInput = ({ 
  onComplete, 
  onCancel, 
  initialData = {},
  brandData = {} 
}) => {
  const [propertyData, setPropertyData] = useState({
    title: initialData.title || '',
    address: initialData.address || '',
    price: initialData.price || '',
    description: initialData.description || '',
    bedrooms: initialData.bedrooms || '',
    bathrooms: initialData.bathrooms || '',
    squareFootage: initialData.squareFootage || '',
    lotSize: initialData.lotSize || '',
    yearBuilt: initialData.yearBuilt || '',
    propertyType: initialData.propertyType || 'Single Family',
    listingType: initialData.listingType || 'For Sale',
    features: initialData.features || [],
    photos: initialData.photos || [],
    mainImageIndex: initialData.mainImageIndex || 0,
    garage: initialData.garage || '',
    ...initialData
  });

  const [agentData, setAgentData] = useState({
    name: brandData.agentName || initialData.agentName || '',
    phone: brandData.phone || initialData.agentPhone || '',
    email: brandData.email || initialData.agentEmail || '',
    website: brandData.website || initialData.agentWebsite || '',
    license: brandData.license || initialData.agentLicense || '',
    brokerage: brandData.brokerage || initialData.brokerage || '',
    ...brandData
  });

  const [activeTab, setActiveTab] = useState('property');
  const [newFeature, setNewFeature] = useState('');
  const fileInputRef = useRef(null);

  // Property type options
  const propertyTypes = [
    'Single Family',
    'Condominium',
    'Townhouse',
    'Multi-Family',
    'Land',
    'Commercial',
    'Mobile Home',
    'Farm/Ranch',
    'Other'
  ];

  // Listing type options
  const listingTypes = [
    'For Sale',
    'For Rent',
    'Sold',
    'Rented',
    'Coming Soon',
    'Under Contract',
    'Price Reduced'
  ];

  // Common features
  const commonFeatures = [
    'Hardwood Floors',
    'Updated Kitchen',
    'Fireplace',
    'Swimming Pool',
    'Central Air',
    'Walk-in Closet',
    'Granite Countertops',
    'Stainless Steel Appliances',
    'Master Suite',
    'Fenced Yard',
    'Deck/Patio',
    'Basement',
    'Garage',
    'New Construction',
    'Move-in Ready',
    'Great Location',
    'Quiet Neighborhood',
    'Near Schools',
    'Near Shopping',
    'Near Transit'
  ];

  const handleInputChange = (field, value) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAgentInputChange = (field, value) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !propertyData.features.includes(newFeature.trim())) {
      setPropertyData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature) => {
    setPropertyData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleCommonFeatureToggle = (feature) => {
    setPropertyData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPropertyData(prev => ({
            ...prev,
            photos: [...prev.photos, {
              id: Date.now() + Math.random(),
              url: e.target.result,
              name: file.name,
              file: file
            }]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset file input
    event.target.value = '';
  };

  const handleRemovePhoto = (photoId) => {
    setPropertyData(prev => {
      const newPhotos = prev.photos.filter(photo => photo.id !== photoId);
      const newMainIndex = prev.mainImageIndex >= newPhotos.length 
        ? Math.max(0, newPhotos.length - 1)
        : prev.mainImageIndex;
      
      return {
        ...prev,
        photos: newPhotos,
        mainImageIndex: newMainIndex
      };
    });
  };

  const handleSetMainPhoto = (index) => {
    setPropertyData(prev => ({
      ...prev,
      mainImageIndex: index
    }));
  };

  const handleComplete = () => {
    const completeData = {
      ...propertyData,
      agent: agentData,
      mainImage: propertyData.photos[propertyData.mainImageIndex]?.url || null
    };
    
    onComplete(completeData);
  };

  const isFormValid = () => {
    return propertyData.title && 
           propertyData.address && 
           propertyData.price &&
           agentData.name &&
           agentData.phone;
  };

  return (
    <div className="property-input-overlay">
      <div className="property-input-modal">
        <div className="modal-header">
          <h2>Property Information</h2>
          <button className="close-btn" onClick={onCancel}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab ${activeTab === 'property' ? 'active' : ''}`}
            onClick={() => setActiveTab('property')}
          >
            <Home className="w-4 h-4" />
            Property Details
          </button>
          <button
            className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            <Camera className="w-4 h-4" />
            Photos
          </button>
          <button
            className={`tab ${activeTab === 'agent' ? 'active' : ''}`}
            onClick={() => setActiveTab('agent')}
          >
            <User className="w-4 h-4" />
            Agent Info
          </button>
        </div>

        <div className="modal-content">
          {/* Property Details Tab */}
          {activeTab === 'property' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-field full-width">
                    <label>Property Title *</label>
                    <input
                      type="text"
                      value={propertyData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Beautiful Family Home"
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>Address *</label>
                    <input
                      type="text"
                      value={propertyData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="e.g., 123 Main Street, City, State 12345"
                    />
                  </div>

                  <div className="form-field">
                    <label>Price *</label>
                    <input
                      type="text"
                      value={propertyData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="e.g., $450,000"
                    />
                  </div>

                  <div className="form-field">
                    <label>Property Type</label>
                    <select
                      value={propertyData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    >
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Listing Type</label>
                    <select
                      value={propertyData.listingType}
                      onChange={(e) => handleInputChange('listingType', e.target.value)}
                    >
                      {listingTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Property Features</h3>
                <div className="form-grid">
                  <div className="form-field">
                    <label>Bedrooms</label>
                    <input
                      type="number"
                      value={propertyData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                      placeholder="3"
                      min="0"
                    />
                  </div>

                  <div className="form-field">
                    <label>Bathrooms</label>
                    <input
                      type="number"
                      step="0.5"
                      value={propertyData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                      placeholder="2.5"
                      min="0"
                    />
                  </div>

                  <div className="form-field">
                    <label>Square Footage</label>
                    <input
                      type="number"
                      value={propertyData.squareFootage}
                      onChange={(e) => handleInputChange('squareFootage', e.target.value)}
                      placeholder="2000"
                      min="0"
                    />
                  </div>

                  <div className="form-field">
                    <label>Lot Size</label>
                    <input
                      type="text"
                      value={propertyData.lotSize}
                      onChange={(e) => handleInputChange('lotSize', e.target.value)}
                      placeholder="0.25 acres"
                    />
                  </div>

                  <div className="form-field">
                    <label>Year Built</label>
                    <input
                      type="number"
                      value={propertyData.yearBuilt}
                      onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                      placeholder="2020"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div className="form-field">
                    <label>Garage</label>
                    <input
                      type="text"
                      value={propertyData.garage}
                      onChange={(e) => handleInputChange('garage', e.target.value)}
                      placeholder="2-car attached"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Additional Features</h3>
                <div className="features-section">
                  <div className="features-input">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add custom feature"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                    />
                    <button type="button" onClick={handleAddFeature}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="common-features">
                    <h4>Common Features</h4>
                    <div className="features-grid">
                      {commonFeatures.map(feature => (
                        <label key={feature} className="feature-checkbox">
                          <input
                            type="checkbox"
                            checked={propertyData.features.includes(feature)}
                            onChange={() => handleCommonFeatureToggle(feature)}
                          />
                          <span>{feature}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="selected-features">
                    <h4>Selected Features</h4>
                    <div className="feature-tags">
                      {propertyData.features.map((feature, index) => (
                        <span key={index} className="feature-tag">
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(feature)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Description</h3>
                <div className="form-field full-width">
                  <textarea
                    value={propertyData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the property, its features, location, and what makes it special..."
                    rows={6}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Property Photos</h3>
                
                <div className="photo-upload">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5" />
                    Upload Photos
                  </button>
                  <p className="upload-help">
                    Upload multiple photos. The first photo will be used as the main image.
                  </p>
                </div>

                {propertyData.photos.length > 0 && (
                  <div className="photos-grid">
                    {propertyData.photos.map((photo, index) => (
                      <div key={photo.id} className="photo-item">
                        <div className="photo-wrapper">
                          <img src={photo.url} alt={photo.name} />
                          {index === propertyData.mainImageIndex && (
                            <div className="main-photo-badge">Main</div>
                          )}
                          <div className="photo-overlay">
                            <button
                              type="button"
                              className="photo-btn"
                              onClick={() => handleSetMainPhoto(index)}
                              title="Set as main photo"
                            >
                              <Tag className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="photo-btn delete"
                              onClick={() => handleRemovePhoto(photo.id)}
                              title="Remove photo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="photo-name">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {propertyData.photos.length === 0 && (
                  <div className="no-photos">
                    <Camera className="w-12 h-12" />
                    <p>No photos uploaded yet</p>
                    <p>Add photos to showcase your property</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agent Info Tab */}
          {activeTab === 'agent' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Agent Information</h3>
                <div className="form-grid">
                  <div className="form-field full-width">
                    <label>Agent Name *</label>
                    <input
                      type="text"
                      value={agentData.name}
                      onChange={(e) => handleAgentInputChange('name', e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="form-field">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={agentData.phone}
                      onChange={(e) => handleAgentInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={agentData.email}
                      onChange={(e) => handleAgentInputChange('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="form-field">
                    <label>Website</label>
                    <input
                      type="url"
                      value={agentData.website}
                      onChange={(e) => handleAgentInputChange('website', e.target.value)}
                      placeholder="www.johnsmith.com"
                    />
                  </div>

                  <div className="form-field">
                    <label>License Number</label>
                    <input
                      type="text"
                      value={agentData.license}
                      onChange={(e) => handleAgentInputChange('license', e.target.value)}
                      placeholder="RE123456"
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>Brokerage</label>
                    <input
                      type="text"
                      value={agentData.brokerage}
                      onChange={(e) => handleAgentInputChange('brokerage', e.target.value)}
                      placeholder="ABC Real Estate"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn-primary ${!isFormValid() ? 'disabled' : ''}`}
            onClick={handleComplete}
            disabled={!isFormValid()}
          >
            Continue to Editor
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyInput;
