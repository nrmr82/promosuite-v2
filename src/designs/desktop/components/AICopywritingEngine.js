import React, { useState } from 'react';
import { 
  Type, 
  Sparkles, 
  Copy, 
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import aiService from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

const AICopywritingEngine = ({ onComplete, onCancel, initialData = {} }) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);
  const [copyType, setCopyType] = useState('full');
  
  // Property data state
  const [propertyData, setPropertyData] = useState({
    address: initialData.address || '',
    price: initialData.price || '',
    bedrooms: initialData.bedrooms || '',
    bathrooms: initialData.bathrooms || '',
    squareFeet: initialData.squareFeet || '',
    propertyType: initialData.propertyType || 'residential',
    description: initialData.description || '',
    features: initialData.features || []
  });

  // User preferences
  const [preferences, setPreferences] = useState({
    tone: 'professional',
    focusAreas: ['location', 'features'],
    targetAudience: 'general'
  });

  const copyTypes = [
    { value: 'full', label: 'Complete Marketing Package', description: 'Headlines, descriptions, and calls-to-action' },
    { value: 'headlines', label: 'Headlines Only', description: 'Attention-grabbing headlines and taglines' },
    { value: 'descriptions', label: 'Property Descriptions', description: 'Detailed property descriptions' },
    { value: 'social', label: 'Social Media Copy', description: 'Posts for Facebook, Instagram, etc.' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'luxury', label: 'Luxury & Premium' },
    { value: 'friendly', label: 'Warm & Friendly' },
    { value: 'urgent', label: 'Urgent & Compelling' }
  ];

  const targetAudiences = [
    { value: 'general', label: 'General Buyers' },
    { value: 'firsttime', label: 'First-Time Buyers' },
    { value: 'investors', label: 'Investors' },
    { value: 'luxury', label: 'Luxury Buyers' },
    { value: 'families', label: 'Families' }
  ];

  const generateContent = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Check if user can use AI
      const canUse = await aiService.canUserUseAI(user?.id, 'ai_copywriting');
      if (!canUse.canUse) {
        throw new Error(canUse.reason === 'authentication_required' 
          ? 'Please log in to use AI copywriting'
          : 'You have reached your AI usage limit for this month'
        );
      }

      // First analyze the property
      const analysis = await aiService.analyzeProperty(propertyData);
      
      // Then generate marketing content
      const content = await aiService.generateMarketingContent(
        propertyData, 
        analysis, 
        {
          ...preferences,
          userId: user?.id,
          copyType: copyType
        }
      );

      setGeneratedContent({
        content,
        analysis,
        copyType,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI copywriting failed:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateContent = async () => {
    await generateContent();
  };

  const handleComplete = () => {
    if (generatedContent) {
      onComplete({
        type: 'copywriting',
        data: generatedContent,
        propertyData,
        preferences
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  return (
    <div className="ai-copywriting-modal modal-overlay">
      <div className="ai-copywriting-container modal-content">
        {/* Header */}
        <div className="ai-modal-header">
          <div className="header-content">
            <div className="modal-title">
              <Type className="title-icon" />
              <h2>AI Copywriting Engine</h2>
              <span className="ai-badge-small">AI-POWERED</span>
            </div>
            <p className="modal-subtitle">
              Generate compelling marketing copy that converts viewers into buyers
            </p>
          </div>
          <button className="modal-close" onClick={onCancel}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="ai-modal-body">
          {!generatedContent ? (
            // Input Form
            <div className="copywriting-form">
              {/* Copy Type Selection */}
              <div className="form-section">
                <h3>What type of copy do you need?</h3>
                <div className="copy-type-grid">
                  {copyTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`copy-type-card ${copyType === type.value ? 'selected' : ''}`}
                      onClick={() => setCopyType(type.value)}
                    >
                      <div className="copy-type-header">
                        <FileText className="w-5 h-5" />
                        <h4>{type.label}</h4>
                      </div>
                      <p>{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Information */}
              <div className="form-section">
                <h3>Property Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Property Address</label>
                    <input
                      type="text"
                      value={propertyData.address}
                      onChange={(e) => setPropertyData({...propertyData, address: e.target.value})}
                      placeholder="123 Main Street, City"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="text"
                      value={propertyData.price}
                      onChange={(e) => setPropertyData({...propertyData, price: e.target.value})}
                      placeholder="$500,000"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bedrooms</label>
                    <input
                      type="number"
                      value={propertyData.bedrooms}
                      onChange={(e) => setPropertyData({...propertyData, bedrooms: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bathrooms</label>
                    <input
                      type="number"
                      value={propertyData.bathrooms}
                      onChange={(e) => setPropertyData({...propertyData, bathrooms: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>Property Description (Optional)</label>
                  <textarea
                    value={propertyData.description}
                    onChange={(e) => setPropertyData({...propertyData, description: e.target.value})}
                    placeholder="Brief description of the property..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="form-section">
                <h3>Writing Preferences</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tone</label>
                    <select
                      value={preferences.tone}
                      onChange={(e) => setPreferences({...preferences, tone: e.target.value})}
                      className="form-input"
                    >
                      {toneOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Target Audience</label>
                    <select
                      value={preferences.targetAudience}
                      onChange={(e) => setPreferences({...preferences, targetAudience: e.target.value})}
                      className="form-input"
                    >
                      {targetAudiences.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Generated Content Display
            <div className="generated-content">
              <div className="content-header">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3>Your AI-Generated Copy is Ready!</h3>
                <button 
                  className="regenerate-btn"
                  onClick={regenerateContent}
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>

              <div className="content-sections">
                {generatedContent.content.headline && (
                  <div className="content-section">
                    <div className="section-header">
                      <h4>Main Headline</h4>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(generatedContent.content.headline)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                    <div className="content-text headline">
                      {generatedContent.content.headline}
                    </div>
                  </div>
                )}

                {generatedContent.content.description && (
                  <div className="content-section">
                    <div className="section-header">
                      <h4>Property Description</h4>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(generatedContent.content.description)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                    <div className="content-text">
                      {generatedContent.content.description}
                    </div>
                  </div>
                )}

                {generatedContent.content.keyFeatures && (
                  <div className="content-section">
                    <div className="section-header">
                      <h4>Key Features</h4>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(generatedContent.content.keyFeatures.join('\n• '))}
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                    <div className="content-text">
                      <ul>
                        {generatedContent.content.keyFeatures.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {generatedContent.content.callToAction && (
                  <div className="content-section">
                    <div className="section-header">
                      <h4>Call to Action</h4>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard(generatedContent.content.callToAction)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                    <div className="content-text cta">
                      {generatedContent.content.callToAction}
                    </div>
                  </div>
                )}

                {generatedContent.content.suggestions?.alternativeHeadlines && (
                  <div className="content-section">
                    <div className="section-header">
                      <h4>Alternative Headlines</h4>
                    </div>
                    <div className="alternatives">
                      {generatedContent.content.suggestions.alternativeHeadlines.map((headline, index) => (
                        <div key={index} className="alternative-item">
                          <span>{headline}</span>
                          <button 
                            className="copy-btn small"
                            onClick={() => copyToClipboard(headline)}
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ai-modal-footer">
          <div className="footer-actions">
            {!generatedContent ? (
              <>
                <button 
                  className="btn-secondary"
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary ai-generate-btn"
                  onClick={generateContent}
                  disabled={isGenerating || !propertyData.address || !propertyData.price}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Generating Copy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate AI Copy
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn-secondary"
                  onClick={() => setGeneratedContent(null)}
                >
                  Start Over
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleComplete}
                >
                  <CheckCircle className="w-4 h-4" />
                  Use This Copy
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICopywritingEngine;
