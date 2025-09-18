import { useState, useEffect, useCallback, useRef } from 'react';

// Focus management hook
export const useFocusManagement = () => {
  const focusedElementRef = useRef(null);

  const saveFocus = useCallback(() => {
    focusedElementRef.current = document.activeElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (focusedElementRef.current && typeof focusedElementRef.current.focus === 'function') {
      focusedElementRef.current.focus();
    }
  }, []);

  const trapFocus = useCallback((element) => {
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    saveFocus,
    restoreFocus,
    trapFocus
  };
};

// Keyboard navigation hook
export const useKeyboardNavigation = (items = [], onSelect, options = {}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const { 
    loop = true, 
    orientation = 'vertical',
    disabled = false 
  } = options;

  const handleKeyDown = useCallback((e) => {
    if (disabled || items.length === 0) return;

    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        setFocusedIndex(prev => {
          if (prev >= items.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
        break;

      case prevKey:
        e.preventDefault();
        setFocusedIndex(prev => {
          if (prev <= 0) {
            return loop ? items.length - 1 : prev;
          }
          return prev - 1;
        });
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && onSelect) {
          onSelect(items[focusedIndex], focusedIndex);
        }
        break;

      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;

      case 'Escape':
        setFocusedIndex(-1);
        break;

      default:
        break;
    }
  }, [items, focusedIndex, onSelect, loop, orientation, disabled]);

  const reset = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  const setFocus = useCallback((index) => {
    if (index >= 0 && index < items.length) {
      setFocusedIndex(index);
    }
  }, [items.length]);

  return {
    focusedIndex,
    handleKeyDown,
    reset,
    setFocus
  };
};

// Announcements for screen readers
export const useScreenReader = () => {
  const [announcements, setAnnouncements] = useState([]);
  const announceTimeoutRef = useRef(null);

  const announce = useCallback((message, priority = 'polite', delay = 100) => {
    if (announceTimeoutRef.current) {
      clearTimeout(announceTimeoutRef.current);
    }

    announceTimeoutRef.current = setTimeout(() => {
      setAnnouncements(prev => [
        ...prev.filter(item => item.id !== message), // Remove duplicate
        {
          id: message,
          message,
          priority,
          timestamp: Date.now()
        }
      ]);

      // Clean up old announcements
      setTimeout(() => {
        setAnnouncements(prev => prev.filter(item => item.timestamp > Date.now() - 5000));
      }, 5000);
    }, delay);
  }, []);

  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
    if (announceTimeoutRef.current) {
      clearTimeout(announceTimeoutRef.current);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (announceTimeoutRef.current) {
        clearTimeout(announceTimeoutRef.current);
      }
    };
  }, []);

  return {
    announcements,
    announce,
    clearAnnouncements
  };
};

// Reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// High contrast mode detection
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    // Check for Windows high contrast mode
    const checkHighContrast = () => {
      // Method 1: Check for forced-colors media query
      if (window.matchMedia('(forced-colors: active)').matches) {
        setPrefersHighContrast(true);
        return;
      }

      // Method 2: Check for prefers-contrast media query
      if (window.matchMedia('(prefers-contrast: high)').matches) {
        setPrefersHighContrast(true);
        return;
      }

      setPrefersHighContrast(false);
    };

    checkHighContrast();

    const mediaQuery = window.matchMedia('(forced-colors: active)');
    mediaQuery.addEventListener('change', checkHighContrast);

    return () => mediaQuery.removeEventListener('change', checkHighContrast);
  }, []);

  return prefersHighContrast;
};

// Skip links functionality
export const useSkipLinks = () => {
  const skipLinksRef = useRef([]);

  const registerSkipLink = useCallback((id, label, target) => {
    const skipLink = { id, label, target };
    skipLinksRef.current.push(skipLink);

    return () => {
      skipLinksRef.current = skipLinksRef.current.filter(link => link.id !== id);
    };
  }, []);

  const focusTarget = useCallback((targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      // Add tabindex temporarily for non-interactive elements
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => {
          target.removeAttribute('tabindex');
        }, { once: true });
      }
    }
  }, []);

  return {
    skipLinks: skipLinksRef.current,
    registerSkipLink,
    focusTarget
  };
};

// ARIA live regions
export const useAriaLive = () => {
  const liveRegionRef = useRef(null);

  const announceToRegion = useCallback((message, priority = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;

      // Clear message after announcement
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return {
    liveRegionRef,
    announceToRegion
  };
};

// Color contrast utilities
export const getContrastRatio = (color1, color2) => {
  // Simple contrast ratio calculation
  const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const parseColor = (color) => {
    // Simple hex color parsing
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return { r, g, b };
  };

  const color1RGB = parseColor(color1);
  const color2RGB = parseColor(color2);

  const lum1 = getLuminance(color1RGB.r, color1RGB.g, color1RGB.b);
  const lum2 = getLuminance(color2RGB.r, color2RGB.g, color2RGB.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

export const meetsWCAGContrast = (color1, color2, level = 'AA', size = 'normal') => {
  const ratio = getContrastRatio(color1, color2);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
};

export default {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReader,
  useReducedMotion,
  useHighContrast,
  useSkipLinks,
  useAriaLive,
  getContrastRatio,
  meetsWCAGContrast
};
