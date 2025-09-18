import { useState, useEffect, useRef, useCallback } from 'react';

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef(null);

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  };

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, defaultOptions);

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [defaultOptions, hasIntersected]);

  return [targetRef, isIntersecting, hasIntersected];
};

// Lazy image loading hook
export const useLazyImage = (src, placeholder = null) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (hasIntersected && src && !isLoaded) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        setIsError(false);
      };

      img.onerror = () => {
        setIsError(true);
        setImageSrc(placeholder || '/api/placeholder/400/300');
      };

      img.src = src;
    }
  }, [hasIntersected, src, placeholder, isLoaded]);

  return {
    ref: imageRef,
    src: imageSrc,
    isLoaded,
    isError,
    isIntersecting
  };
};

// Infinite scroll hook
export const useInfiniteScroll = (callback, options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '100px',
    ...options
  };

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await callback(page);
      
      if (result && result.hasMore !== undefined) {
        setHasMore(result.hasMore);
      }
      
      if (result && result.data && result.data.length > 0) {
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err);
      console.error('Infinite scroll error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [callback, isLoading, hasMore, page]);

  const [triggerRef, isIntersecting] = useIntersectionObserver(defaultOptions);

  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      loadMore();
    }
  }, [isIntersecting, hasMore, isLoading, loadMore]);

  const reset = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    triggerRef,
    isLoading,
    hasMore,
    page,
    error,
    loadMore,
    reset
  };
};

// Batch loading hook for multiple items
export const useBatchLoading = (items, batchSize = 10, delay = 100) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNextBatch = useCallback(() => {
    if (currentIndex >= items.length) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const nextIndex = Math.min(currentIndex + batchSize, items.length);
      const newBatch = items.slice(currentIndex, nextIndex);
      
      setVisibleItems(prev => [...prev, ...newBatch]);
      setCurrentIndex(nextIndex);
      setIsLoading(false);
    }, delay);
  }, [items, batchSize, delay, currentIndex]);

  useEffect(() => {
    if (items.length > 0 && visibleItems.length === 0) {
      loadNextBatch();
    }
  }, [items, visibleItems.length, loadNextBatch]);

  // Reset when items array changes
  useEffect(() => {
    setVisibleItems([]);
    setCurrentIndex(0);
    setIsLoading(false);
  }, [items]);

  const hasMore = currentIndex < items.length;

  return {
    visibleItems,
    hasMore,
    isLoading,
    loadNextBatch
  };
};

export default {
  useIntersectionObserver,
  useLazyImage,
  useInfiniteScroll,
  useBatchLoading
};
