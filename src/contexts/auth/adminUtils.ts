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
 * Check if user has admin privileges
 * Checks environment variable list first, then database
 */
export const checkAdminStatus = async (userId: string, email?: string | null): Promise<boolean> => {
  try {
    const adminEmails = getAdminEmails();
    
    // Check if email is in the admin list
    if (email && adminEmails.includes(email.toLowerCase())) {
      await ensureAdminPrivileges(userId);
      return true;
    }

    // Check database for admin status
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return false;
    }

    return data?.is_admin || false;
  } catch {
    return false;
  }
};

/**
 * Ensure user has admin privileges in the database
 */
export const ensureAdminPrivileges = async (userId: string): Promise<void> => {
  try {
    await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);
  } catch {
    // Silently fail - admin status will be checked on next request
  }
};
