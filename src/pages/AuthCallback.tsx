import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';

/**
 * Auth Callback Handler
 * Handles email confirmation links from Supabase
 *
 * Flow:
 * 1. User signs up → gets confirmation email
 * 2. User clicks confirmation link in email
 * 3. Link redirects to /auth/callback#token_hash=xxx&type=email_confirmation
 * 4. Supabase JS SDK automatically processes and confirms the email
 * 5. This component detects it and shows confirmation message
 * 6. User is redirected back to sign in to access dashboard
 */
const AuthCallback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    const hasErrorParam = hash.includes('error=');

    console.log('[AuthCallback] Processing email confirmation...', {
      url: window.location.href,
      hasError: hasErrorParam,
    });

    if (hasErrorParam) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDescription = params.get('error_description');
      const errorCode = params.get('error');
      console.error('[AuthCallback] Error:', errorCode, errorDescription);
      setError(errorDescription || errorCode || 'Email confirmation failed');
      setIsProcessing(false);
      return;
    }

    // Email was confirmed successfully
    // Clear the URL hash
    window.history.replaceState({}, document.title, window.location.pathname);

    console.log('[AuthCallback] Email confirmed! Please sign in with your password.');
    setIsProcessing(false);

    // Redirect to sign in page after 2 seconds
    setTimeout(() => {
      navigate('/auth');
    }, 2000);
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-lg mb-4 font-semibold">Confirmation Error</div>
          <p className="text-gray-300 mb-6">{error}</p>
          <p className="text-gray-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-betting-skyBlue mx-auto mb-4"></div>
          <p className="text-white font-semibold">Confirming your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-green-400 text-lg mb-4 font-semibold">✓ Email Confirmed!</div>
        <p className="text-gray-300 mb-2">Your email has been successfully confirmed.</p>
        <p className="text-gray-400 text-sm mb-6">Redirecting to sign in page...</p>
        <button
          onClick={() => navigate('/auth')}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Return to sign in
        </button>
      </div>
    </div>
  );
};

export default AuthCallback;
