import React from 'react';
import { EDITOR_THEME } from '../theme/editorTheme';
import { Icon } from './Icons';

const EditorHeader = ({
  credits = 50,
  onUpload,
  onSave,
  onExport,
  onClose,
  isLoading = false,
  canSave = true,
  canExport = true,
}) => {
  const ActionButton = ({ 
    icon, 
    label, 
    onClick, 
    disabled = false, 
    variant = 'secondary',
    loading = false 
  }) => (
    <button
      className={`editor-action-btn editor-action-btn--${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: EDITOR_THEME.spacing.sm,
        padding: `${EDITOR_THEME.spacing.sm} ${EDITOR_THEME.spacing.md}`,
        backgroundColor: variant === 'primary' 
          ? EDITOR_THEME.colors.primary 
          : EDITOR_THEME.colors.background.card,
        border: `1px solid ${variant === 'primary' 
          ? EDITOR_THEME.colors.primary 
          : EDITOR_THEME.colors.border.primary}`,
        borderRadius: EDITOR_THEME.radius.medium,
        color: variant === 'primary' 
          ? '#ffffff' 
          : EDITOR_THEME.colors.text.secondary,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: EDITOR_THEME.typography.fontSize.sm,
        fontWeight: EDITOR_THEME.typography.fontWeight.medium,
        fontFamily: EDITOR_THEME.typography.fontFamily,
        transition: EDITOR_THEME.transitions.normal,
        opacity: disabled ? 0.5 : 1,
        minWidth: variant === 'primary' ? '80px' : 'auto',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.target.style.backgroundColor = EDITOR_THEME.colors.primaryHover;
          } else {
            e.target.style.backgroundColor = EDITOR_THEME.colors.background.hover;
            e.target.style.color = EDITOR_THEME.colors.text.primary;
            e.target.style.borderColor = EDITOR_THEME.colors.border.focus;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.target.style.backgroundColor = EDITOR_THEME.colors.primary;
          } else {
            e.target.style.backgroundColor = EDITOR_THEME.colors.background.card;
            e.target.style.color = EDITOR_THEME.colors.text.secondary;
            e.target.style.borderColor = EDITOR_THEME.colors.border.primary;
          }
        }
      }}
    >
      {loading ? (
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
      ) : (
        <Icon name={icon} size={16} color="currentColor" />
      )}
      <span>{label}</span>
    </button>
  );

  return (
    <header
      className="editor-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: EDITOR_THEME.spacing.xl,
        paddingBottom: EDITOR_THEME.spacing.lg,
        borderBottom: `1px solid ${EDITOR_THEME.colors.border.secondary}`,
        backgroundColor: EDITOR_THEME.colors.background.primary,
      }}
    >
      {/* Left Side - Logo & Title */}
      <div
        className="editor-header-left"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: EDITOR_THEME.spacing.md,
        }}
      >
        <div
          className="editor-logo"
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: EDITOR_THEME.colors.primary,
            borderRadius: EDITOR_THEME.radius.small,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: EDITOR_THEME.typography.fontWeight.bold,
            fontSize: EDITOR_THEME.typography.fontSize.sm,
          }}
        >
          P
        </div>
        
        <div className="editor-title-section">
          <h1
            id="modal-title"
            style={{
              margin: 0,
              fontSize: EDITOR_THEME.typography.fontSize.lg,
              fontWeight: EDITOR_THEME.typography.fontWeight.semibold,
              color: EDITOR_THEME.colors.text.primary,
              fontFamily: EDITOR_THEME.typography.fontFamily,
            }}
          >
            Advanced Image Editor
          </h1>
          <div
            className="editor-badge"
            style={{
              display: 'inline-block',
              marginTop: '2px',
              padding: `2px ${EDITOR_THEME.spacing.sm}`,
              backgroundColor: EDITOR_THEME.colors.primaryLight,
              border: `1px solid ${EDITOR_THEME.colors.primary}`,
              borderRadius: EDITOR_THEME.radius.small,
              color: EDITOR_THEME.colors.primary,
              fontSize: '10px',
              fontWeight: EDITOR_THEME.typography.fontWeight.medium,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            PROFESSIONAL
          </div>
        </div>
      </div>

      {/* Center - Credits Display */}
      <div
        className="editor-credits"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: EDITOR_THEME.spacing.sm,
          padding: `${EDITOR_THEME.spacing.sm} ${EDITOR_THEME.spacing.md}`,
          backgroundColor: EDITOR_THEME.colors.background.card,
          border: `1px solid ${EDITOR_THEME.colors.border.primary}`,
          borderRadius: EDITOR_THEME.radius.medium,
        }}
      >
        <Icon name="diamond" size={16} color={EDITOR_THEME.colors.primary} />
        <span
          style={{
            color: EDITOR_THEME.colors.primary,
            fontWeight: EDITOR_THEME.typography.fontWeight.semibold,
            fontSize: EDITOR_THEME.typography.fontSize.sm,
          }}
        >
          {credits}
        </span>
        <span
          style={{
            color: EDITOR_THEME.colors.text.muted,
            fontSize: EDITOR_THEME.typography.fontSize.xs,
          }}
        >
          credits
        </span>
      </div>

      {/* Right Side - Action Buttons */}
      <div
        className="editor-actions"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: EDITOR_THEME.spacing.sm,
        }}
      >
        <ActionButton
          icon="upload"
          label="Upload"
          onClick={onUpload}
          disabled={isLoading}
        />
        
        <ActionButton
          icon="save"
          label="Save"
          onClick={onSave}
          disabled={!canSave || isLoading}
          variant="primary"
          loading={isLoading}
        />
        
        <ActionButton
          icon="export"
          label="Export"
          onClick={onExport}
          disabled={!canExport || isLoading}
        />
      </div>

      {/* Add spin animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};

export default EditorHeader;