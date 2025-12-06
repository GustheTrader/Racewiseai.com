
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from './types';
import { signIn as authSignIn, signInWithEmail as authSignInWithEmail, signUp as authSignUp, signOut as authSignOut, createDevAccount as authCreateDevAccount } from './authFunctions';
import { checkAdminStatus } from './adminUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Note: Using minimal User structure for email-only authentication

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
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
        checkAdminStatus(currentSession.user.id, currentSession.user.email)
          .then(adminStatus => setIsAdmin(adminStatus));
      } else {
        // For email-only auth, check localStorage for user state if no Supabase session
        const storedUser = localStorage.getItem('racewise_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            checkAdminStatus(parsedUser.id, parsedUser.email)
              .then(adminStatus => setIsAdmin(adminStatus));
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('racewise_user');
          }
        }
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
   * Email-only sign in - no password required
   * Creates or retrieves user profile and sets them as logged in
   */
  const signInWithEmailOnly = async (email: string) => {
    try {
      const { userId, email: userEmail } = await authSignInWithEmail(email);
      
      // Create a mock user object for the session
      const mockUser: User = {
        id: userId,
        email: userEmail,
        app_metadata: {},
        user_metadata: { email: userEmail },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
      
      // Store user in localStorage for persistence
      localStorage.setItem('racewise_user', JSON.stringify(mockUser));
      
      // Set the user in state to mark them as authenticated
      setUser(mockUser);
      
      // Check admin status
      const adminStatus = await checkAdminStatus(userId, userEmail);
      setIsAdmin(adminStatus);
      
      // Navigate to dashboard
      navigate('/');
    } catch (error) {
      console.error('Email-only sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    await authSignUp(email, password, fullName);
  };

  const signOut = async () => {
    await authSignOut();
    localStorage.removeItem('racewise_user');
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
