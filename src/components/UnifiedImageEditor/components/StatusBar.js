import React from 'react';

const StatusBar = ({ message, isLoading, credits }) => {
  return (
    <div className="status-bar">
      <div className="status-message">
        {isLoading && <div className="status-loading" />}
        <span>{message}</span>
      </div>
      
      <div className="status-credits">
        💎 {credits} credits remaining
      </div>
    </div>
  );
};

export default StatusBar;