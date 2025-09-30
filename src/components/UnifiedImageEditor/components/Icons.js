import React from 'react';

// Professional single-color SVG icons matching your project's design
export const EditorIcon = ({ name, size = 20, color = '#cccccc', className = '' }) => {
  const iconProps = {
    width: size,
    height: size,
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `editor-icon ${className}`,
  };

  const icons = {
    // Mode icons
    design: (
      <svg {...iconProps}>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </svg>
    ),
    
    ai: (
      <svg {...iconProps}>
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="m15 13-1 5-1-5" />
        <path d="m9 13 1 5 1-5" />
      </svg>
    ),
    
    inpaint: (
      <svg {...iconProps}>
        <path d="M15 5l4 4L7 21l-4.5-4.5L15 5z" />
        <path d="m13 7 4 4" />
      </svg>
    ),
    
    // Tool icons
    upload: (
      <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="12" y1="17" x2="12" y2="9" />
      </svg>
    ),
    
    save: (
      <svg {...iconProps}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17,21 17,13 7,13 7,21" />
        <polyline points="7,3 7,8 15,8" />
      </svg>
    ),
    
    export: (
      <svg {...iconProps}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    
    close: (
      <svg {...iconProps}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    
    // Feature icons
    folder: (
      <svg {...iconProps}>
        <path d="M4 4h5.5l2 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      </svg>
    ),
    
    image: (
      <svg {...iconProps}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
    
    text: (
      <svg {...iconProps}>
        <polyline points="4,7 4,4 20,4 20,7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
    
    shapes: (
      <svg {...iconProps}>
        <rect width="18" height="18" x="3" y="3" rx="2" />
      </svg>
    ),
    
    brush: (
      <svg {...iconProps}>
        <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
        <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
      </svg>
    ),
    
    eraser: (
      <svg {...iconProps}>
        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
        <path d="M22 21H7" />
        <path d="m5 11 9 9" />
      </svg>
    ),
    
    wand: (
      <svg {...iconProps}>
        <path d="M15 4V2" />
        <path d="M15 16v-2" />
        <path d="M8 9h2" />
        <path d="M20 9h2" />
        <path d="M17.8 11.8 19 13" />
        <path d="M15 9h0" />
        <path d="M17.8 6.2 19 5" />
        <path d="m3 21 9-9" />
        <path d="M12.2 6.2 11 5" />
      </svg>
    ),
    
    diamond: (
      <svg {...iconProps}>
        <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
      </svg>
    ),
    
    undo: (
      <svg {...iconProps}>
        <path d="M3 7v6h6" />
        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
      </svg>
    ),
    
    redo: (
      <svg {...iconProps}>
        <path d="M21 7v6h-6" />
        <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
      </svg>
    ),
    
    zoom_in: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    
    zoom_out: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    
    layers: (
      <svg {...iconProps}>
        <polygon points="12,2 2,7 12,12 22,7 12,2" />
        <polyline points="2,17 12,22 22,17" />
        <polyline points="2,12 12,17 22,12" />
      </svg>
    ),
    
    eye: (
      <svg {...iconProps}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-3-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    
    eye_off: (
      <svg {...iconProps}>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
    ),
    
    lock: (
      <svg {...iconProps}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    
    unlock: (
      <svg {...iconProps}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </svg>
    ),
    
    grid: (
      <svg {...iconProps}>
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
    
    // Beauty presets icons
    user: (
      <svg {...iconProps}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    
    sun: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2" />
        <path d="M12 21v2" />
        <path d="M4.22 4.22l1.42 1.42" />
        <path d="M18.36 18.36l1.42 1.42" />
        <path d="M1 12h2" />
        <path d="M21 12h2" />
        <path d="M4.22 19.78l1.42-1.42" />
        <path d="M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    
    sparkles: (
      <svg {...iconProps}>
        <path d="M9 11L7 9l2-2 2 2-2 2z" />
        <path d="M13 5l3-3 3 3-3 3-3-3z" />
        <path d="M11 18l-1-1 1-1 1 1-1 1z" />
        <path d="M20 20l-2-2 2-2 2 2-2 2z" />
      </svg>
    ),
    
    briefcase: (
      <svg {...iconProps}>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  };

  return icons[name] || null;
};

// Wrapper component for easier usage
export const Icon = ({ name, size, color, className, ...props }) => (
  <EditorIcon name={name} size={size} color={color} className={className} {...props} />
);