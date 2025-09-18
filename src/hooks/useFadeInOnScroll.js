import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for fade-in animation on scroll
 * Inspired by Pictory.ai's smooth animations
 */
export const useFadeInOnScroll = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
};

/**
 * Higher-order component for fade-in animations
 */
export const FadeInOnScroll = ({ 
  children, 
  className = '', 
  delay = 0,
  duration = 0.6,
  ...options 
}) => {
  const [ref, isVisible] = useFadeInOnScroll(options);

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: `translateY(${isVisible ? 0 : '30px'})`,
    transition: `all ${duration}s ease-out ${delay}s`,
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
};

export default useFadeInOnScroll;
