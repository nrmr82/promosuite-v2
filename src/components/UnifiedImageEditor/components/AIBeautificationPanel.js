import React, { useState } from 'react';

const AIBeautificationPanel = ({ onProcess, credits, isProcessing }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);

  const presets = [
    {
      id: 'enhance_portrait',
      title: 'Enhance Portrait',
      description: 'Enhance facial features and skin',
      cost: 5,
      icon: '👤'
    },
    {
      id: 'brighten_image',
      title: 'Brighten Image',
      description: 'Improve lighting and contrast',
      cost: 3,
      icon: '☀️'
    },
    {
      id: 'smooth_skin',
      title: 'Smooth Skin',
      description: 'Reduce blemishes and smooth skin',
      cost: 4,
      icon: '✨'
    },
    {
      id: 'professional_touch',
      title: 'Professional Touch',
      description: 'Complete professional enhancement',
      cost: 6,
      icon: '💼'
    }
  ];

  const handlePresetClick = async (preset) => {
    if (credits < preset.cost) {
      alert('Insufficient credits for this operation');
      return;
    }

    setSelectedPreset(preset.id);
    await onProcess(preset.id, { preset: true });
    setSelectedPreset(null);
  };

  const handleCustomPromptSubmit = async () => {
    if (!customPrompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    const estimatedCost = Math.min(10, Math.max(5, customPrompt.length / 10));
    
    if (credits < estimatedCost) {
      alert('Insufficient credits for this operation');
      return;
    }

    await onProcess('custom_prompt', { 
      prompt: customPrompt,
      cost: estimatedCost
    });
  };

  const getPromptCost = () => {
    return Math.min(10, Math.max(5, customPrompt.length / 10));
  };

  return (
    <div className="panel">
      <div className="panel-title">
        🤖 AI Beautification
      </div>

      {/* One-click Presets */}
      <div className="panel-section">
        <h3>One-Click Enhancements</h3>
        <div className="preset-grid">
          {presets.map(preset => (
            <button
              key={preset.id}
              className={`preset-btn ${selectedPreset === preset.id ? 'processing' : ''}`}
              onClick={() => handlePresetClick(preset)}
              disabled={isProcessing || credits < preset.cost}
            >
              <div className="preset-btn-icon">{preset.icon}</div>
              <div className="preset-btn-title">{preset.title}</div>
              <div className="preset-btn-description">{preset.description}</div>
              <div className="preset-btn-cost">{preset.cost} credits</div>
              {credits < preset.cost && (
                <div className="preset-btn-insufficient">Insufficient Credits</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="panel-section">
        <h3>Custom Enhancement</h3>
        <div className="custom-prompt">
          <textarea
            className="prompt-input"
            placeholder="Describe how you want to enhance this image... (e.g., 'make the skin smoother and eyes brighter')"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={isProcessing}
          />
          <div className="prompt-cost">
            Estimated cost: {getPromptCost()} credits
          </div>
          <button
            className="action-btn primary"
            onClick={handleCustomPromptSubmit}
            disabled={isProcessing || !customPrompt.trim() || credits < getPromptCost()}
          >
            {isProcessing ? 'Processing...' : 'Enhance with AI'}
          </button>
        </div>
      </div>

      {/* Credit Information */}
      <div className="panel-section">
        <h3>Credit Usage</h3>
        <div className="credit-info">
          <div className="credit-balance">
            Available Credits: <span className="credit-count">{credits}</span>
          </div>
          <div className="credit-tips">
            <p><strong>Tips:</strong></p>
            <ul>
              <li>Preset enhancements are faster and more reliable</li>
              <li>Custom prompts offer more control but vary in cost</li>
              <li>Preview is free, credits are only deducted after confirmation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="processing-status">
          <div className="status-loading" />
          <div className="processing-text">
            <div>Processing your image...</div>
            <div className="processing-subtext">This may take a few moments</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIBeautificationPanel;