
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2, Apple, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupFullName, setSignupFullName] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail) {
      toast.error('Email is required');
      return;
    }
    
    setIsLoading(true);
    try {
      // For beta, use passwordless signup that provides immediate access
      await signUp(signupEmail, '', signupFullName);
      setSignupEmail('');
      setSignupFullName('');
      
      // Wait a moment for auth state to update, then redirect
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    toast.info(`${provider} signup coming soon`);
  };

  return (
    <Card className="bg-gradient-to-br from-orange-400/20 to-yellow-500/20 border-orange-400/60 backdrop-blur-md shadow-2xl transform hover:scale-105 transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-lg">
        <CardTitle className="text-white text-center text-xl font-bold">Join Beta Program</CardTitle>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4 bg-white/10 backdrop-blur-sm">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-100 font-semibold">Full Name (Optional)</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={signupFullName}
              onChange={(e) => setSignupFullName(e.target.value)}
              className="bg-white/20 text-white border-white/40 placeholder:text-gray-300 focus:border-orange-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signupEmail" className="text-gray-100 font-semibold">Email Address</Label>
            <Input
              id="signupEmail"
              type="email"
              placeholder="your.email@example.com"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="bg-white/20 text-white border-white/40 placeholder:text-gray-300 focus:border-orange-400"
              required
            />
          </div>
          
          <div className="text-sm text-white bg-orange-500/30 p-3 rounded border border-orange-400/50">
            <p>🎯 <strong>Instant Access:</strong> Enter your email and get immediate access to RaceWiseAI ToolBox! No password needed.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 bg-white/5 backdrop-blur-sm rounded-b-lg">
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-lg py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Joining Beta...
              </>
            ) : "Join Beta Program"}
          </Button>
          
          <div className="flex items-center w-full gap-2 my-2">
            <Separator className="flex-1 bg-gray-400" />
            <span className="text-xs text-gray-300 font-semibold">OR SIGN UP WITH</span>
            <Separator className="flex-1 bg-gray-400" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 w-full">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleSocialSignup('Google')}
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
              onClick={() => handleSocialSignup('Apple')}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30 font-semibold"
            >
              <Apple size={16} className="mr-2" />
              Apple
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleSocialSignup('Yahoo')}
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

export default SignupForm;
