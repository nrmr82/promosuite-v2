import React, { useEffect, useRef } from 'react';
import styles from './SignInOutPopup.module.css';

const SignInOutPopup = ({ isVisible, message }) => {
  const overlayRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      
      // Ensure the popup is visible
      if (overlayRef.current) {
        overlayRef.current.style.display = 'flex';
      }
    } else {
      // Add a small delay before hiding to allow fade-out animation
      const timer = setTimeout(() => {
        if (overlayRef.current) {
          overlayRef.current.style.display = 'none';
        }
        // Restore scrolling when popup is hidden
        document.body.style.overflow = 'unset';
      }, 200); // Match this with CSS transition duration
      
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isVisible) {
      e.preventDefault();
      // Note: We don't handle closing here as it's controlled by timeout
    }
  };

  return (
    <div
      ref={overlayRef}
      className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div
        ref={popupRef}
        className={styles.popup}
        role="alert"
        aria-live="polite"
      >
        <div className={styles.spinner} aria-hidden="true" />
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default SignInOutPopup;