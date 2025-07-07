import { supabase } from '../../integrations/supabase/client';

export const checkAdminStatus = async (userId: string, email?: string): Promise<boolean> => {
  try {
    // Check if user is admin based on email domain or specific emails
    const adminEmails = ['dev@racewiseai.com', 'admin@racewiseai.com'];
    const adminDomains = ['racewiseai.com'];
    
    if (email) {
      // Check specific admin emails
      if (adminEmails.includes(email.toLowerCase())) {
        return true;
      }
      
      // Check admin domains
      const emailDomain = email.split('@')[1]?.toLowerCase();
      if (emailDomain && adminDomains.includes(emailDomain)) {
        return true;
      }
    }

    // Check database for admin status
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin === true;
  } catch (error) {
    console.error('Error in checkAdminStatus:', error);
    return false;
  }
};