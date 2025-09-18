import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside a specific element
 * @param {Function} callback - Function to call when clicking outside
 * @returns {Object} ref - Ref to attach to the element you want to detect outside clicks for
 */
export const useClickOutside = (callback) => {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [callback]);

  return ref;
};

export default useClickOutside;