import React from 'react';
import { useTemplate } from '../contexts/TemplateContext';

const FlyerProDiagnostic = ({ onOpenAuth, onToolUsage, user }) => {
  console.log('FlyerProDiagnostic rendering...');
  
  try {
    const templateContext = useTemplate();
    console.log('Template context loaded:', templateContext);
    
    return (
      <div className="flyerpro-diagnostic">
        <h1>FlyerPro Diagnostic</h1>
        <p>Template context working: {templateContext ? 'Yes' : 'No'}</p>
        <p>User: {user ? user.email || 'Logged in' : 'Not logged in'}</p>
        <button onClick={() => console.log('Button clicked')}>
          Test Button
        </button>
      </div>
    );
  } catch (error) {
    console.error('Error in FlyerProDiagnostic:', error);
    return (
      <div className="flyerpro-diagnostic-error">
        <h1>Diagnostic Error</h1>
        <p>Error: {error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
};

export default FlyerProDiagnostic;
