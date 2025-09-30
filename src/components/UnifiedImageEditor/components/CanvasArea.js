import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Workspace } from 'polotno/canvas/workspace';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { EDITOR_THEME } from '../theme/editorTheme';
import { Icon } from './Icons';

const CanvasArea = ({
  store,
  currentMode = 'design',
  onFileUpload,
  isLoading = false,
  hasImage = false,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: isLoading
  });

  useEffect(() => {
    setIsDragActive(dropzoneActive);
  }, [dropzoneActive]);

  const EmptyState = () => (
    <div
      className="canvas-empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: EDITOR_THEME.spacing.xxl,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          backgroundColor: EDITOR_THEME.colors.background.card,
          borderRadius: EDITOR_THEME.radius.large,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: EDITOR_THEME.spacing.xl,
          border: `2px solid ${EDITOR_THEME.colors.border.primary}`,
        }}
      >
        <Icon name="image" size={32} color={EDITOR_THEME.colors.text.muted} />
      </div>
      
      <h3
        style={{
          margin: 0,
          marginBottom: EDITOR_THEME.spacing.sm,
          fontSize: EDITOR_THEME.typography.fontSize.lg,
          fontWeight: EDITOR_THEME.typography.fontWeight.semibold,
          color: EDITOR_THEME.colors.text.primary,
          fontFamily: EDITOR_THEME.typography.fontFamily,
        }}
      >
        No Image Loaded
      </h3>
      
      <p
        style={{
          margin: 0,
          marginBottom: EDITOR_THEME.spacing.xl,
          fontSize: EDITOR_THEME.typography.fontSize.sm,
          color: EDITOR_THEME.colors.text.muted,
          fontFamily: EDITOR_THEME.typography.fontFamily,
          lineHeight: 1.5,
          maxWidth: '400px',
        }}
      >
        Upload an image to start editing, or drag and drop an image file anywhere in this area.
      </p>
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: EDITOR_THEME.spacing.sm,
          padding: `${EDITOR_THEME.spacing.md} ${EDITOR_THEME.spacing.xl}`,
          backgroundColor: EDITOR_THEME.colors.primary,
          border: 'none',
          borderRadius: EDITOR_THEME.radius.medium,
          color: '#ffffff',
          fontSize: EDITOR_THEME.typography.fontSize.sm,
          fontWeight: EDITOR_THEME.typography.fontWeight.medium,
          fontFamily: EDITOR_THEME.typography.fontFamily,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: EDITOR_THEME.transitions.normal,
          opacity: isLoading ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = EDITOR_THEME.colors.primaryHover;
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = EDITOR_THEME.colors.primary;
        }}
      >
        {isLoading ? (
          <>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Uploading...
          </>
        ) : (
          <>
            <Icon name="upload" size={16} color="currentColor" />
            Choose Image File
          </>
        )}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            onFileUpload(file);
          }
        }}
      />
    </div>
  );

  const LoadingSkeleton = () => (
    <div
      className="canvas-loading"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        gap: EDITOR_THEME.spacing.lg,
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          border: `3px solid ${EDITOR_THEME.colors.border.primary}`,
          borderTop: `3px solid ${EDITOR_THEME.colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <div
        style={{
          fontSize: EDITOR_THEME.typography.fontSize.sm,
          color: EDITOR_THEME.colors.text.secondary,
          fontFamily: EDITOR_THEME.typography.fontFamily,
        }}
      >
        Loading canvas...
      </div>
    </div>
  );

  return (
    <main
      className="canvas-area"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: EDITOR_THEME.colors.background.primary,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dropzone Overlay */}
      <div
        {...getRootProps()}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: isDragActive ? 10 : -1,
          backgroundColor: isDragActive 
            ? 'rgba(233, 30, 99, 0.1)' 
            : 'transparent',
          border: isDragActive 
            ? `2px dashed ${EDITOR_THEME.colors.primary}` 
            : 'none',
          borderRadius: EDITOR_THEME.radius.medium,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: EDITOR_THEME.transitions.normal,
          backdropFilter: isDragActive ? 'blur(4px)' : 'none',
        }}
      >
        <input {...getInputProps()} />
        {isDragActive && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: EDITOR_THEME.spacing.md,
              padding: EDITOR_THEME.spacing.xl,
              backgroundColor: EDITOR_THEME.colors.background.card,
              border: `1px solid ${EDITOR_THEME.colors.primary}`,
              borderRadius: EDITOR_THEME.radius.medium,
              boxShadow: EDITOR_THEME.shadows.large,
            }}
          >
            <Icon name="upload" size={32} color={EDITOR_THEME.colors.primary} />
            <div
              style={{
                fontSize: EDITOR_THEME.typography.fontSize.lg,
                fontWeight: EDITOR_THEME.typography.fontWeight.semibold,
                color: EDITOR_THEME.colors.primary,
                fontFamily: EDITOR_THEME.typography.fontFamily,
              }}
            >
              Drop image here
            </div>
            <div
              style={{
                fontSize: EDITOR_THEME.typography.fontSize.sm,
                color: EDITOR_THEME.colors.text.muted,
                fontFamily: EDITOR_THEME.typography.fontFamily,
              }}
            >
              Supported: JPG, PNG, GIF, WebP
            </div>
          </div>
        )}
      </div>

      {/* Canvas Content */}
      <div
        className="canvas-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : !hasImage ? (
          <EmptyState />
        ) : (
          <>
            {/* Polotno Toolbar */}
            {currentMode === 'design' && (
              <div
                className="canvas-toolbar"
                style={{
                  padding: EDITOR_THEME.spacing.lg,
                  borderBottom: `1px solid ${EDITOR_THEME.colors.border.secondary}`,
                  backgroundColor: EDITOR_THEME.colors.background.primary,
                }}
              >
                <Toolbar store={store} />
              </div>
            )}

            {/* Main Canvas */}
            <div
              className="canvas-workspace"
              style={{
                flex: 1,
                position: 'relative',
                backgroundColor: '#f0f0f0',
                background: 'radial-gradient(circle, #f8f8f8 0%, #e8e8e8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentMode === 'design' ? (
                <>
                  <Workspace store={store} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: EDITOR_THEME.spacing.lg,
                      right: EDITOR_THEME.spacing.lg,
                    }}
                  >
                    <ZoomButtons store={store} />
                  </div>
                </>
              ) : (
                // For AI and Inpaint modes, show a preview of the image
                <div
                  className="image-preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    padding: EDITOR_THEME.spacing.xl,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: EDITOR_THEME.radius.medium,
                      boxShadow: EDITOR_THEME.shadows.medium,
                      padding: EDITOR_THEME.spacing.lg,
                      border: `1px solid ${EDITOR_THEME.colors.border.primary}`,
                      maxWidth: '800px',
                      maxHeight: '600px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: EDITOR_THEME.typography.fontSize.sm,
                        color: EDITOR_THEME.colors.text.muted,
                        textAlign: 'center',
                      }}
                    >
                      {currentMode === 'ai_beautify' 
                        ? 'AI Beautification Preview Area'
                        : 'Inpainting Preview Area'
                      }
                      <br />
                      <small>Image processing interface will appear here</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
};

export default CanvasArea;