import { supabase } from '../../integrations/supabase/client';
import { toast } from '../../components/ui/sonner';
import { ensureAdminPrivileges, checkAdminStatus } from './adminUtils';

/**
 * Generate a UUID v4 with fallback for environments without crypto.randomUUID
 * crypto.randomUUID() requires HTTPS or localhost
 */
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      console.warn('crypto.randomUUID failed, using fallback');
    }
  }
  
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Email-only sign in - creates or retrieves user profile based on email
 * No password, OTP, or social login required
 * Attempts to use Supabase for profile storage, falls back to localStorage
 */
export const signInWithEmail = async (email: string): Promise<{ userId: string; email: string }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      throw new Error('Invalid email format');
    }

    let userId: string;
    let isNewUser = false;
    
    try {
      // Try to check if user profile exists in profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_admin')
        .eq('email', email)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (existingProfile) {
        // User exists in Supabase
        userId = existingProfile.id;
      } else {
        // New user - create a profile in Supabase
        const newUserId = generateUUID();
        const userName = email.split('@')[0];
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: newUserId,
            email: email,
            full_name: userName,
            is_admin: false,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        userId = newProfile.id;
        isNewUser = true;
      }
    } catch (supabaseError) {
      // Supabase connection failed - fall back to localStorage
      console.warn('Supabase connection unavailable, using localStorage:', supabaseError);
      
      // Check localStorage for existing users
      const localUsers = JSON.parse(localStorage.getItem('racewise_local_users') || '{}');
      
      if (localUsers[email]) {
        userId = localUsers[email];
      } else {
        // Create new local user
        userId = generateUUID();
        localUsers[email] = userId;
        localStorage.setItem('racewise_local_users', JSON.stringify(localUsers));
        isNewUser = true;
      }
    }

    // Show appropriate success message
    if (isNewUser) {
      toast.success('Account created! Welcome to RaceWise AI!');
    } else {
      toast.success('Welcome back!');
    }

    return { userId, email };
  } catch (error) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<void> => {
  try {
    // Try to sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // If password login fails, send magic link
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            app_name: 'RaceWiseAI',
            company: 'RaceWiseAI.com'
          }
        }
      });
      
      if (magicLinkError) {
        toast.error(magicLinkError.message);
        throw magicLinkError;
      } else {
        toast.success('Magic link sent! Check your email from RaceWiseAI.com to login instantly.');
      }
    } else {
      toast.success('Signed in successfully');
    }
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string, fullName: string): Promise<void> => {
  try {
    // Create account with email confirmation required
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName || email.split('@')[0],
          app_name: 'RaceWiseAI',
          company: 'RaceWiseAI.com'
        },
      },
    });
    
    if (error) {
      console.error('Signup error:', error);
      toast.error(error.message);
      throw error;
    }
    
    if (data.user && !data.user.email_confirmed_at) {
      // User created but needs email confirmation
      toast.success('Account created! Please check your email for the confirmation link.');
    } else if (data.user && data.user.email_confirmed_at) {
      // User created and already confirmed (shouldn't happen normally)
      toast.success('Welcome to RaceWiseAI beta!');
    }
    
  } catch (error) {
    console.error('Sign up error:', error);
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
    console.error('Sign out error:', error);
    throw error;
  }
};

export const createDevAccount = async (setIsAdmin: (isAdmin: boolean) => void): Promise<void> => {
  try {
    // Get dev credentials from environment variables ONLY
    const devEmail = import.meta.env.VITE_DEV_EMAIL;
    const devPassword = import.meta.env.VITE_DEV_PASSWORD;
    const devName = import.meta.env.VITE_DEV_NAME || "Developer";

    if (!devEmail || !devPassword) {
      console.error('Dev credentials not configured in environment variables');
      toast.error('Developer credentials not configured. Contact administrator.');
      throw new Error('VITE_DEV_EMAIL and VITE_DEV_PASSWORD must be set in environment');
    }

    toast.info('Attempting developer account login...');

    // Try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword
    });

    // If sign-in is successful
    if (signInData?.user) {
      console.log('Developer account login successful');
      toast.success('Developer account login successful');

      // Ensure admin privileges
      await ensureAdminPrivileges(signInData.user.id);

      // Force update the admin status
      setIsAdmin(true);
      return;
    }

    // If sign-in failed, show error
    if (signInError) {
      console.error('Developer account login failed');
      toast.error(`Login failed: ${signInError.message}`);
      throw signInError;
    }
  } catch (error: any) {
    console.error('Developer login error');
    toast.error(`Developer login failed: ${error?.message || 'Unknown error'}`);
    throw error;
  }
};
