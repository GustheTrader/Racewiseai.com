import { supabase } from '../../integrations/supabase/client';
import { toast } from '../../components/ui/sonner';
import { ensureAdminPrivileges, checkAdminStatus } from './adminUtils';

/**
 * Email-only sign in using Supabase OTP (One-Time Password)
 * Sends a magic link to verify email ownership before granting access
 */
export const signInWithEmail = async (email: string): Promise<{ userId: string; email: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      throw new Error('Invalid email format');
    }

    // Send OTP (magic link) to the email
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (otpError) {
      toast.error('Failed to send magic link. Please try again.');
      throw otpError;
    }

    // Return success message - don't reveal if email is new or existing (prevents enumeration)
    toast.success('Magic link sent! Check your email to sign in.');

    return { userId: '', email };
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<void> => {
  try {
    // Try to sign in with password
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error('Invalid email or password. Please try again.');
      throw error;
    }

    toast.success('Signed in successfully');
  } catch (error) {
    throw error;
  }
};

export const signUp = async (email: string, password: string, fullName: string): Promise<void> => {
  try {
    // Create account with email confirmation required
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Account created! Please check your email to confirm your account.');
  } catch (error) {
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Signed out successfully');
  } catch (error) {
    throw error;
  }
};

/**
 * Create a dev account for testing - credentials should be managed securely
 * This is a placeholder that should only be used in development environments
 * In production, admin accounts should be created through a secure admin panel
 */
export const createDevAccount = async (setIsAdmin: (isAdmin: boolean) => void): Promise<void> => {
  toast.error('Development account creation is disabled. Please contact an administrator.');
  throw new Error('Development account creation is not available in this environment.');
};
