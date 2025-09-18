import React from 'react';

const Icon = ({ type, ...props }) => {
  const icons = {
    rocket: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2L13.09 8.26L22 12L13.09 15.74L12 22L10.91 15.74L2 12L10.91 8.26L12 2Z" />
      </svg>
    ),
    design: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
        <circle cx="8" cy="8" r="2" />
        <path d="M14 14L20 20" />
        <path d="M14 14L16 12" />
      </svg>
    ),
    video: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <polygon points="5,3 19,12 5,21" />
      </svg>
    ),
    check: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <polyline points="20,6 9,17 4,12" />
      </svg>
    ),
    image: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    ),
    users: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.1909 16.6768C21.6662 15.9996 20.9296 15.4926 20.087 15.2273" />
        <path d="M16 3.12988C16.8426 3.39518 17.5792 3.90215 18.1038 4.57943C18.6284 5.25671 18.9129 6.06712 18.9129 6.90244C18.9129 7.73776 18.6284 8.54817 18.1038 9.22544C17.5792 9.90272 16.8426 10.4097 16 10.675" />
      </svg>
    )
  };

  return icons[type] || null;
};

export default Icon;
