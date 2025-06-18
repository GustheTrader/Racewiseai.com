
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2, Apple, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const LoginForm = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail) {
      toast.error('Email is required');
      return;
    }
    
    setIsLoading(true);
    try {
      // For beta, use email-only authentication with magic link
      await signIn(loginEmail, 'beta-temp-password');
      setLoginEmail('');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login coming soon`);
  };

  return (
    <Card className="bg-betting-darkPurple/80 border-4 border-yellow-400 backdrop-blur-md shadow-2xl transform hover:scale-105 transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
        <CardTitle className="text-white text-center text-xl font-bold">Login to Beta</CardTitle>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4 bg-betting-darkPurple/90 backdrop-blur-sm">
          <div className="space-y-2">
            <Label htmlFor="loginEmail" className="text-gray-100 font-semibold">Email Address</Label>
            <Input
              id="loginEmail"
              type="email"
              placeholder="your.email@example.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={isLoading}
              className="bg-white/20 text-white border-white/40 placeholder:text-gray-300 focus:border-yellow-400"
              required
            />
          </div>
          
          <div className="text-sm text-white bg-yellow-500/30 p-3 rounded border border-yellow-400/50">
            <p>🔗 <strong>Magic Link Login:</strong> Enter your email to receive a secure login link from RaceWiseAI.com!</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 bg-betting-darkPurple/90 backdrop-blur-sm rounded-b-lg">
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Sending Magic Link...
              </>
            ) : "Send Magic Link"}
          </Button>
          
          <div className="flex items-center w-full gap-2 my-2">
            <Separator className="flex-1 bg-gray-400" />
            <span className="text-xs text-gray-300 font-semibold">OR CONTINUE WITH</span>
            <Separator className="flex-1 bg-gray-400" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleSocialLogin('Google')}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30 font-semibold"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Google
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleSocialLogin('Apple')}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30 font-semibold"
            >
              <Apple size={16} className="mr-2" />
              Apple
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleSocialLogin('Yahoo')}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30 font-semibold"
            >
              <Mail size={16} className="mr-2" />
              Yahoo
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
