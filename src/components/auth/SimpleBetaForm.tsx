import React, { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Loader2, Mail, Lock, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const SimpleBetaForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(true);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email is required');
      return;
    }

    if (!password) {
      toast.error('Password is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (isSignup && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignup) {
        // Signup with email verification
        await signUp(email, password, email.split('@')[0]);
        setConfirmationSent(true);
      } else {
        // Login with email/password
        await signIn(email, password);
        // Navigation happens in auth context
      }
    } catch (error) {
      // Error is handled in the auth function
    } finally {
      setIsLoading(false);
    }
  };

  // Show confirmation sent message
  if (confirmationSent) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Confirm Your Email
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              We've sent a confirmation email to <strong className="text-foreground">{email}</strong>
            </p>
            <p className="text-muted-foreground text-xs mb-6">
              Click the confirmation link in your email to activate your account.
              <br />
              Then you can sign in with your email and password.
            </p>
            <button
              onClick={() => {
                setConfirmationSent(false);
                setEmail('');
                setPassword('');
                setIsSignup(false);
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Already confirmed? Sign in here
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            isSignup 
              ? 'bg-gradient-to-br from-orange-500/20 to-red-600/10' 
              : 'bg-gradient-to-br from-blue-500/20 to-blue-600/10'
          }`}>
            <Lock className={`h-8 w-8 ${isSignup ? 'text-orange-400' : 'text-blue-400'}`} />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {isSignup ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isSignup
              ? 'Enter your email and password to get started'
              : 'Enter your credentials to access the dashboard'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground
                glass-input text-base border border-white/10 focus:border-blue-500/30
                focus:ring-2 focus:ring-blue-500/20 transition-all
              "
              required
              maxLength={254}
              autoComplete={isSignup ? 'email' : 'email'}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground
                glass-input text-base border border-white/10 focus:border-blue-500/30
                focus:ring-2 focus:ring-blue-500/20 transition-all
              "
              required
              minLength={6}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className={`
              w-full py-3 px-6 rounded-xl font-medium text-base mt-6
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              flex items-center justify-center gap-2
              transition-all duration-300
              ${isSignup 
                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]' 
                : 'glass-button text-white hover:bg-blue-600/20'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {isSignup ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              <>
                {isSignup ? 'Create Account' : 'Sign In'}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Between Signup/Signin */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setEmail('');
                setPassword('');
              }}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Info */}
        <div className={`mt-4 p-3 rounded-lg border ${
          isSignup 
            ? 'bg-orange-500/10 border-orange-500/20' 
            : 'bg-blue-500/10 border-blue-500/20'
        }`}>
          <p className={`text-xs text-center ${isSignup ? 'text-orange-300' : 'text-blue-300'}`}>
            {isSignup
              ? '🔥 Confirmation email required to activate account'
              : '✓ Fast and secure authentication'}
          </p>
        </div>

        {/* Admin Portal Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium
              bg-gradient-to-r from-amber-600/20 to-amber-500/10 
              border border-amber-500/30 hover:border-amber-400/50
              text-amber-400 hover:text-amber-300
              flex items-center justify-center gap-2
              transition-all duration-300
              hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Shield className="h-4 w-4" />
            Admin Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleBetaForm;
