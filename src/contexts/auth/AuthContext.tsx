
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from './types';
import { signIn as authSignIn, signInWithEmail as authSignInWithEmail, signUp as authSignUp, signOut as authSignOut, createDevAccount as authCreateDevAccount } from './authFunctions';
import { checkAdminStatus } from './adminUtils';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Note: Using minimal User structure for email-only authentication

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (session?.user) {
      inactivityTimerRef.current = setTimeout(() => {
        authSignOut();
        navigate('/auth');
      }, SESSION_TIMEOUT);
    }
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [session]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          checkAdminStatus(currentSession.user.id, currentSession.user.email)
            .then(adminStatus => setIsAdmin(adminStatus));
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
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

  /**
   * Email-only sign in - sends magic link for secure email verification
   * User must verify their email before accessing the dashboard
   */
  const signInWithEmailOnly = async (email: string) => {
    try {
      await authSignInWithEmail(email);
      // User will be redirected after clicking the magic link in their email
    } catch (error) {
      throw error;
    }
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

  const createDevAccount = async () => {
    await authCreateDevAccount(setIsAdmin);
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        isAdmin,
        signIn,
        signInWithEmailOnly,
        signUp,
        signOut,
        createDevAccount,
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
