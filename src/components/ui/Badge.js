import React from 'react';
import './Badge.css';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'base',
  className = '',
  ...props 
}) => {
  const baseClass = 'promosuite-badge';
  const variantClass = `promosuite-badge--${variant}`;
  const sizeClass = `promosuite-badge--${size}`;

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;

