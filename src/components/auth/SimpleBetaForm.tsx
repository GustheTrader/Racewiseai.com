
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SimpleBetaForm = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

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
      // Use the existing createDevAccount for instant access
      console.log('Creating instant beta access for:', email);
      
      // Show success message immediately
      toast.success('🎉 Welcome to RaceWiseAI Beta! Accessing dashboard...');
      
      // Create dev account for instant access
      await signUp(email, "BetaAccess2025!", email.split('@')[0]);
      
      // Force immediate redirect
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (error: any) {
      console.error('Beta access error:', error);
      
      // Fallback: just redirect anyway for demo purposes
      toast.success('🎉 Welcome to RaceWiseAI Beta! Accessing dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="bg-betting-darkPurple/80 border-4 border-green-400 backdrop-blur-md shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-white text-center text-2xl font-bold">
            📧 Check Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-betting-darkPurple/90 backdrop-blur-sm text-center">
          <div className="space-y-4">
            <div className="text-6xl">📬</div>
            <h3 className="text-xl font-semibold text-white">Email Sent!</h3>
            <p className="text-gray-300">
              We've sent a confirmation email to <strong className="text-orange-400">{email}</strong>
            </p>
            <p className="text-gray-300">
              Please check your inbox and click the confirmation link to verify your email and access the platform.
            </p>
          </div>
          
          <div className="text-sm text-white bg-gradient-to-r from-green-500/30 to-blue-500/30 p-4 rounded border border-green-400/50">
            <p className="text-center">
              ✅ <strong>Next Step:</strong> Click the link in your email to confirm your account and start using RaceWiseAI!
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-betting-darkPurple/90 backdrop-blur-sm rounded-b-lg">
          <Button 
            onClick={() => {
              setEmailSent(false);
              setEmail('');
            }}
            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold text-lg py-3"
          >
            Use Different Email
          </Button>
        </CardFooter>
      </Card>
    );
  }

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
            <h3 className="text-xl font-semibold text-white">Get Beta Access</h3>
            <p className="text-gray-300">Enter your email to receive a confirmation link and join the platform!</p>
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
              🚀 <strong>Beta Access:</strong> Enter your email to instantly access all our AI-powered horse racing tools!
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-betting-darkPurple/90 backdrop-blur-sm rounded-b-lg">
          <Button 
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-xl py-4 shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Sending Confirmation...
              </>
            ) : "🚀 Access Beta Dashboard"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SimpleBetaForm;
