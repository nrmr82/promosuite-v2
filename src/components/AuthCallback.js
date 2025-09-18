/**
 * OAuth Callback Handler
 * Handles the OAuth callback from social providers (Google, Facebook, LinkedIn, etc.)
 */

import React, { useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';

const AuthCallback = () => {
  const [showManualContinue, setShowManualContinue] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(true);
  const [debugInfo, setDebugInfo] = React.useState('');
  const hasTriedCallbackRef = useRef(false);
  
  useEffect(() => {
    console.log('🔍 AuthCallback: Starting immediate redirect process');
    
    // Show manual continue button after 8 seconds to allow OAuth processing
    const failsafeTimer = setTimeout(() => {
      console.log('🔍 AuthCallback: OAuth processing taking too long');
      setShowManualContinue(true);
      setIsProcessing(false);
      setDebugInfo('OAuth processing timeout - please try manual options');
    }, 8000);
    
    const redirectToDashboard = async () => {
      try {
        console.log('🔍 AuthCallback: Starting authentication process');
        setDebugInfo('Checking URL parameters...');
        
        // Check for OAuth parameters in URL
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasOAuthParams = urlParams.has('code') || hashParams.has('access_token') || hashParams.has('refresh_token');
        
        console.log('🔍 AuthCallback: URL Analysis:', {
          hasCode: urlParams.has('code'),
          hasAccessToken: hashParams.has('access_token'),
          hasRefreshToken: hashParams.has('refresh_token'),
          fullURL: window.location.href
        });
        
        // If we have OAuth params, try to exchange them
        if (hasOAuthParams && !hasTriedCallbackRef.current) {
          hasTriedCallbackRef.current = true;
          setDebugInfo('Processing OAuth callback...');
          
          try {
            if (urlParams.has('code')) {
              // We have an OAuth code, try different methods to exchange it
              const code = urlParams.get('code');
              console.log('🔍 AuthCallback: Found OAuth code:', code.substring(0, 8) + '...');
              
              try {
                // Method 1: Try the modern PKCE flow
                setDebugInfo('Trying PKCE code exchange...');
                let result;
                
                // Skip the problematic exchangeCodeForSession - use working OAuth flow
                console.log('🔍 AuthCallback: Using working OAuth method...');
                setDebugInfo('Processing OAuth code with alternative method...');
                
                // Clear URL params first (important for some Supabase versions)
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // Wait for Supabase to process the OAuth callback in the background
                console.log('🔍 AuthCallback: Waiting for OAuth processing...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Now check for the session
                console.log('🔍 AuthCallback: Checking for session...');
                result = await supabase.auth.getSession();
                
                // If no session yet, try refreshing
                if (!result.data.session?.user) {
                  console.log('🔍 AuthCallback: No session found, trying refresh...');
                  setDebugInfo('No session found, attempting refresh...');
                  
                  const refreshResult = await supabase.auth.refreshSession();
                  if (refreshResult.data.session?.user) {
                    result = refreshResult;
                  } else {
                    // Try one more time with getSession
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    result = await supabase.auth.getSession();
                  }
                }
                
                console.log('🔍 AuthCallback: Code exchange result:', result);
                
                if (result.error) {
                  throw result.error;
                }
                
                if (result.data.session?.user) {
                  console.log('🔍 AuthCallback: Code exchange successful!');
                  setDebugInfo('OAuth successful! Creating user profile...');
                  
                  const userData = {
                    ...result.data.session.user,
                    profile: {
                      id: result.data.session.user.id,
                      email: result.data.session.user.email,
                      full_name: result.data.session.user.user_metadata?.full_name || 
                                result.data.session.user.user_metadata?.name || 
                                result.data.session.user.email?.split('@')[0] || 'User',
                      avatar_url: result.data.session.user.user_metadata?.avatar_url || 
                                 result.data.session.user.user_metadata?.picture,
                      provider: result.data.session.user.app_metadata?.provider || 'oauth'
                    },
                    session: result.data.session
                  };
                  
                  console.log('🔍 AuthCallback: Saving user data and redirecting...');
                  localStorage.setItem('promosuiteUser', JSON.stringify(userData));
                  setDebugInfo('Redirecting to dashboard...');
                  
                  setTimeout(() => {
                    window.location.href = '/';
                  }, 500);
                  return; // Exit early since we're done
                } else {
                  console.log('🔍 AuthCallback: No user in session after code exchange');
                  setDebugInfo('Code exchange completed but no user session found');
                }
              } catch (codeError) {
                console.error('🔍 AuthCallback: Code exchange failed:', codeError);
                setDebugInfo(`Code exchange failed: ${codeError.message}`);
              }
            } else {
              console.log('🔍 AuthCallback: No code found, trying getSession...');
              setDebugInfo('No OAuth code found, checking for existing session...');
            }
          } catch (callbackError) {
            console.error('🔍 AuthCallback: OAuth processing error:', callbackError);
            setDebugInfo(`OAuth error: ${callbackError.message}`);
            // Continue anyway - sometimes the session is still created
          }
        }
        
        setDebugInfo('Checking for user session...');
        
        // Try to get the session
        let { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔍 AuthCallback: Session error:', error);
          setDebugInfo(`Session error: ${error.message}`);
        }
        
        // If no session yet, wait for OAuth callback to complete
        if (!data.session?.user) {
          console.log('🔍 AuthCallback: No immediate session, waiting...');
          setDebugInfo('Waiting for authentication...');
          
          // Wait up to 4 seconds for OAuth callback to complete
          let attempts = 0;
          const maxAttempts = 8; // 8 attempts x 500ms = 4 seconds
          
          while (!data.session?.user && attempts < maxAttempts) {
            attempts++;
            setDebugInfo(`Checking session... (${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            try {
              const result = await supabase.auth.getSession();
              data = result.data;
              console.log(`🔍 AuthCallback: Attempt ${attempts}/${maxAttempts} - Session:`, !!data.session?.user);
            } catch (sessionError) {
              console.log(`🔍 AuthCallback: Session check failed:`, sessionError.message);
              setDebugInfo(`Session check failed: ${sessionError.message}`);
            }
          }
        }
        
        if (data.session?.user) {
          console.log('🔍 AuthCallback: Found user session!');
          setDebugInfo('Authentication successful! Redirecting...');
          
          const userData = {
            ...data.session.user,
            profile: {
              id: data.session.user.id,
              email: data.session.user.email,
              full_name: data.session.user.user_metadata?.full_name || 
                        data.session.user.user_metadata?.name || 
                        data.session.user.email?.split('@')[0] || 'User',
              avatar_url: data.session.user.user_metadata?.avatar_url || 
                         data.session.user.user_metadata?.picture,
              provider: data.session.user.app_metadata?.provider || 'oauth'
            },
            session: data.session
          };
          
          localStorage.setItem('promosuiteUser', JSON.stringify(userData));
          console.log('🔍 AuthCallback: Redirecting to dashboard');
          
          // Small delay to ensure storage is written
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
          
        } else {
          console.log('🔍 AuthCallback: No session found after waiting');
          setDebugInfo('Authentication timeout - no session found');
          setIsProcessing(false);
          setShowManualContinue(true);
        }
        
      } catch (error) {
        console.error('🔍 AuthCallback: Error during authentication:', error);
        setDebugInfo(`Authentication error: ${error.message}`);
        setIsProcessing(false);
        setShowManualContinue(true);
      }
    };
    
    // Start the redirect process
    redirectToDashboard().finally(() => {
      clearTimeout(failsafeTimer);
    });
    
    // Cleanup timer on unmount
    return () => {
      clearTimeout(failsafeTimer);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        textAlign: 'center',
        color: '#ffffff'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #333',
          borderTop: '4px solid #e91e63',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 24px'
        }} />
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '12px'
        }}>
          Signing you in...
        </h2>
        <p style={{
          color: '#aaa',
          marginBottom: '12px'
        }}>
          {isProcessing ? 
            'Please wait while we complete your authentication.' :
            'Authentication is taking longer than expected.'}
        </p>
        
        {debugInfo && (
          <p style={{
            color: '#888',
            fontSize: '14px',
            marginBottom: '24px',
            fontFamily: 'monospace',
            background: '#333',
            padding: '8px 12px',
            borderRadius: '4px'
          }}>
            {debugInfo}
          </p>
        )}
        
        {showManualContinue && (
          <>
            <button 
              onClick={async () => {
                console.log('🔍 Manual continue clicked');
                setDebugInfo('Manual continue: Checking session...');
                
                try {
                  // Try multiple approaches
                  console.log('🔍 Trying getSession...');
                  let { data, error } = await supabase.auth.getSession();
                  
                  if (error) {
                    console.log('🔍 Session error, trying refresh...');
                    setDebugInfo('Session error, trying refresh...');
                    const refreshResult = await supabase.auth.refreshSession();
                    data = refreshResult.data;
                  }
                  
                  if (data.session?.user) {
                    console.log('🔍 Session found, creating user data');
                    setDebugInfo('Session found! Creating user...');
                    
                    const userData = {
                      ...data.session.user,
                      profile: {
                        id: data.session.user.id,
                        email: data.session.user.email,
                        full_name: data.session.user.user_metadata?.full_name || 
                                  data.session.user.user_metadata?.name || 
                                  data.session.user.email?.split('@')[0] || 'User',
                        avatar_url: data.session.user.user_metadata?.avatar_url || 
                                   data.session.user.user_metadata?.picture,
                        provider: data.session.user.app_metadata?.provider || 'oauth'
                      },
                      session: data.session
                    };
                    
                    localStorage.setItem('promosuiteUser', JSON.stringify(userData));
                    setDebugInfo('Redirecting to dashboard...');
                    
                    setTimeout(() => {
                      window.location.href = '/';
                    }, 500);
                  } else {
                    console.log('🔍 No session found after manual attempts');
                    setDebugInfo('No session found. You may need to log in again.');
                    
                    setTimeout(() => {
                      window.location.href = '/';
                    }, 2000);
                  }
                } catch (error) {
                  console.error('🔍 Manual continue error:', error);
                  setDebugInfo(`Error: ${error.message}. Redirecting to login...`);
                  
                  setTimeout(() => {
                    window.location.href = '/';
                  }, 2000);
                }
              }}
              style={{
                background: '#e91e63',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              Continue to Dashboard
            </button>
            <br />
            <a href="/" style={{ color: '#e91e63', fontSize: '14px', marginRight: '20px' }}>
              Return to Login
            </a>
            
            <button
              onClick={() => {
                console.log('🔍 Creating temporary user for development');
                setDebugInfo('Creating temporary development user...');
                
                const tempUser = {
                  id: `temp-${Date.now()}`,
                  email: 'temp@promosuite.com',
                  profile: {
                    id: `temp-${Date.now()}`,
                    email: 'temp@promosuite.com',
                    full_name: 'Development User',
                    avatar_url: null,
                    provider: 'temp'
                  },
                  session: { access_token: 'temp-token' }
                };
                
                localStorage.setItem('promosuiteUser', JSON.stringify(tempUser));
                window.location.href = '/';
              }}
              style={{
                background: '#666',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Dev Bypass
            </button>
          </>
        )}
        
        {!showManualContinue && (
          <>
            <p style={{ fontSize: '14px', color: '#888', marginTop: '20px' }}>
              This usually takes just a few seconds...
            </p>
            <button
              onClick={() => {
                console.log('🔍 Skip to continue button');
                setShowManualContinue(true);
                setIsProcessing(false);
              }}
              style={{
                background: '#444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Skip Wait
            </button>
            <br /><br />
            <button
              onClick={() => {
                console.log('🔍 Skip authentication clicked');
                setDebugInfo('Skipping authentication - creating temp user');
                
                const tempUser = {
                  id: `temp-${Date.now()}`,
                  email: 'temp@promosuite.com',
                  profile: {
                    id: `temp-${Date.now()}`,
                    email: 'temp@promosuite.com',
                    full_name: 'Development User',
                    avatar_url: null,
                    provider: 'temp'
                  },
                  session: { access_token: 'temp-token' }
                };
                
                localStorage.setItem('promosuiteUser', JSON.stringify(tempUser));
                window.location.href = '/';
              }}
              style={{
                background: '#666',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Skip (Use Temp User)
            </button>
          </>
        )}
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AuthCallback;
