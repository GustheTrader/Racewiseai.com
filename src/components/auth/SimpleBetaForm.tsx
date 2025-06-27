
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SimpleBetaForm = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleBetaAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    setIsLoading(true);
    try {
      // Create a stronger password that meets Supabase requirements
      const strongPassword = `BetaUser${Date.now()}@Ai`;
      
      // Simple beta signup with email and strong password
      await signUp(email, strongPassword, email.split('@')[0]);
      
      // Show confetti effect
      showConfetti();
      
      // Show success message
      toast.success('🎉 Welcome to RaceWiseAI Beta! Redirecting to dashboard...');
      
      // Redirect to main dashboard after short delay
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error('Beta access error:', error);
      
      // If user already exists, try to sign them in instead
      if (error?.message?.includes('already registered') || error?.message?.includes('already exists')) {
        toast.success('🎉 Welcome back! Redirecting to dashboard...');
        showConfetti();
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showConfetti = () => {
    // Create confetti effect
    const colors = ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#B19CD9'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
    }
  };

  const createConfettiPiece = (color: string) => {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = color;
    confetti.style.zIndex = '9999';
    confetti.style.pointerEvents = 'none';
    confetti.style.borderRadius = '50%';
    
    document.body.appendChild(confetti);
    
    const fall = confetti.animate([
      { transform: 'translateY(-10px) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${window.innerHeight + 10}px) rotate(360deg)`, opacity: 0 }
    ], {
      duration: 3000 + Math.random() * 2000,
      easing: 'cubic-bezier(0.5, 0, 0.5, 1)'
    });
    
    fall.onfinish = () => confetti.remove();
  };

  return (
    <Card className="bg-betting-darkPurple/80 border-4 border-orange-400 backdrop-blur-md shadow-2xl transform hover:scale-105 transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-lg">
        <CardTitle className="text-white text-center text-2xl font-bold">
          🚀 Join RaceWiseAI Beta
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleBetaAccess}>
        <CardContent className="space-y-6 bg-betting-darkPurple/90 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-white">Get Instant Access</h3>
            <p className="text-gray-300">Enter your email and jump straight into the platform!</p>
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
              🎯 <strong>Instant Access:</strong> No passwords, no waiting - just enter your email and start using all our AI-powered horse racing tools immediately!
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
