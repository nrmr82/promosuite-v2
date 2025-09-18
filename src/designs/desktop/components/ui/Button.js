import React from 'react';
import './Button.css';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'base', 
  disabled = false, 
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props 
}, ref) => {
  const baseClass = 'promosuite-btn';
  const variantClass = `promosuite-btn--${variant}`;
  const sizeClass = `promosuite-btn--${size}`;
  const fullWidthClass = fullWidth ? 'promosuite-btn--full-width' : '';
  const disabledClass = disabled ? 'promosuite-btn--disabled' : '';
  const loadingClass = loading ? 'promosuite-btn--loading' : '';

  const classes = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    disabledClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (loading) {
      return <div className="promosuite-btn__spinner" />;
    }
    return icon;
  };

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="promosuite-btn__icon promosuite-btn__icon--left">
          {renderIcon()}
        </span>
      )}
      
      <span className="promosuite-btn__content">
        {children}
      </span>
      
      {icon && iconPosition === 'right' && (
        <span className="promosuite-btn__icon promosuite-btn__icon--right">
          {renderIcon()}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

