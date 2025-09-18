import React from 'react';
import './Card.css';

const Card = React.forwardRef(({ 
  children, 
  variant = 'default', 
  padding = 'base',
  hoverable = false,
  clickable = false,
  className = '',
  ...props 
}, ref) => {
  const baseClass = 'promosuite-card';
  const variantClass = `promosuite-card--${variant}`;
  const paddingClass = `promosuite-card--padding-${padding}`;
  const hoverableClass = hoverable ? 'promosuite-card--hoverable' : '';
  const clickableClass = clickable ? 'promosuite-card--clickable' : '';

  const classes = [
    baseClass,
    variantClass,
    paddingClass,
    hoverableClass,
    clickableClass,
    className
  ].filter(Boolean).join(' ');

  const Component = clickable ? 'button' : 'div';

  return (
    <Component
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

// Card subcomponents
const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`promosuite-card__header ${className}`} {...props}>
    {children}
  </div>
);

const CardBody = ({ children, className = '', ...props }) => (
  <div className={`promosuite-card__body ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`promosuite-card__footer ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`promosuite-card__title ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`promosuite-card__description ${className}`} {...props}>
    {children}
  </p>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Description = CardDescription;

export default Card;

