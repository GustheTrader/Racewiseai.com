
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2 } from 'lucide-react';
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
    
    if (!signupFullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    
    setIsLoading(true);
    try {
      await signUp(signupEmail, '', signupFullName);
      setSignupEmail('');
      setSignupFullName('');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    toast.info('Google signup will be available soon! For now, use the email option below.');
  };

  return (
    <Card className="bg-betting-darkPurple/80 border-4 border-orange-400 backdrop-blur-md shadow-2xl transform hover:scale-105 transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-lg">
        <CardTitle className="text-white text-center text-xl font-bold">Join Beta Program</CardTitle>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4 bg-betting-darkPurple/90 backdrop-blur-sm">
          {/* Google Sign Up Button - Primary Option */}
          <Button 
            type="button" 
            onClick={handleGoogleSignup}
            className="w-full bg-white text-gray-800 hover:bg-gray-100 font-bold text-lg py-3 shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-gray-300"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" className="mr-3">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          
          <div className="flex items-center w-full gap-2 my-4">
            <Separator className="flex-1 bg-gray-400" />
            <span className="text-xs text-gray-300 font-semibold">OR CONTINUE WITH EMAIL</span>
            <Separator className="flex-1 bg-gray-400" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-100 font-semibold">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={signupFullName}
              onChange={(e) => setSignupFullName(e.target.value)}
              className="bg-white/20 text-white border-white/40 placeholder:text-gray-300 focus:border-orange-400"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="signupEmail" className="text-gray-100 font-semibold">Email Address *</Label>
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
            <p>🎯 <strong>Platform Access:</strong> Enter your name and email to get instant access to review our RaceWiseAI platform!</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 bg-betting-darkPurple/90 backdrop-blur-sm rounded-b-lg">
          <Button 
            type="submit"
            disabled={isLoading || !signupEmail.trim() || !signupFullName.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold text-lg py-3 shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Getting Access...
              </>
            ) : "Get Platform Access"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignupForm;
