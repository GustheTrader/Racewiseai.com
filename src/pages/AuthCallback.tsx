import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';

/**
 * Auth Callback Handler
 * Handles the redirect from magic link emails and sign-up verification emails
 *
 * Flow:
 * 1. Magic link clicked in email → URL has #access_token=...&refresh_token=...
 * 2. Supabase JS SDK automatically processes these tokens via onAuthStateChange
 * 3. AuthContext detects new session and updates user state
 * 4. This component detects user is authenticated and redirects to /
 */
const AuthCallback = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [hasTokens, setHasTokens] = useState(false);

  // Phase 1: Check for tokens or errors in URL
  useEffect(() => {
    const hash = window.location.hash;
    const hasAccessToken = hash.includes('access_token=');
    const hasErrorParam = hash.includes('error=');

    console.log('[AuthCallback] Checking URL hash...', {
      url: window.location.href,
      hasAccessToken,
      hasErrorParam,
    });

    // Handle error in URL
    if (hasErrorParam) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDescription = params.get('error_description');
      const errorCode = params.get('error');
      console.error('[AuthCallback] Error in URL:', errorCode, errorDescription);
      setError(errorDescription || errorCode || 'Authentication failed');
      return;
    }

    // Mark that we found tokens
    if (hasAccessToken) {
      console.log('[AuthCallback] Found access token in URL');
      setHasTokens(true);
    }
  }, []);

  // Phase 2: Wait for user to authenticate and redirect
  useEffect(() => {
    if (!hasTokens) return;
    if (isLoading) return; // Still loading auth state

    console.log('[AuthCallback] Auth state:', { user: user?.email, isLoading });

    if (user) {
      // Success! User is authenticated
      console.log('[AuthCallback] User authenticated as:', user.email);

      // Clear the hash from URL to clean up
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/');
      }, 100);
    } else {
      // Timeout - Supabase failed to authenticate
      console.error('[AuthCallback] Authentication failed - no user after processing tokens');
      setError('Failed to authenticate. Please try the magic link again.');
    }
  }, [hasTokens, user, isLoading, navigate]);

  // Phase 3: Add safety timeout
  useEffect(() => {
    if (!hasTokens) return;

    const timeoutId = setTimeout(() => {
      if (!user) {
        console.error('[AuthCallback] Timeout: No user after 10 seconds');
        setError('Authentication is taking too long. Please try again.');
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [hasTokens, user]);

  // Show error if one occurred
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-lg mb-4 font-semibold">Authentication Error</div>
          <p className="text-gray-300 mb-6">{error}</p>
          <p className="text-gray-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while processing
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-betting-skyBlue mx-auto mb-4"></div>
        <p className="text-white font-semibold">Signing you in...</p>
        <p className="text-gray-300 text-sm mt-2">
          {hasTokens ? 'Processing your magic link...' : 'Checking authentication...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
