import React, { createContext, useContext, useState } from 'react';
import AuthModal from '../components/AuthModal';

const AuthModalContext = createContext();

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children, onAuthSuccess }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const openAuth = () => {
    console.log('🔐 AuthModalContext: Opening auth modal');
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    console.log('🔐 AuthModalContext: Closing auth modal');
    setIsAuthOpen(false);
  };

  const handleAuthSuccess = (userData) => {
    console.log('🔐 AuthModalContext: Auth success:', userData);
    closeAuth();
    if (onAuthSuccess) {
      onAuthSuccess(userData);
    }
  };

  // Debug logging
  console.log('🔐 AuthModalProvider rendered, isAuthOpen:', isAuthOpen);

  return (
    <AuthModalContext.Provider
      value={{
        isAuthOpen,
        openAuth,
        closeAuth,
      }}
    >
      {children}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={closeAuth}
        onAuthSuccess={handleAuthSuccess}
      />
    </AuthModalContext.Provider>
  );
};