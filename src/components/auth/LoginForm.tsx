
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
    <Card className="bg-betting-darkPurple/70 border-betting-secondaryPurple/50 backdrop-blur-md">
      <CardHeader className="bg-betting-darkPurple">
        <CardTitle className="text-white">Login to Beta</CardTitle>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginEmail" className="text-gray-200">Email</Label>
            <Input
              id="loginEmail"
              type="email"
              placeholder="your.email@example.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={isLoading}
              className="bg-white/10 text-white border-white/20 placeholder:text-gray-400"
              required
            />
          </div>
          
          <div className="text-sm text-gray-300 bg-betting-vividPurple/20 p-3 rounded">
            <p>🔗 <strong>Magic Link Login:</strong> Enter your email to receive a secure login link from RaceWiseAI.com!</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-purple-900 hover:from-purple-900 hover:to-orange-500 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Sending Magic Link...
              </>
            ) : "Send Magic Link"}
          </Button>
          
          <div className="flex items-center w-full gap-2 my-2">
            <Separator className="flex-1 bg-gray-600" />
            <span className="text-xs text-gray-400">OR CONTINUE WITH</span>
            <Separator className="flex-1 bg-gray-600" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleSocialLogin('Google')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Apple size={16} className="mr-2" />
              Apple
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleSocialLogin('Yahoo')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
