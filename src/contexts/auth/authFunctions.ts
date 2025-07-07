import { supabase } from '../../integrations/supabase/client';
import { toast } from '../../components/ui/sonner';
import { ensureAdminPrivileges, checkAdminStatus } from './adminUtils';

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
    const devEmail = "nft.king137@gmail.com";
    const devPassword = "S3cure@Dev#2025!"; // Updated to use a stronger password that meets security criteria
    const devName = "Test Developer";

    toast.info('Creating developer account...');
    
    // First try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword
    });

    // If sign-in is successful
    if (signInData?.user) {
      console.log('Developer account login successful', signInData.user);
      toast.success('Developer account login successful');
      
      // Ensure admin privileges
      await ensureAdminPrivileges(signInData.user.id);
      
      // Force update the admin status
      setIsAdmin(true);
      return;
    }
    
    // If sign-in failed, create a new account
    if (signInError) {
      console.log('Sign in failed, creating new developer account...', signInError);
      toast.info('Creating developer account...');
      
      // Create new user with auto-confirm
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
        options: {
          data: {
            full_name: devName,
          },
        },
      });
      
      if (signUpError) {
        console.error('Error creating developer account:', signUpError);
        toast.error(`Failed to create developer account: ${signUpError.message}`);
        throw signUpError;
      }
      
      if (!signUpData.user) {
        console.error('Failed to create developer account - no user returned');
        toast.error('Failed to create developer account');
        return;
      }
      
      console.log('Developer account created, attempting login...', signUpData.user);
      
      // Try to sign in with the new account immediately
      const { data: newLoginData, error: newLoginError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword
      });
      
      if (newLoginError) {
        console.error('Error logging in to new developer account:', newLoginError);
        toast.error(`Login error: ${newLoginError.message}`);
        throw newLoginError;
      }
      
      if (newLoginData.user) {
        console.log('Successfully logged in with new developer account', newLoginData.user);
        
        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newLoginData.user.id)
          .maybeSingle();
          
        if (!profileData || profileError) {
          // Create profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: newLoginData.user.id,
              email: devEmail,
              full_name: devName,
              is_admin: true
            });
              
          if (insertError) {
            console.error('Failed to create profile:', insertError);
            toast.error(`Failed to create profile: ${insertError.message}`);
          }
        } else {
          // Update existing profile with admin privileges
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', newLoginData.user.id);
              
          if (updateError) {
            console.error('Failed to update profile:', updateError);
            toast.error(`Failed to update profile: ${updateError.message}`);
          }
        }
        
        // Double-check admin status
        await checkAdminStatus(newLoginData.user.id, devEmail);
        
        // Force update the admin status
        setIsAdmin(true);
        toast.success('Developer account created and logged in with admin privileges');
      }
    }
  } catch (error: any) {
    console.error('Developer login error:', error);
    toast.error(`Developer login failed: ${error?.message || 'Unknown error'}`);
  }
};
