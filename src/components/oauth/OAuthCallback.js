import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import oAuthHandlerFactory from '../../services/oauth/OAuthHandlerFactory';
import { useSocialConnections } from '../../hooks/useSocialConnections';

const OAuthCallback = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { savePlatformConnection } = useSocialConnections();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get state and platform from session storage
        const expectedState = sessionStorage.getItem('oauth_state');
        const platform = sessionStorage.getItem('oauth_platform');
        
        if (!expectedState || !platform) {
          throw new Error('Invalid OAuth session');
        }

        // Clear session storage
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_platform');

        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        // Check for errors
        if (error) {
          throw new Error(errorDescription || error);
        }

        // Validate state parameter
        if (state !== expectedState) {
          throw new Error('Invalid OAuth state');
        }

        // Get OAuth handler
        const handler = oAuthHandlerFactory.getHandler(platform);
        if (!handler) {
          throw new Error(`Unsupported platform: ${platform}`);
        }

        // Exchange code for tokens
        const tokens = await handler.exchangeCode(code, state);

        // Save connection
        await savePlatformConnection(platform, {
          platformUserId: tokens.profile.platformUserId,
          username: tokens.profile.username,
          displayName: tokens.profile.displayName,
          avatarUrl: tokens.profile.avatarUrl,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          scopes: tokens.scope,
          platformData: tokens.profile
        });

        // Redirect back to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message);
      }
    };

    handleOAuthCallback();
  }, [navigate, savePlatformConnection]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-lg w-full mx-4">
          <h2 className="text-red-500 text-xl font-semibold mb-4">Connection Error</h2>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-400">Connecting your account...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;