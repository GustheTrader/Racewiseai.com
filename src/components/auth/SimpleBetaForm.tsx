import React, { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';

const SimpleBetaForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { signInWithMagicLink } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signInWithMagicLink(email);
      setEmailSent(true);
    } catch {
      // Error is handled in the auth function
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Check Your Email
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              We've sent a login link to <strong className="text-foreground">{email}</strong>
            </p>
            <p className="text-muted-foreground text-xs">
              Click the link in your email to securely access the dashboard.
              <br />
              The link expires in 1 hour.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className="mt-6 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Use a different email
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 mb-4">
            <Mail className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Secure Login
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter your email to receive a secure login link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`
                w-full px-5 py-4 rounded-2xl text-foreground placeholder:text-muted-foreground
                glass-input text-base
                ${isFocused ? 'ring-2 ring-blue-500/30' : ''}
              `}
              required
              maxLength={254}
              autoComplete="email"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading || !email.trim()}
            className="
              w-full py-4 px-6 rounded-2xl font-medium text-base
              glass-button text-white
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              flex items-center justify-center gap-2
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                Send Login Link
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-center text-xs text-muted-foreground">
            Secure, passwordless authentication.
            <br />
            We'll email you a magic link for instant access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleBetaForm;
