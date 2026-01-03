
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2 } from 'lucide-react';

const LoginAfterConfirmation = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    setIsLoading(true);
    try {
      // Use a temporary password or magic link for confirmed users
      await signIn(email, 'temp-password');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-betting-darkPurple/80 border-4 border-blue-400 backdrop-blur-md shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="text-white text-center text-2xl font-bold">
          🔐 Login to RaceWiseAI
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-6 bg-betting-darkPurple/90 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-white">Welcome Back!</h3>
            <p className="text-gray-300">Enter your email to access the platform</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-100 font-semibold text-lg">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/20 text-white border-white/40 placeholder:text-gray-300 focus:border-blue-400 text-lg py-3"
              required
            />
          </div>
          
          <div className="text-sm text-white bg-gradient-to-r from-blue-500/30 to-purple-500/30 p-4 rounded border border-blue-400/50">
            <p className="text-center">
              🔗 <strong>Magic Link:</strong> We'll send you a secure login link to access your account instantly!
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-betting-darkPurple/90 backdrop-blur-sm rounded-b-lg">
          <Button 
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-xl py-4 shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Sending Login Link...
              </>
            ) : "🔐 Send Login Link"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginAfterConfirmation;
