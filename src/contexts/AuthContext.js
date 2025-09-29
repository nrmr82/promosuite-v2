import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import SignInOutPopup from '../components/SignInOutPopup';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    // Note: Auth state management is handled by the main App component
    // This AuthContext is only used for the popup functionality
    // Initial session is handled by authService in App.js
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email, password, options = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options.data || {}
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    try {
      // Show popup immediately
      setPopupMessage('Signing out...');
      setIsPopupVisible(true);
      
      // Delay actual sign-out to show popup
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Perform sign out
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Keep popup visible briefly after sign-out
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsPopupVisible(false);
      
      // Delay page refresh to allow popup to be seen
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error) {
      console.error('Sign out error:', error);
      setPopupMessage('Error signing out');
      setIsPopupVisible(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsPopupVisible(false);
    }
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const showPopup = useCallback((message) => {
    setPopupMessage(message);
    setIsPopupVisible(true);
  }, []);

  const hidePopup = useCallback(() => {
    setIsPopupVisible(false);
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isPopupVisible,
    popupMessage,
    showPopup,
    hidePopup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SignInOutPopup show={isPopupVisible} message={popupMessage} />
    </AuthContext.Provider>
  );
};

export default AuthContext;
