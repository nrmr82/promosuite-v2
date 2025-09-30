import React, { useState } from 'react';
import UnifiedImageEditor from './UnifiedImageEditor/UnifiedImageEditor';

const EditorQuickTest = () => {
  const [showEditor, setShowEditor] = useState(false);

  const handleSave = (imageData) => {
    console.log('Image saved:', imageData);
    alert('Image saved successfully!');
  };

  const handleClose = () => {
    setShowEditor(false);
  };

  const handleExport = (imageData) => {
    console.log('Image exported:', imageData);
    alert('Image exported successfully!');
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
      padding: '50px', 
      textAlign: 'center',
      background: '#1a1a1a',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1>🎨 Editor Quick Test</h1>
      <p>Click the button below to test the Unified Image Editor</p>
      <button
        onClick={() => setShowEditor(true)}
        style={{
          background: '#e91e63',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        🚀 Launch Unified Editor
      </button>
    </div>
  );
};

export default EditorQuickTest;