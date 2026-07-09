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
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First, check if we're on the callback page with tokens
        const hash = window.location.hash;
        const hasTokens = hash.includes('access_token=');

        if (hasTokens) {
          console.log('[AuthContext] Tokens detected in URL, waiting for Supabase to process...');
          // Give Supabase time to process tokens from URL
          // The onAuthStateChange listener will fire when tokens are processed
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Get current session (might now include tokens that were just processed)
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            lastActivityRef.current = Date.now();
            checkAdminStatus(currentSession.user.id, currentSession.user.email)
              .then(adminStatus => {
                if (mounted) {
                  setIsAdmin(adminStatus);
                }
              });
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('[AuthContext] Auth state changed:', event);
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            lastActivityRef.current = Date.now();

            checkAdminStatus(currentSession.user.id, currentSession.user.email)
              .then(adminStatus => {
                if (mounted) {
                  setIsAdmin(adminStatus);
                }
              });
          } else {
            setIsAdmin(false);
          }
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    return () => {
      mounted = false;
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
