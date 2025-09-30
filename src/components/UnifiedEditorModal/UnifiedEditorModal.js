import React, { useState, useCallback, useRef, useEffect } from 'react';
import FlyerStudio from '../FlyerStudio/FlyerStudio';
import PortraitStudio from '../PortraitStudio/PortraitStudio';
import './UnifiedEditorModal.css';

// Minimalist Icons
const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const icons = {
    close: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    layout: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
      </svg>
    ),
    image: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21,15 16,10 5,21"/>
      </svg>
    ),
    save: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17,21 17,13 7,13 7,21"/>
        <polyline points="7,3 7,8 15,8"/>
      </svg>
    )
  };
  return icons[name] || null;
};

const EDITOR_MODES = {
  FLYER: 'flyer',
  PORTRAIT: 'portrait'
};

const UnifiedEditorModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  initialMode = EDITOR_MODES.FLYER,
  initialImage = null,
  user = null
}) => {
  const [currentMode, setCurrentMode] = useState(initialMode);
  const flyerStudioRef = useRef(null);
  const portraitStudioRef = useRef(null);

  const handleModeSwitch = useCallback((mode) => {
    setCurrentMode(mode);
  }, []);

  const handleEditorSave = useCallback((data) => {
    onSave(data);
    console.log('Editor saved:', data);
  }, [onSave]);

  const handleSaveFromModal = useCallback(() => {
    // Trigger save from the active child component
    if (currentMode === EDITOR_MODES.FLYER && flyerStudioRef.current) {
      flyerStudioRef.current.handleSave();
    } else if (currentMode === EDITOR_MODES.PORTRAIT && portraitStudioRef.current) {
      portraitStudioRef.current.handleSave();
    }
  }, [currentMode]);

  const handleEditorClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleModalClose = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="unified-editor-modal-overlay" onClick={handleModalClose}>
      <div className="unified-editor-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-left">
            <h2>Professional Editor Suite</h2>
            <div className="mode-selector">
              <button
                className={`mode-btn ${currentMode === EDITOR_MODES.FLYER ? 'active' : ''}`}
                onClick={() => handleModeSwitch(EDITOR_MODES.FLYER)}
              >
                <Icon name="layout" size={16} />
                Flyer Editor
              </button>
              <button
                className={`mode-btn ${currentMode === EDITOR_MODES.PORTRAIT ? 'active' : ''}`}
                onClick={() => handleModeSwitch(EDITOR_MODES.PORTRAIT)}
              >
                <Icon name="image" size={16} />
                Photo Editor
              </button>
            </div>
          </div>
          
          <div className="header-right">
            <button className="action-btn save-btn" onClick={handleSaveFromModal} title="Save Changes">
              <Icon name="save" size={16} />
              Save
            </button>
            <button className="close-btn" onClick={handleEditorClose} title="Close Editor">
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {currentMode === EDITOR_MODES.FLYER ? (
            <FlyerStudio
              ref={flyerStudioRef}
              onSave={handleEditorSave}
              onClose={handleEditorClose}
              onExport={handleEditorSave}
              user={user}
              initialTemplate={null}
            />
          ) : (
            <PortraitStudio
              ref={portraitStudioRef}
              onSave={handleEditorSave}
              onClose={handleEditorClose}
              onExport={handleEditorSave}
              user={user}
              initialImage={initialImage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedEditorModal;