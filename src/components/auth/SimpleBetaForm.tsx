
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2 } from 'lucide-react';

const SimpleBetaForm = () => {
  const { signUp, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simple email-only login - no confirmation required
      const tempPassword = `BetaUser${Date.now()}@Ai`;
      
      // Try to sign in first
      try {
        await signIn(email, tempPassword);
        toast.success('Welcome to RaceWiseAI!');
      } catch (signInError) {
        // If sign in fails, create account and sign in immediately
        await signUp(email, tempPassword, email.split('@')[0]);
        await signIn(email, tempPassword);
        toast.success('Account created! Welcome to RaceWiseAI!');
      }
      
    } catch (error: any) {
      console.error('Email submission error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
            <p className="text-gray-300">Enter your email to access the platform instantly!</p>
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
              🚀 <strong>Instant Access:</strong> Just enter your email and gain immediate access to all our AI-powered horse racing tools!
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
                Getting Access...
              </>
            ) : "🚀 Get Instant Access"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SimpleBetaForm;
