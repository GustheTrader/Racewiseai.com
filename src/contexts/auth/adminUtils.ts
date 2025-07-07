import { supabase } from '@/integrations/supabase/client';

// List of admin emails that should always have admin privileges
export const ADMIN_EMAILS = [
  'nft.king137@gmail.com',
  'jeffgus@gmail.com'
];

export const checkAdminStatus = async (userId: string, email?: string | null): Promise<boolean> => {
  try {
    // First check if email is in the ADMIN_EMAILS list
    if (email && ADMIN_EMAILS.includes(email)) {
      // Update the database to ensure the profile has admin privileges
      await ensureAdminPrivileges(userId);
      return true;
    }

    // Otherwise check the database as before
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin || false;
  } catch (error) {
    console.error('Error in admin check:', error);
    return false;
  }
};

// Helper function to ensure the user has admin privileges in the database
export const ensureAdminPrivileges = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating admin privileges:', error);
    }
  } catch (error) {
    console.error('Error ensuring admin privileges:', error);
  }
};
