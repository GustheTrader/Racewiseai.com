import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from './types';
import { 
  signIn as authSignIn, 
  signInWithMagicLink as authSignInWithMagicLink, 
  signUp as authSignUp, 
  signOut as authSignOut 
} from './authFunctions';
import { checkAdminStatus } from './adminUtils';
import { toast } from '@/components/ui/sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Handle session timeout due to inactivity
  const handleSessionTimeout = useCallback(async () => {
    if (session) {
      toast.info('Session expired due to inactivity');
      await authSignOut();
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      navigate('/auth');
    }
  }, [session, navigate]);

  // Check for inactivity and handle timeout
  useEffect(() => {
    if (!session) return;

    const checkInactivity = () => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      if (timeSinceActivity >= SESSION_TIMEOUT_MS) {
        handleSessionTimeout();
      }
    };

    // Set up activity listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for inactivity periodically
    const intervalId = setInterval(checkInactivity, ACTIVITY_CHECK_INTERVAL_MS);
    timeoutIdRef.current = intervalId;

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      if (timeoutIdRef.current) {
        clearInterval(timeoutIdRef.current);
      }
    };
  }, [session, updateActivity, handleSessionTimeout]);

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Reset activity on new session
          lastActivityRef.current = Date.now();
          
          // Defer admin check to prevent deadlock
          setTimeout(() => {
            checkAdminStatus(currentSession.user.id, currentSession.user.email)
              .then(adminStatus => setIsAdmin(adminStatus));
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        lastActivityRef.current = Date.now();
        checkAdminStatus(currentSession.user.id, currentSession.user.email)
          .then(adminStatus => setIsAdmin(adminStatus));
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await authSignIn(email, password);
    navigate('/');
  };

  const signInWithMagicLink = async (email: string) => {
    await authSignInWithMagicLink(email);
    // Navigation happens after user clicks the magic link
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    await authSignUp(email, password, fullName);
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isAdmin,
        signIn,
        signInWithMagicLink,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
