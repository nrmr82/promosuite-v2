import React, { useState } from 'react';

const CreditManager = ({ credits }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getCreditStatus = () => {
    if (credits > 30) return { status: 'good', color: '#4caf50' };
    if (credits > 10) return { status: 'warning', color: '#ff9800' };
    return { status: 'low', color: '#f44336' };
  };

  const creditStatus = getCreditStatus();

  return (
    <div className="credit-manager">
      <span className="credit-icon">💎</span>
      <span className="credit-count" style={{ color: creditStatus.color }}>
        {credits}
      </span>
      <span>credits</span>
      
      {creditStatus.status === 'low' && (
        <button 
          className="action-btn primary"
          style={{ fontSize: '11px', padding: '4px 8px', marginLeft: '8px' }}
          onClick={() => alert('Purchase more credits!')}
        >
          Buy More
        </button>
      )}
    </div>
  );
};

export default CreditManager;