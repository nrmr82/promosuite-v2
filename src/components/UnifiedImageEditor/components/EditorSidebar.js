import React, { useState } from 'react';
import { EDITOR_THEME } from '../theme/editorTheme';
import { Icon } from './Icons';

const EditorSidebar = ({
  currentMode = 'design',
  onModeChange,
  credits,
  onAIProcess,
  onInpaint,
  isProcessing = false,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');

  const modes = [
    {
      id: 'design',
      label: 'Design',
      icon: 'design',
      description: 'Canvas editing tools'
    },
    {
      id: 'ai_beautify',
      label: 'AI Beautify',
      icon: 'ai',
      description: 'AI-powered enhancement'
    },
    {
      id: 'inpaint',
      label: 'Inpaint',
      icon: 'inpaint',
      description: 'Object removal & repair'
    }
  ];

  const aiPresets = [
    {
      id: 'enhance_portrait',
      title: 'Enhance Portrait',
      description: 'Perfect for face photos',
      icon: 'user',
      cost: 5
    },
    {
      id: 'brighten_image',
      title: 'Brighten Image',
      description: 'Improve lighting & contrast',
      icon: 'sun',
      cost: 3
    },
    {
      id: 'smooth_skin',
      title: 'Smooth Skin',
      description: 'Remove blemishes & imperfections',
      icon: 'sparkles',
      cost: 4
    },
    {
      id: 'professional_touch',
      title: 'Professional Touch',
      description: 'Complete professional enhancement',
      icon: 'briefcase',
      cost: 6
    }
  ];

  const ModeTab = ({ mode, isActive, onClick }) => (
    <button
      className={`mode-tab ${isActive ? 'active' : ''}`}
      onClick={() => onClick(mode.id)}
      disabled={isProcessing}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: EDITOR_THEME.spacing.sm,
        padding: EDITOR_THEME.spacing.md,
        backgroundColor: isActive 
          ? EDITOR_THEME.colors.primary 
          : 'transparent',
        border: `1px solid ${isActive 
          ? EDITOR_THEME.colors.primary 
          : EDITOR_THEME.colors.border.primary}`,
        borderRadius: EDITOR_THEME.radius.medium,
        color: isActive 
          ? '#ffffff' 
          : EDITOR_THEME.colors.text.secondary,
        cursor: 'pointer',
        fontSize: EDITOR_THEME.typography.fontSize.sm,
        fontWeight: EDITOR_THEME.typography.fontWeight.medium,
        fontFamily: EDITOR_THEME.typography.fontFamily,
        transition: EDITOR_THEME.transitions.normal,
        width: '100%',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!isActive && !isProcessing) {
          e.target.style.backgroundColor = EDITOR_THEME.colors.background.hover;
          e.target.style.color = EDITOR_THEME.colors.text.primary;
          e.target.style.borderColor = EDITOR_THEME.colors.border.focus;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = EDITOR_THEME.colors.text.secondary;
          e.target.style.borderColor = EDITOR_THEME.colors.border.primary;
        }
      }}
    >
      <Icon name={mode.icon} size={18} color="currentColor" />
      <div>
        <div style={{ fontWeight: EDITOR_THEME.typography.fontWeight.semibold }}>
          {mode.label}
        </div>
        <div style={{ 
          fontSize: EDITOR_THEME.typography.fontSize.xs,
          opacity: 0.8,
          marginTop: '2px'
        }}>
          {mode.description}
        </div>
      </div>
    </button>
  );

  const PresetButton = ({ preset }) => (
    <button
      className="preset-button"
      onClick={() => onAIProcess(preset.id, { preset: true, cost: preset.cost })}
      disabled={isProcessing || credits < preset.cost}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: EDITOR_THEME.spacing.md,
        backgroundColor: EDITOR_THEME.colors.background.card,
        border: `1px solid ${EDITOR_THEME.colors.border.primary}`,
        borderRadius: EDITOR_THEME.radius.medium,
        color: EDITOR_THEME.colors.text.secondary,
        cursor: credits < preset.cost ? 'not-allowed' : 'pointer',
        fontSize: EDITOR_THEME.typography.fontSize.sm,
        fontFamily: EDITOR_THEME.typography.fontFamily,
        transition: EDITOR_THEME.transitions.normal,
        width: '100%',
        textAlign: 'left',
        opacity: credits < preset.cost ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (credits >= preset.cost && !isProcessing) {
          e.target.style.backgroundColor = EDITOR_THEME.colors.background.hover;
          e.target.style.borderColor = EDITOR_THEME.colors.primary;
          e.target.style.color = EDITOR_THEME.colors.text.primary;
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = EDITOR_THEME.colors.background.card;
        e.target.style.borderColor = EDITOR_THEME.colors.border.primary;
        e.target.style.color = EDITOR_THEME.colors.text.secondary;
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: EDITOR_THEME.spacing.sm,
        marginBottom: EDITOR_THEME.spacing.xs
      }}>
        <Icon name={preset.icon} size={16} color={EDITOR_THEME.colors.primary} />
        <span style={{ fontWeight: EDITOR_THEME.typography.fontWeight.medium }}>
          {preset.title}
        </span>
      </div>
      
      <div style={{ 
        fontSize: EDITOR_THEME.typography.fontSize.xs,
        color: EDITOR_THEME.colors.text.muted,
        marginBottom: EDITOR_THEME.spacing.sm
      }}>
        {preset.description}
      </div>
      
      <div style={{ 
        fontSize: EDITOR_THEME.typography.fontSize.xs,
        color: EDITOR_THEME.colors.primary,
        fontWeight: EDITOR_THEME.typography.fontWeight.medium
      }}>
        {preset.cost} credits
      </div>
    </button>
  );

  const renderModeContent = () => {
    switch (currentMode) {
      case 'design':
        return (
          <div className="design-tools">
            <h3 style={{ 
              margin: 0,
              marginBottom: EDITOR_THEME.spacing.lg,
              fontSize: EDITOR_THEME.typography.fontSize.md,
              fontWeight: EDITOR_THEME.typography.fontWeight.semibold,
              color: EDITOR_THEME.colors.text.primary
            }}>
              Design Tools
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: EDITOR_THEME.spacing.sm,
              marginBottom: EDITOR_THEME.spacing.lg
            }}>
              {[
                { icon: 'text', label: 'Text' },
                { icon: 'image', label: 'Image' },
                { icon: 'shapes', label: 'Shapes' },
                { icon: 'folder', label: 'Elements' }
              ].map((tool, idx) => (
                <button
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: EDITOR_THEME.spacing.xs,
                    padding: EDITOR_THEME.spacing.md,
                    backgroundColor: EDITOR_THEME.colors.background.card,
                    border: `1px solid ${EDITOR_THEME.colors.border.primary}`,
                    borderRadius: EDITOR_THEME.radius.medium,
                    color: EDITOR_THEME.colors.text.secondary,
                    cursor: 'pointer',
                    fontSize: EDITOR_THEME.typography.fontSize.xs,
                    fontFamily: EDITOR_THEME.typography.fontFamily,
                    transition: EDITOR_THEME.transitions.normal,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = EDITOR_THEME.colors.background.hover;
                    e.target.style.borderColor = EDITOR_THEME.colors.primary;
                    e.target.style.color = EDITOR_THEME.colors.text.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = EDITOR_THEME.colors.background.card;
                    e.target.style.borderColor = EDITOR_THEME.colors.border.primary;
                    e.target.style.color = EDITOR_THEME.colors.text.secondary;
                  }}
                >
                  <Icon name={tool.icon} size={20} color="currentColor" />
                  {tool.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'ai_beautify':
        return (
          <div className="ai-tools">
            <h3 style={{ 
              margin: 0,
              marginBottom: EDITOR_THEME.spacing.lg,
              fontSize: EDITOR_THEME.typography.fontSize.md,
              fontWeight: EDITOR_THEME.typography.fontWeight.semibold,
              color: EDITOR_THEME.colors.text.primary
            }}>
              AI Beautification
            </h3>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: EDITOR_THEME.spacing.sm,
              marginBottom: EDITOR_THEME.spacing.lg
            }}>
              {aiPresets.map(preset => (
                <PresetButton key={preset.id} preset={preset} />
              ))}
            </div>

            <div className="custom-prompt-section">
              <h4 style={{
                margin: 0,
                marginBottom: EDITOR_THEME.spacing.md,
                fontSize: EDITOR_THEME.typography.fontSize.sm,
                fontWeight: EDITOR_THEME.typography.fontWeight.medium,
                color: EDITOR_THEME.colors.text.primary
              }}>
                Custom Enhancement
              </h4>
              
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe how you want to enhance this image..."
                disabled={isProcessing}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: EDITOR_THEME.spacing.md,
                  backgroundColor: EDITOR_THEME.colors.background.card,
                  border: `1px solid ${EDITOR_THEME.colors.border.primary}`,
                  borderRadius: EDITOR_THEME.radius.medium,
                  color: EDITOR_THEME.colors.text.primary,
                  fontSize: EDITOR_THEME.typography.fontSize.sm,
                  fontFamily: EDITOR_THEME.typography.fontFamily,
                  resize: 'vertical',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = EDITOR_THEME.colors.border.focus;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = EDITOR_THEME.colors.border.primary;
                }}
              />
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: EDITOR_THEME.spacing.sm
              }}>
                <span style={{
                  fontSize: EDITOR_THEME.typography.fontSize.xs,
                  color: EDITOR_THEME.colors.primary
                }}>
                  Est. cost: 8 credits
                </span>
                
                <button
                  onClick={() => onAIProcess('custom_prompt', { 
                    prompt: customPrompt, 
                    cost: 8 
                  })}
                  disabled={!customPrompt.trim() || isProcessing || credits < 8}
                  style={{
                    padding: `${EDITOR_THEME.spacing.sm} ${EDITOR_THEME.spacing.md}`,
                    backgroundColor: EDITOR_THEME.colors.primary,
                    border: 'none',
                    borderRadius: EDITOR_THEME.radius.medium,
                    color: '#ffffff',
                    fontSize: EDITOR_THEME.typography.fontSize.sm,
                    fontWeight: EDITOR_THEME.typography.fontWeight.medium,
                    fontFamily: EDITOR_THEME.typography.fontFamily,
                    cursor: 'pointer',
                    transition: EDITOR_THEME.transitions.normal,
                    opacity: (!customPrompt.trim() || isProcessing || credits < 8) ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (customPrompt.trim() && !isProcessing && credits >= 8) {
                      e.target.style.backgroundColor = EDITOR_THEME.colors.primaryHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = EDITOR_THEME.colors.primary;
                  }}
                >
                  {isProcessing ? 'Processing...' : 'Enhance'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'inpaint':
        return (
          <div className="inpaint-tools">
            <h3 style={{ 
              margin: 0,
              marginBottom: EDITOR_THEME.spacing.lg,
              fontSize: EDITOR_THEME.typography.fontSize.md,
              fontWeight: EDITOR_THEME.typography.fontWeight.semibold,
              color: EDITOR_THEME.colors.text.primary
            }}>
              Inpainting Tools
            </h3>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: EDITOR_THEME.spacing.sm,
              marginBottom: EDITOR_THEME.spacing.lg
            }}>
              {[
                { icon: 'brush', label: 'Remove Objects', cost: 3 },
                { icon: 'eraser', label: 'Background Removal', cost: 4 },
                { icon: 'wand', label: 'Smart Fill', cost: 2 }
              ].map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => onInpaint(tool.label.toLowerCase(), { cost: tool.cost })}
                  disabled={isProcessing || credits < tool.cost}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: EDITOR_THEME.spacing.md,
                    backgroundColor: EDITOR_THEME.colors.background.card,
                    border: `1px solid ${EDITOR_THEME.colors.border.primary}`,
                    borderRadius: EDITOR_THEME.radius.medium,
                    color: EDITOR_THEME.colors.text.secondary,
                    cursor: credits < tool.cost ? 'not-allowed' : 'pointer',
                    fontSize: EDITOR_THEME.typography.fontSize.sm,
                    fontFamily: EDITOR_THEME.typography.fontFamily,
                    transition: EDITOR_THEME.transitions.normal,
                    opacity: credits < tool.cost ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (credits >= tool.cost && !isProcessing) {
                      e.target.style.backgroundColor = EDITOR_THEME.colors.background.hover;
                      e.target.style.borderColor = EDITOR_THEME.colors.primary;
                      e.target.style.color = EDITOR_THEME.colors.text.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = EDITOR_THEME.colors.background.card;
                    e.target.style.borderColor = EDITOR_THEME.colors.border.primary;
                    e.target.style.color = EDITOR_THEME.colors.text.secondary;
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: EDITOR_THEME.spacing.sm }}>
                    <Icon name={tool.icon} size={16} color={EDITOR_THEME.colors.primary} />
                    {tool.label}
                  </div>
                  <span style={{
                    fontSize: EDITOR_THEME.typography.fontSize.xs,
                    color: EDITOR_THEME.colors.primary,
                    fontWeight: EDITOR_THEME.typography.fontWeight.medium
                  }}>
                    {tool.cost} credits
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <aside
      className="editor-sidebar"
      style={{
        width: '320px',
        height: '100%',
        backgroundColor: EDITOR_THEME.colors.background.secondary,
        borderRight: `1px solid ${EDITOR_THEME.colors.border.primary}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Mode Tabs */}
      <div
        className="mode-tabs"
        style={{
          padding: EDITOR_THEME.spacing.xl,
          borderBottom: `1px solid ${EDITOR_THEME.colors.border.secondary}`,
          display: 'flex',
          flexDirection: 'column',
          gap: EDITOR_THEME.spacing.sm,
        }}
      >
        {modes.map(mode => (
          <ModeTab
            key={mode.id}
            mode={mode}
            isActive={currentMode === mode.id}
            onClick={onModeChange}
          />
        ))}
      </div>

      {/* Mode Content */}
      <div
        className="mode-content"
        style={{
          flex: 1,
          padding: EDITOR_THEME.spacing.xl,
          overflowY: 'auto',
        }}
      >
        {renderModeContent()}
      </div>
    </aside>
  );
};

export default EditorSidebar;