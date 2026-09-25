import React from 'react';
import { errorHandler, ERROR_TYPES, ERROR_SEVERITY } from '../utils/errorHandling';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    const errorId = errorHandler.logError(error, {
      type: ERROR_TYPES.GENERIC_ERROR,
      componentStack: errorInfo.componentStack,
      component: this.props.componentName || 'Unknown'
    }, ERROR_SEVERITY.CRITICAL);

    this.setState({
      error,
      errorInfo,
      errorId
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // Use different fallbacks based on error type or severity
      const { level = 'default' } = this.props;

      if (level === 'minimal') {
        return (
          <div className="error-boundary minimal">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-message">Something went wrong</span>
              <button className="retry-btn" onClick={this.handleRetry}>
                Try again
              </button>
            </div>
          </div>
        );
      }

      if (level === 'inline') {
        return (
          <div className="error-boundary inline">
            <div className="error-content">
              <div className="error-icon">🔧</div>
              <div className="error-text">
                <h4>Unable to load this section</h4>
                <p>Please try refreshing or contact support if the problem continues.</p>
              </div>
              <div className="error-actions">
                <button className="btn-secondary small" onClick={this.handleRetry}>
                  Retry
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Default full-page error
      return (
        <div className="error-boundary full">
          <div className="error-container">
            <div className="error-animation">
              <div className="error-icon-large">🚨</div>
              <div className="error-pulse"></div>
            </div>
            
            <div className="error-content">
              <h1 className="error-title">Oops! Something went wrong</h1>
              <p className="error-description">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
              
              {this.state.error && (
                <div className="error-details" style={{ background: '#f8f9fa', padding: '15px', margin: '15px 0', borderRadius: '5px', textAlign: 'left' }}>
                  <strong>Error Details:</strong>
                  <div style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
                    <strong>Error:</strong> {this.state.error.toString()}
                    <br /><br />
                    <strong>Component Stack:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px' }}>{this.state.errorInfo?.componentStack}</pre>
                  </div>
                </div>
              )}
              
              <div className="error-actions">
                <button className="btn-primary" onClick={this.handleRetry}>
                  Try Again
                </button>
                <button className="btn-secondary" onClick={this.handleReload}>
                  Reload Page
                </button>
              </div>
              
              {this.state.errorId && (
                <div className="error-id">
                  Error ID: <code>{this.state.errorId}</code>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = (Component, options = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary 
      level={options.level || 'default'} 
      componentName={Component.displayName || Component.name}
      fallback={options.fallback}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hooks for error handling
export const useErrorRecovery = () => {
  const [hasError, setHasError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  const reportError = React.useCallback((error, context = {}) => {
    setHasError(true);
    errorHandler.logError(error, context, ERROR_SEVERITY.HIGH);
  }, []);

  const retry = React.useCallback(() => {
    setHasError(false);
    setRetryCount(prev => prev + 1);
  }, []);

  const reset = React.useCallback(() => {
    setHasError(false);
    setRetryCount(0);
  }, []);

  return {
    hasError,
    retryCount,
    reportError,
    retry,
    reset
  };
};

export default ErrorBoundary;
