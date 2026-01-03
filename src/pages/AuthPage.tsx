import React, { useEffect } from 'react';
import logoWebp600 from '@/assets/racewise-logo@600.webp';
import logoAvif600 from '@/assets/racewise-logo@600.avif';
import logoWebp from '@/assets/racewise-logo.webp';
import logoAvif from '@/assets/racewise-logo.avif';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import SimpleBetaForm from '@/components/auth/SimpleBetaForm';
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

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const tools = [
    {
      id: 1,
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Live Odds Tracking",
      description: "Real-time monitoring with automatic updates"
    },
    {
      id: 2,
      icon: <Brain className="h-5 w-5" />,
      title: "Quantum kPCA Analytics",
      description: "Quantum-inspired predictive modeling"
    },
    {
      id: 3,
      icon: <Calculator className="h-5 w-5" />,
      title: "Personal Model Builder",
      description: "Customizable handicapping with adjustable weights"
    },
    {
      id: 4,
      icon: <DollarSign className="h-5 w-5" />,
      title: "Sharp Money Movement",
      description: "Track professional betting patterns"
    },
    {
      id: 5,
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Pool Analysis",
      description: "Monitor pools with payout projections"
    },
    {
      id: 6,
      icon: <Bot className="h-5 w-5" />,
      title: "AI Race Agent",
      description: "Real-time strategic insights"
    },
    {
      id: 7,
      icon: <Eye className="h-5 w-5" />,
      title: "Live Paddock Analysis",
      description: "AI-powered visual analysis with OpenCV"
    },
    {
      id: 8,
      icon: <Target className="h-5 w-5" />,
      title: "Exotic Bet Builder",
      description: "Automated ticket construction & optimization"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Video Background */}
      {/* Static fallback background while video loads */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={logoWebp600}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source src="/videos/horse-racing-bg.mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Header with gradient glow */}
          <div className="text-center mb-12 animate-fade-in-up relative">
            {/* Gradient glow behind logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent blur-3xl" />
            </div>
            <div className="relative">
              <picture>
                <source srcSet={logoAvif} type="image/avif" />
                <source srcSet={logoWebp} type="image/webp" />
                <img 
                  src={logoWebp} 
                  alt="Racewise AI Toolbox" 
                  className="h-48 md:h-64 mx-auto mb-4 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                />
              </picture>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto bg-gradient-to-r from-muted-foreground via-foreground/70 to-muted-foreground bg-clip-text">
              Professional handicapping tools powered by ML/AI quantum inspired models
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column - Tools 1-4 */}
            <div className="space-y-4">
              {tools.slice(0, 4).map((tool, index) => (
                <div 
                  key={tool.id} 
                  className={`glass-card-hover p-5 animate-fade-in-up stagger-${index + 1}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-400">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center Column - Form */}
            <div className="flex items-center justify-center animate-fade-in-up stagger-3">
              <SimpleBetaForm />
            </div>

            {/* Right Column - Tools 5-8 */}
            <div className="space-y-4">
              {tools.slice(4, 8).map((tool, index) => (
                <div 
                  key={tool.id} 
                  className={`glass-card-hover p-5 animate-fade-in-up stagger-${index + 5}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 text-purple-400">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{tool.title}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Features */}
          <div className="mt-16 glass-card p-8 animate-fade-in-up stagger-8">
            <h2 className="text-center text-lg font-medium text-foreground mb-6">
              Beta Access Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 mb-3">
                  <Brain className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground text-sm">ML Algo Modeling</h3>
                <p className="text-xs text-muted-foreground mt-1">Clean data with advanced algorithms</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 mb-3">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground text-sm">AI Video Performance</h3>
                <p className="text-xs text-muted-foreground mt-1">Grades with run-out notes</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 mb-3">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground text-sm">AI Cosmic Bombs Agent</h3>
                <p className="text-xs text-muted-foreground mt-1">EV live longshots • Text & Voice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
