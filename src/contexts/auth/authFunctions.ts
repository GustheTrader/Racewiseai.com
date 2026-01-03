import { supabase } from '../../integrations/supabase/client';
import { toast } from '../../components/ui/sonner';

/**
 * Sign in with magic link (OTP) - secure email verification
 * Sends a magic link to the user's email for passwordless authentication
 */
export const signInWithMagicLink = async (email: string): Promise<void> => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    toast.error('Please enter a valid email address');
    throw new Error('Invalid email format');
  }

  // Get the redirect URL from the current environment
  // Uses /auth/callback route to properly handle Supabase auth tokens
  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'https://www.racewiseai.com/auth/callback';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
      shouldCreateUser: true,
    }
  });

  if (error) {
    // Generic error message to prevent email enumeration
    toast.error('Unable to process request. Please try again.');
    throw error;
  }

  // Same message for new and existing users to prevent email enumeration
  toast.success('Check your email for a login link');
};

/**
 * Standard email/password sign in
 */
export const signIn = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Generic error message to prevent email enumeration
    toast.error('Invalid credentials. Please try again.');
    throw error;
  }

  toast.success('Signed in successfully');
};

/**
 * Sign up with email and password
 * Requires email verification before access
 */
export const signUp = async (email: string, password: string, fullName: string): Promise<void> => {
  // Get the redirect URL from the current environment
  // Uses /auth/callback route to properly handle Supabase auth tokens
  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'https://www.racewiseai.com/auth/callback';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName || email.split('@')[0],
      },
    },
  });

  if (error) {
    // Generic error message to prevent email enumeration
    toast.error('Unable to create account. Please try again.');
    throw error;
  }

  if (data.user && !data.user.email_confirmed_at) {
    toast.success('Check your email to confirm your account');
  }
};

/**
 * Sign out - clears Supabase session
 */
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    toast.error('Error signing out');
    throw error;
  }

  toast.success('Signed out successfully');
};
