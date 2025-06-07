
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '@/components/auth/AuthHeader';
import SignupForm from '@/components/auth/SignupForm';

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple p-6 text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <AuthHeader />
        <SignupForm />
      </div>
    </div>
  );
};

export default AuthPage;
