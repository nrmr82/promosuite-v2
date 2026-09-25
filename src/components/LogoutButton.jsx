import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LogoutButton = ({ onLogout, className, children, confirmMessage = 'Logout?' }) => {
  const auth = useAuth();

  const handleLogoutClick = async () => {
    if (window.confirm(confirmMessage)) {
      // Call the logout handler with auth context for popup
      await onLogout(auth);
    }
  };

  return (
    <button className={className} onClick={handleLogoutClick}>
      {children}
    </button>
  );
};

export default LogoutButton;