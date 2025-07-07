import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(error.message);
      }
      throw error;
    }

    toast.success('Successfully logged in!');
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Successfully logged out!');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const createDevAccount = async (setIsAdmin: (isAdmin: boolean) => void) => {
  try {
    const devEmail = 'dev@racewiseai.com';
    const devPassword = 'devpassword123';
    
    const { data, error } = await supabase.auth.signUp({
      email: devEmail,
      password: devPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: 'Developer Account',
        }
      }
    });

    if (error && !error.message.includes('already registered')) {
      toast.error(error.message);
      throw error;
    }

    // Try to sign in if account already exists
    if (error?.message.includes('already registered')) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
      });

      if (signInError) {
        toast.error(signInError.message);
        throw signInError;
      }

      setIsAdmin(true);
      toast.success('Developer account logged in!');
      return signInData;
    }

    setIsAdmin(true);
    toast.success('Developer account created and logged in!');
    return data;
  } catch (error) {
    console.error('Create dev account error:', error);
    throw error;
  }
};