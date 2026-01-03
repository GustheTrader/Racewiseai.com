import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';

/**
 * Auth Callback Handler
 * Handles the redirect from magic link emails and sign-up verification emails
 * Supabase appends auth tokens to the URL hash which are automatically processed
 * by the auth provider's onAuthStateChange listener
 */
const AuthCallback = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // If user is authenticated, redirect to home/dashboard
    if (user && !isLoading) {
      navigate('/');
      return;
    }

    // Check if there's an error in the URL
    const hash = window.location.hash;
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1)); // Remove # and parse
      const errorDescription = params.get('error_description');
      setError(errorDescription || 'Authentication failed. Please try again.');

      // Redirect to auth page after showing error
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-betting-skyBlue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // In normal flow, user should be authenticated and already redirected
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-betting-skyBlue mx-auto mb-4"></div>
        <p className="text-gray-400">Verifying your email and signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
