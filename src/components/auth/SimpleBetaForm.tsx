
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SimpleBetaForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Sending magic link for:', email);
      
      const userName = email.split('@')[0];
      
      // Show initial success message
      toast.success('🚀 Magic link sent! Check your email to access the dashboard.');
      
      // Send magic link for both signup and signin
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
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

      // Show success message with instructions
      toast.success('📧 Check your email! Click the magic link to instantly access your dashboard.');
      
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast.error('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsOAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast.error('Failed to sign in with Google. Please try again.');
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google. Please try again.');
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsOAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Apple sign-in error:', error);
        toast.error('Failed to sign in with Apple. Please try again.');
      }
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      toast.error('Failed to sign in with Apple. Please try again.');
    } finally {
      setIsOAuthLoading(false);
    }
  };

  return (
    <Card className="bg-betting-darkPurple/80 border-4 border-orange-400 backdrop-blur-md shadow-2xl transform hover:scale-105 transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-lg">
        <CardTitle className="text-white text-center text-2xl font-bold">
          🚀 Join RaceWiseAI Beta
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleEmailSubmit}>
        <CardContent className="space-y-6 bg-betting-darkPurple/90 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-white">Get Instant Access</h3>
            <p className="text-gray-300">Enter your email to instantly access all our AI-powered tools!</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-100 font-semibold text-lg">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/20 text-white border-white/40 placeholder:text-gray-300 focus:border-orange-400 text-lg py-3"
              required
            />
          </div>
          
          <div className="text-sm text-white bg-gradient-to-r from-orange-500/30 to-yellow-500/30 p-4 rounded border border-orange-400/50">
            <p className="text-center">
              📧 <strong>Magic Link Access:</strong> We'll send you a secure link to access the dashboard instantly!
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-betting-darkPurple/90 backdrop-blur-sm rounded-b-lg flex-col space-y-4 pb-6">
          <Button 
            type="submit"
            disabled={isLoading || !email.trim() || isOAuthLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-xl py-4 shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Sending Magic Link...
              </>
            ) : "📧 Send Magic Link"}
          </Button>

          <div className="relative w-full">
            <Separator className="bg-white/20" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-betting-darkPurple/90 px-3 text-gray-300 text-sm">
              OR
            </span>
          </div>

          <div className="w-full space-y-3">
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isOAuthLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isOAuthLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              type="button"
              onClick={handleAppleSignIn}
              disabled={isLoading || isOAuthLoading}
              className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isOAuthLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              Continue with Apple
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SimpleBetaForm;
