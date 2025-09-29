import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlyerPro.css';

const FlyerPro = ({ user }) => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlyer, setGeneratedFlyer] = useState(null);
  const fileInputRef = useRef();

  // Mock template data
  const templates = [
    {
      id: 'real-estate-1',
      name: 'Modern Real Estate',
      category: 'Real Estate',
      image: '🏠',
      color: '#e91e63',
      description: 'Clean, modern design for property listings'
    },
    {
      id: 'real-estate-2', 
      name: 'Luxury Properties',
      category: 'Real Estate',
      image: '🏖️',
      color: '#2196f3',
      description: 'Premium template for high-end properties'
    },
    {
      id: 'business-1',
      name: 'Business Promo',
      category: 'Business',
      image: '💼',
      color: '#4caf50',
      description: 'Professional business promotion flyer'
    },
    {
      id: 'event-1',
      name: 'Event Flyer',
      category: 'Events',
      image: '🎉',
      color: '#ff9800',
      description: 'Eye-catching event promotion design'
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleGenerateFlyer = async () => {
    setIsGenerating(true);
    
    // Mock flyer generation
    setTimeout(() => {
      setGeneratedFlyer({
        id: Date.now(),
        template: selectedTemplate,
        preview: selectedTemplate.image,
        title: `Custom ${selectedTemplate.name}`,
        created: new Date().toLocaleDateString()
      });
      setIsGenerating(false);
    }, 2000);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Mock image processing
      console.log('Processing image:', file.name);
    }
  };

  const handleDownload = () => {
    // Mock download
    alert('Flyer downloaded successfully!');
  };

  return (
    <div className="flyerpro flyerpro--mobile">
      <div className="container-mobile">
        {/* Header */}
        <div className="flyerpro-header">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              ← Back
            </button>
            <h1 className="page-title">FlyerPro</h1>
          </div>
          <p className="page-subtitle">Create stunning flyers with AI</p>
        </div>

        {!selectedTemplate && !generatedFlyer && (
          <>
            {/* Template Selection */}
            <section className="template-section">
              <h2 className="section-title">Choose a Template</h2>
              
              <div className="template-grid">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="template-card"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div 
                      className="template-preview"
                      style={{ backgroundColor: template.color }}
                    >
                      <span className="template-icon">{template.image}</span>
                    </div>
                    <div className="template-info">
                      <h3 className="template-name">{template.name}</h3>
                      <span className="template-category">{template.category}</span>
                      <p className="template-description">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">
              <h2 className="section-title">Quick Start</h2>
              
              <div className="action-buttons">
                <button className="action-btn action-btn--primary">
                  <span className="btn-icon">🎨</span>
                  <span>AI Generate</span>
                </button>
                
                <button 
                  className="action-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="btn-icon">📁</span>
                  <span>Upload Image</span>
                </button>
                
                <button className="action-btn">
                  <span className="btn-icon">📋</span>
                  <span>From Text</span>
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </section>
          </>
        )}

        {selectedTemplate && !generatedFlyer && (
          <section className="customize-section">
            <div className="selected-template">
              <div className="template-preview-large">
                <div 
                  className="preview-canvas"
                  style={{ backgroundColor: selectedTemplate.color }}
                >
                  <span className="preview-icon">{selectedTemplate.image}</span>
                  <div className="preview-content">
                    <div className="preview-title">Your Title Here</div>
                    <div className="preview-subtitle">Description text</div>
                    <div className="preview-cta">Contact Info</div>
                  </div>
                </div>
              </div>
              
              <div className="template-controls">
                <h2>{selectedTemplate.name}</h2>
                
                <div className="control-group">
                  <label>Property Title</label>
                  <input 
                    type="text" 
                    placeholder="Enter property title..."
                    className="form-input"
                  />
                </div>
                
                <div className="control-group">
                  <label>Description</label>
                  <textarea 
                    placeholder="Enter description..."
                    className="form-textarea"
                    rows="3"
                  />
                </div>
                
                <div className="control-group">
                  <label>Contact Info</label>
                  <input 
                    type="text" 
                    placeholder="Phone, email, website..."
                    className="form-input"
                  />
                </div>
                
                <div className="action-buttons">
                  <button 
                    className="btn-secondary"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Back to Templates
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleGenerateFlyer}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <span className="loading-spinner">⏳</span>
                        Generating...
                      </>
                    ) : (
                      'Generate Flyer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {generatedFlyer && (
          <section className="result-section">
            <div className="result-header">
              <h2>Your Flyer is Ready! 🎉</h2>
              <p>Here's your professional flyer</p>
            </div>
            
            <div className="generated-flyer">
              <div 
                className="flyer-preview"
                style={{ backgroundColor: generatedFlyer.template.color }}
              >
                <span className="flyer-icon">{generatedFlyer.preview}</span>
                <div className="flyer-content">
                  <div className="flyer-title">{generatedFlyer.title}</div>
                  <div className="flyer-subtitle">Professional Design</div>
                  <div className="flyer-date">Created: {generatedFlyer.created}</div>
                </div>
              </div>
              
              <div className="flyer-actions">
                <button className="btn-primary" onClick={handleDownload}>
                  📥 Download
                </button>
                <button className="btn-secondary">
                  ✏️ Edit
                </button>
                <button className="btn-secondary">
                  📤 Share
                </button>
              </div>
              
              <div className="result-actions">
                <button 
                  className="btn-outline"
                  onClick={() => {
                    setGeneratedFlyer(null);
                    setSelectedTemplate(null);
                  }}
                >
                  Create Another
                </button>
                <button 
                  className="btn-outline"
                  onClick={() => navigate('/collections')}
                >
                  Save to Collection
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default FlyerPro;