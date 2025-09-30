import React from 'react';

const InpaintingToolsPanel = ({ onInpaint, isProcessing, store }) => {
  return (
    <div className="panel">
      <div className="panel-title">
        🎯 Inpainting Tools
      </div>
      
      <div className="panel-section">
        <h3>Object Removal</h3>
        <p>Select areas to remove from your image using AI-powered inpainting.</p>
        <button 
          className="action-btn primary"
          disabled={isProcessing}
          onClick={() => onInpaint({ type: 'remove' })}
        >
          {isProcessing ? 'Processing...' : 'Start Inpainting'}
        </button>
      </div>

      <div className="panel-section">
        <h3>Background Removal</h3>
        <p>Automatically remove the background from your image.</p>
        <button 
          className="action-btn secondary"
          disabled={isProcessing}
          onClick={() => onInpaint({ type: 'background' })}
        >
          Remove Background (4 credits)
        </button>
      </div>

      <div className="panel-section">
        <h3>Tools</h3>
        <div className="tool-grid">
          <button className="tool-btn">🖌️ Brush</button>
          <button className="tool-btn">🧽 Eraser</button>
          <button className="tool-btn">🪄 Magic Wand</button>
          <button className="tool-btn">⚡ Smart Select</button>
        </div>
      </div>
    </div>
  );
};

export default InpaintingToolsPanel;