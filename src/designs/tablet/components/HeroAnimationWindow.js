import React, { useState, useEffect } from 'react';
import './HeroAnimationWindow.css';

const HeroAnimationWindow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = [
    {
      id: 'input',
      title: 'Property Input',
      description: 'Enter property details',
      content: (
        <div className="mockup-input">
          <div className="input-field">
            <div className="input-label">Property Address</div>
            <div className="input-value typing">123 Oak Street, Austin, TX</div>
          </div>
          <div className="input-field">
            <div className="input-label">Price</div>
            <div className="input-value typing">$650,000</div>
          </div>
          <div className="input-field">
            <div className="input-label">Bedrooms</div>
            <div className="input-value typing">4</div>
          </div>
        </div>
      )
    },
    {
      id: 'analysis',
      title: 'AI Analysis',
      description: 'Analyzing property & market',
      content: (
        <div className="mockup-analysis">
          <div className="analysis-item">
            <div className="analysis-icon">🏠</div>
            <div className="analysis-text">Property Type: Family Home</div>
            <div className="analysis-check">✓</div>
          </div>
          <div className="analysis-item">
            <div className="analysis-icon">📍</div>
            <div className="analysis-text">Market: Austin, TX</div>
            <div className="analysis-check">✓</div>
          </div>
          <div className="analysis-item">
            <div className="analysis-icon">👥</div>
            <div className="analysis-text">Target: Young Families</div>
            <div className="analysis-check">✓</div>
          </div>
        </div>
      )
    },
    {
      id: 'generation',
      title: 'Content Generation',
      description: 'Creating marketing materials',
      content: (
        <div className="mockup-generation">
          <div className="generation-preview">
            <div className="preview-flyer">
              <div className="flyer-header">
                <div className="flyer-logo">🏡</div>
                <div className="flyer-agent">Jane Smith Realty</div>
              </div>
              <div className="flyer-image">🏠</div>
              <div className="flyer-details">
                <div className="flyer-price">$650,000</div>
                <div className="flyer-address">123 Oak Street</div>
                <div className="flyer-features">4BR • 3BA • 2,400 sqft</div>
              </div>
            </div>
          </div>
          <div className="generation-text">
            <div className="generated-copy">
              <div className="copy-label">AI Generated Copy:</div>
              <div className="copy-content">
                "Beautiful family home in desirable Austin neighborhood. 
                Perfect for growing families with spacious rooms and modern updates."
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'results',
      title: 'Ready to Use!',
      description: 'Professional content created',
      content: (
        <div className="mockup-results">
          <div className="results-grid">
            <div className="result-card flyer">
              <div className="result-icon">📄</div>
              <div className="result-label">Flyer</div>
            </div>
            <div className="result-card social">
              <div className="result-icon">📱</div>
              <div className="result-label">Social Post</div>
            </div>
            <div className="result-card email">
              <div className="result-icon">📧</div>
              <div className="result-label">Email</div>
            </div>
            <div className="result-card video">
              <div className="result-icon">🎥</div>
              <div className="result-label">Video Script</div>
            </div>
          </div>
          <div className="results-stats">
            <div className="stat-item">
              <div className="stat-value">3.2s</div>
              <div className="stat-label">Generation Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">95%</div>
              <div className="stat-label">AI Confidence</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [steps.length, isAnimating]);

  const handleStepClick = (index) => {
    setCurrentStep(index);
    setIsAnimating(false);
    
    // Resume auto-animation after 10 seconds of inactivity
    setTimeout(() => {
      setIsAnimating(true);
    }, 10000);
  };

  return (
    <div className="hero-animation-window">
      <div className="window-header">
        <div className="window-controls">
          <div className="window-dot red"></div>
          <div className="window-dot yellow"></div>
          <div className="window-dot green"></div>
        </div>
        <div className="window-title">PromoSuite AI</div>
      </div>
      
      <div className="window-nav">
        {steps.map((step, index) => (
          <button
            key={step.id}
            className={`nav-step ${currentStep === index ? 'active' : ''} ${currentStep > index ? 'completed' : ''}`}
            onClick={() => handleStepClick(index)}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="window-content">
        <div className="content-area">
          {steps[currentStep].content}
        </div>
        
        <div className="progress-indicator">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>
      
      <div className="window-footer">
        <div className="ai-badge">
          <span className="ai-icon">🤖</span>
          <span>Powered by AI</span>
        </div>
        <div className="window-status">
          <div className="status-dot active"></div>
          <span>Live Demo</span>
        </div>
      </div>
    </div>
  );
};

export default HeroAnimationWindow;
