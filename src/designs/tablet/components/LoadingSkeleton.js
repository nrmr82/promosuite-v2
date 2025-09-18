import React from 'react';
import './LoadingSkeleton.css';

// Basic skeleton component
export const Skeleton = ({ width, height, className = '' }) => (
  <div 
    className={`skeleton ${className}`}
    style={{ 
      width: width || '100%', 
      height: height || '1em' 
    }}
  />
);

// Template card skeleton
export const TemplateCardSkeleton = () => (
  <div className="template-card-skeleton">
    <div className="template-preview-skeleton">
      <Skeleton height="200px" />
    </div>
    <div className="template-info-skeleton">
      <div className="template-header-skeleton">
        <Skeleton width="70%" height="1.2em" />
        <Skeleton width="24px" height="24px" className="circle" />
      </div>
      <Skeleton width="50%" height="0.9em" />
      <Skeleton width="90%" height="0.8em" />
      <Skeleton width="60%" height="0.8em" />
      <div className="template-actions-skeleton">
        <Skeleton width="48%" height="36px" />
        <Skeleton width="48%" height="36px" />
      </div>
    </div>
  </div>
);

// Template grid skeleton
export const TemplateGridSkeleton = ({ count = 8 }) => (
  <div className="templates-grid">
    {Array.from({ length: count }).map((_, index) => (
      <TemplateCardSkeleton key={index} />
    ))}
  </div>
);

// Testimonial skeleton removed

// Stats skeleton
export const StatsSkeleton = () => (
  <div className="success-stats">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="stat-card-skeleton">
        <Skeleton width="60px" height="60px" className="circle" />
        <Skeleton width="80px" height="3rem" />
        <Skeleton width="120px" height="1.2em" />
      </div>
    ))}
  </div>
);

// Modal skeleton
export const ModalSkeleton = () => (
  <div className="modal-overlay">
    <div className="modal-skeleton">
      <div className="modal-header-skeleton">
        <Skeleton width="200px" height="1.5em" />
        <Skeleton width="24px" height="24px" className="circle" />
      </div>
      <div className="modal-content-skeleton">
        <Skeleton width="100%" height="300px" />
        <div className="modal-details-skeleton">
          <Skeleton width="100%" height="1.2em" />
          <Skeleton width="90%" height="1em" />
          <Skeleton width="95%" height="1em" />
          <Skeleton width="80%" height="1em" />
        </div>
      </div>
    </div>
  </div>
);

// Search skeleton
export const SearchSkeleton = () => (
  <div className="search-skeleton">
    <Skeleton width="200px" height="40px" />
    <div className="filters-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} width="80px" height="36px" />
      ))}
    </div>
  </div>
);

// Loading states for different sections
export const LoadingState = ({ type, count }) => {
  switch (type) {
    case 'templates':
      return <TemplateGridSkeleton count={count} />;
    case 'stats':
      return <StatsSkeleton />;
    case 'modal':
      return <ModalSkeleton />;
    case 'search':
      return <SearchSkeleton />;
    default:
      return <Skeleton />;
  }
};

export default LoadingState;
