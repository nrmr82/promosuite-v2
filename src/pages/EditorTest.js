import React, { useState } from 'react';
import UnifiedImageEditor from '../components/UnifiedImageEditor/UnifiedImageEditor';

const EditorTest = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [savedImage, setSavedImage] = useState(null);

  const handleLaunchEditor = () => {
    setShowEditor(true);
  };

  const handleSave = (imageData) => {
    setSavedImage(imageData);
    console.log('Image saved:', imageData);
  };

  const handleClose = () => {
    setShowEditor(false);
  };

  const handleExport = (imageData) => {
    console.log('Image exported:', imageData);
  };

  if (showEditor) {
    return (
      <UnifiedImageEditor
        onSave={handleSave}
        onClose={handleClose}
        onExport={handleExport}
        initialImage={null}
        returnTo="test"
      />
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      background: '#1a1a1a', 
      color: '#fff', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Unified Image Editor Test</h1>
        <p>Test the new integrated image editor with AI beautification and inpainting tools</p>
        
        <button
          onClick={handleLaunchEditor}
          style={{
            background: '#e91e63',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          🎨 Launch Advanced Editor
        </button>

        {savedImage && (
          <div style={{ marginTop: '40px' }}>
            <h3>Last Saved Image:</h3>
            <img 
              src={savedImage} 
              alt="Saved from editor" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                border: '2px solid #444',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        <div style={{ marginTop: '40px', textAlign: 'left' }}>
          <h3>Features Available:</h3>
          <ul>
            <li>✅ <strong>Design Mode:</strong> Full Polotno-based canvas editor</li>
            <li>🤖 <strong>AI Beautification:</strong> Credit-based image enhancement</li>
            <li>🎯 <strong>Inpainting:</strong> Object removal and background replacement</li>
            <li>💎 <strong>Credit System:</strong> Usage tracking and management</li>
            <li>📱 <strong>Responsive:</strong> Works on desktop and mobile</li>
          </ul>

          <h3>AI Beautification Presets:</h3>
          <ul>
            <li>👤 <strong>Enhance Portrait</strong> (5 credits)</li>
            <li>☀️ <strong>Brighten Image</strong> (3 credits)</li>
            <li>✨ <strong>Smooth Skin</strong> (4 credits)</li>
            <li>💼 <strong>Professional Touch</strong> (6 credits)</li>
            <li>🎨 <strong>Custom Prompts</strong> (5-10 credits)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditorTest;