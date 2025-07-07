
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthHeader from '@/components/auth/AuthHeader';
import SimpleBetaForm from '@/components/auth/SimpleBetaForm';
import LoginAfterConfirmation from '@/components/auth/LoginAfterConfirmation';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  Brain, 
  Calculator, 
  DollarSign, 
  BarChart3, 
  Bot,
  Eye,
  Target
} from 'lucide-react';

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(false);

  // Check if user came from email confirmation
  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    if (confirmed === 'true') {
      setShowLogin(true);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const tools = [
    {
      id: 1,
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Live Odds Tracking",
      description: "Real-time monitoring of horse racing odds with automatic updates and alerts."
    },
    {
      id: 2,
      icon: <Brain className="h-6 w-6" />,
      title: "Q-Model Analytics",
      description: "Quantum-powered predictive model with AI-driven probability assessments."
    },
    {
      id: 3,
      icon: <Calculator className="h-6 w-6" />,
      title: "Personal Model Builder",
      description: "Customizable handicapping model with adjustable weighting factors."
    },
    {
      id: 4,
      icon: <DollarSign className="h-6 w-6" />,
      title: "Sharp Money Movement",
      description: "Track professional betting patterns and irregular betting activity."
    },
    {
      id: 5,
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Pool Analysis",
      description: "Monitor betting pools with percentage breakdowns and payout projections."
    },
    {
      id: 6,
      icon: <Bot className="h-6 w-6" />,
      title: "AI Race Agent",
      description: "Real-time race analysis with up-to-the-minute strategic insights."
    },
    {
      id: 7,
      icon: <Eye className="h-6 w-6" />,
      title: "Live Paddock Comments with OpenCV Analysis",
      description: "AI-powered visual analysis of horse behavior and condition with real-time expert commentary."
    },
    {
      id: 8,
      icon: <Target className="h-6 w-6" />,
      title: "Rolling Pick 3, Trifecta & Superfecta Bets",
      description: "Advanced exotic betting strategies with automated ticket construction and optimization."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple p-6 text-white relative overflow-hidden">
      {/* Horse Racing Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('/lovable-uploads/af4522a6-318c-483c-b620-eefeeb7d2160.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400/20 rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-purple-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-400/20 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-10 right-10 w-18 h-18 bg-orange-300/20 rounded-full animate-pulse delay-500"></div>
        
        {/* Moving gradient orbs */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-gradient-to-r from-orange-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-xl animate-bounce"></div>
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white/20 rounded-full animate-pulse`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <AuthHeader />
          
          <div className="mt-6 max-w-4xl mx-auto">
            <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-900 via-betting-tertiaryPurple via-yellow-400 to-orange-500 bg-clip-text drop-shadow-lg">
              {showLogin ? 'Welcome Back to RaceWiseAI!' : 'Get instant access to advanced AI-powered horse racing tools'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tools 1-4 */}
          <div className="space-y-4">
            {tools.slice(0, 4).map((tool) => (
              <Card key={tool.id} className="bg-betting-darkPurple/70 border-betting-secondaryPurple/50 backdrop-blur-md hover:bg-betting-darkPurple/80 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-orange-400 shrink-0 mt-1">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{tool.title}</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">{tool.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Center Column - Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {showLogin ? <LoginAfterConfirmation /> : <SimpleBetaForm />}
              
              {/* Toggle between forms */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowLogin(!showLogin)}
                  className="text-sm text-gray-300 hover:text-white underline"
                >
                  {showLogin ? 'Need to sign up?' : 'Already have an account?'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Tools 5-8 */}
          <div className="space-y-4">
            {tools.slice(4, 8).map((tool) => (
              <Card key={tool.id} className="bg-betting-darkPurple/70 border-betting-secondaryPurple/50 backdrop-blur-md hover:bg-betting-darkPurple/80 transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-orange-400 shrink-0 mt-1">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{tool.title}</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">{tool.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Features Banner */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-orange-500/20 to-purple-900/20 border-orange-500/30 backdrop-blur-md">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {showLogin ? '🔐 Secure Login' : '🚀 Beta Access Features'}
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-200">
                <div>
                  <span className="font-semibold text-orange-400">✓ Real-Time Data:</span> Live odds from all major tracks
                </div>
                <div>
                  <span className="font-semibold text-orange-400">✓ AI-Powered:</span> Quantum computing analytics
                </div>
                <div>
                  <span className="font-semibold text-orange-400">✓ Professional Tools:</span> Used by successful handicappers
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
