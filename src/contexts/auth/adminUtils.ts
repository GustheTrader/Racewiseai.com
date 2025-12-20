import { supabase } from '../../integrations/supabase/client';

/**
 * Get admin emails from environment variables
 * Format in .env: VITE_ADMIN_EMAILS="email1@example.com,email2@example.com"
 */
const getAdminEmails = (): string[] => {
  const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || '';
  if (!adminEmailsEnv) {
    return [];
  }
  return adminEmailsEnv
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter((email: string) => email);
};

/**
 * Check if user has admin privileges using the secure user_roles table
 * Uses the database's has_role function for server-side validation
 */
export const checkAdminStatus = async (userId: string, email?: string | null): Promise<boolean> => {
  try {
    // First check if email is in the admin list (for initial admin setup)
    const adminEmails = getAdminEmails();
    if (email && adminEmails.includes(email.toLowerCase())) {
      await ensureAdminRole(userId);
      return true;
    }

    // Check the user_roles table for admin role
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      return false;
    }

    return !!data;
  } catch {
    return false;
  }
};

/**
 * Ensure user has admin role in the user_roles table
 */
export const ensureAdminRole = async (userId: string): Promise<void> => {
  try {
    // Use upsert to add admin role without duplicates
    await supabase
      .from('user_roles')
      .upsert(
        { user_id: userId, role: 'admin' },
        { onConflict: 'user_id,role' }
      );
  } catch {
    // Silently fail - admin status will be checked on next request
  }
};

/**
 * Remove admin role from a user
 */
export const removeAdminRole = async (userId: string): Promise<void> => {
  try {
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', 'admin');
  } catch {
    // Silently fail
  }
};
