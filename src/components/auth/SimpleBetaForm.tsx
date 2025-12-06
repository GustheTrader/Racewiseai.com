import React, { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Loader2, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SimpleBetaForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userName = email.split('@')[0];
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: userName,
            app_name: 'RaceWiseAI',
            company: 'RaceWiseAI.com'
          },
        },
      });
      
      if (error) {
        console.error('Magic link error:', error);
        toast.error('Failed to send magic link. Please try again.');
        return;
      }

      toast.success('Check your email for the magic link!');
      
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast.error('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 mb-4">
            <Mail className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Get Started
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter your email for instant access
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
                Continue with Email
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-center text-xs text-muted-foreground">
            We'll send you a secure magic link.
            <br />
            No password required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleBetaForm;
