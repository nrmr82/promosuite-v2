import React, { useEffect, useRef } from 'react';
import { EDITOR_THEME } from '../theme/editorTheme';
import { Icon } from './Icons';

const ModalWrapper = ({ 
  isOpen, 
  onClose, 
  children, 
  title = 'Advanced Image Editor',
  showCloseButton = true,
  className = '',
  maxWidth = '95%',
  maxHeight = '95%'
}) => {
  const modalRef = useRef();
  const backdropRef = useRef();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      const modal = modalRef.current;
      if (modal) {
        modal.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="modal-wrapper"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: EDITOR_THEME.colors.background.modal,
        backdropFilter: 'blur(8px)',
        zIndex: EDITOR_THEME.zIndex.modal,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: EDITOR_THEME.spacing.lg,
        animation: 'modalFadeIn 0.2s ease-out',
      }}
    >
      <div
        ref={modalRef}
        className={`modal-content ${className}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          width: '100%',
          height: '100%',
          maxWidth,
          maxHeight,
          backgroundColor: EDITOR_THEME.colors.background.primary,
          borderRadius: EDITOR_THEME.radius.medium,
          boxShadow: EDITOR_THEME.shadows.modal,
          border: `1px solid ${EDITOR_THEME.colors.border.primary}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          animation: 'modalSlideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        }}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: EDITOR_THEME.spacing.lg,
              right: EDITOR_THEME.spacing.lg,
              width: '32px',
              height: '32px',
              backgroundColor: EDITOR_THEME.colors.background.card,
              border: `1px solid ${EDITOR_THEME.colors.border.primary}`,
              borderRadius: EDITOR_THEME.radius.small,
              color: EDITOR_THEME.colors.text.secondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: EDITOR_THEME.transitions.normal,
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = EDITOR_THEME.colors.background.hover;
              e.target.style.color = EDITOR_THEME.colors.text.primary;
              e.target.style.borderColor = EDITOR_THEME.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = EDITOR_THEME.colors.background.card;
              e.target.style.color = EDITOR_THEME.colors.text.secondary;
              e.target.style.borderColor = EDITOR_THEME.colors.border.primary;
            }}
          >
            <Icon name="close" size={16} />
          </button>
        )}

        {children}
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-wrapper {
          font-family: ${EDITOR_THEME.typography.fontFamily};
        }

        .modal-content:focus {
          outline: none;
        }

        @media (max-width: 768px) {
          .modal-wrapper {
            padding: ${EDITOR_THEME.spacing.sm};
          }
        }
      `}</style>
    </div>
  );
};

export default ModalWrapper;