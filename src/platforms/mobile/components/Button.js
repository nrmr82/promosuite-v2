/**
 * Mobile Button Component
 * Touch-optimized button that maintains desktop theme and functionality
 */

import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = [
    'mobile-button',
    `mobile-button--${variant}`,
    `mobile-button--${size}`,
    fullWidth && 'mobile-button--full-width',
    disabled && 'mobile-button--disabled',
    loading && 'mobile-button--loading',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) return;
    
    // Add ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.className = 'mobile-button__ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 400);
    
    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      <span className="mobile-button__content">
        {loading && (
          <span className="mobile-button__spinner" />
        )}
        {children}
      </span>
    </button>
  );
};

// Variant shortcuts
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;

export default Button;