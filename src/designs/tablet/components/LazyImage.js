import React from 'react';
import { useLazyImage } from '../hooks/useLazyLoading';
import './LazyImage.css';

const LazyImage = ({
  src,
  alt = '',
  placeholder = null,
  className = '',
  width,
  height,
  onLoad,
  onError,
  style = {},
  fallbackSrc = '/api/placeholder/400/300',
  loadingComponent = null,
  errorComponent = null,
  ...props
}) => {
  const { ref, src: imageSrc, isLoaded, isError, isIntersecting } = useLazyImage(src, placeholder);

  const handleLoad = (event) => {
    if (onLoad) {
      onLoad(event);
    }
  };

  const handleError = (event) => {
    if (onError) {
      onError(event);
    }
  };

  // Loading state
  if (!isLoaded && !isError && (isIntersecting || placeholder)) {
    if (loadingComponent) {
      return <div ref={ref}>{loadingComponent}</div>;
    }
    
    return (
      <div 
        ref={ref} 
        className={`lazy-image-loading ${className}`}
        style={{
          width,
          height,
          ...style
        }}
        role="img"
        aria-label={`Loading ${alt}`}
      >
        <div className="loading-placeholder">
          <div className="loading-shimmer" />
          <div className="loading-icon">📸</div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    if (errorComponent) {
      return <div ref={ref}>{errorComponent}</div>;
    }
    
    return (
      <div 
        ref={ref}
        className={`lazy-image-error ${className}`}
        style={{
          width,
          height,
          ...style
        }}
        role="img"
        aria-label={`Failed to load ${alt}`}
      >
        <div className="error-placeholder">
          <div className="error-icon">⚠️</div>
          <span className="error-text">Image failed to load</span>
        </div>
      </div>
    );
  }

  // Loaded state
  return (
    <img
      ref={ref}
      src={imageSrc || fallbackSrc}
      alt={alt}
      className={`lazy-image ${isLoaded ? 'loaded' : 'loading'} ${className}`}
      width={width}
      height={height}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};

export default LazyImage;
