// Editor Theme Constants - Matching PromoSuite Design System
export const EDITOR_THEME = {
  // Colors matching your project
  colors: {
    primary: '#e91e63',           // Pink brand color
    primaryHover: '#d81b60',      // Darker pink for hover
    primaryLight: 'rgba(233, 30, 99, 0.1)', // Light pink background
    
    background: {
      primary: '#1a1a1a',         // Main dark background
      secondary: 'rgba(26, 26, 26, 0.9)', // Sidebar background
      modal: 'rgba(0, 0, 0, 0.75)', // Modal backdrop
      card: 'rgba(42, 42, 42, 0.6)', // Card backgrounds
      hover: 'rgba(42, 42, 42, 0.8)', // Hover states
    },
    
    text: {
      primary: '#ffffff',          // Main white text
      secondary: '#cccccc',        // Secondary gray text  
      muted: '#aaaaaa',           // Muted gray text
      accent: '#e91e63',          // Pink accent text
    },
    
    border: {
      primary: 'rgba(51, 51, 51, 0.8)',     // Main borders
      secondary: 'rgba(51, 51, 51, 0.5)',   // Lighter borders
      focus: '#e91e63',                      // Focus borders
    },
    
    status: {
      success: '#4caf50',
      warning: '#ff9800', 
      error: '#f44336',
      info: '#2196f3',
    }
  },
  
  // Border radius
  radius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '50%',
  },
  
  // Shadows
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.35)',
    large: '0 8px 24px rgba(0, 0, 0, 0.4)',
    modal: '0 10px 40px rgba(0, 0, 0, 0.6)',
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    xxl: '2rem',      // 32px
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1300,
    tooltip: 1400,
  },
  
  // Transitions
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
    spring: '0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Typography
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

// CSS utility classes
export const EDITOR_CLASSES = {
  modal: 'editor-modal',
  sidebar: 'editor-sidebar',
  canvas: 'editor-canvas', 
  header: 'editor-header',
  button: 'editor-button',
  card: 'editor-card',
  panel: 'editor-panel',
};