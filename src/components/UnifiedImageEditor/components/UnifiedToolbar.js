import React from 'react';

const UnifiedToolbar = ({ 
  currentMode, 
  onModeChange, 
  onFileUpload, 
  isLoading 
}) => {
  const modes = [
    { id: 'design', label: 'Design', icon: '✏️' },
    { id: 'ai_beautify', label: 'AI Beautify', icon: '🤖' },
    { id: 'inpaint', label: 'Inpaint', icon: '🎯' }
  ];

  return (
    <div className="unified-toolbar">
      {/* Mode Selector */}
      <div className="toolbar-section">
        <div className="mode-selector">
          {modes.map(mode => (
            <button
              key={mode.id}
              className={`mode-btn ${currentMode === mode.id ? 'active' : ''}`}
              onClick={() => onModeChange(mode.id)}
              disabled={isLoading}
              title={mode.label}
            >
              <span className="mode-icon">{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-separator" />

      {/* File Operations */}
      <div className="toolbar-section">
        <button
          className="tool-btn"
          onClick={onFileUpload}
          disabled={isLoading}
          title="Upload Image"
        >
          📁
        </button>
      </div>

      <div className="toolbar-separator" />

      {/* Quick Tools based on current mode */}
      <div className="toolbar-section">
        {currentMode === 'design' && (
          <>
            <button className="tool-btn" title="Select">✋</button>
            <button className="tool-btn" title="Text">T</button>
            <button className="tool-btn" title="Shape">▭</button>
            <button className="tool-btn" title="Image">🖼️</button>
          </>
        )}

        {currentMode === 'ai_beautify' && (
          <>
            <button className="tool-btn" title="Enhance Portrait">👤</button>
            <button className="tool-btn" title="Brighten">☀️</button>
            <button className="tool-btn" title="Smooth">✨</button>
          </>
        )}

        {currentMode === 'inpaint' && (
          <>
            <button className="tool-btn" title="Brush">🖌️</button>
            <button className="tool-btn" title="Eraser">🧽</button>
            <button className="tool-btn" title="Magic Wand">🪄</button>
          </>
        )}
      </div>

      {isLoading && (
        <div className="toolbar-section">
          <div className="status-loading" />
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
};

export default UnifiedToolbar;