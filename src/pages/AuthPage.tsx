import React, { useEffect } from 'react';
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
    <div className="min-h-screen animated-gradient-bg text-foreground relative overflow-hidden">
      {/* Floating orbs for ambient effect */}
      <div className="floating-orb w-[600px] h-[600px] bg-blue-500/20 -top-48 -left-48" style={{ animationDelay: '0s' }} />
      <div className="floating-orb w-[500px] h-[500px] bg-purple-500/15 top-1/2 -right-32" style={{ animationDelay: '-5s' }} />
      <div className="floating-orb w-[400px] h-[400px] bg-cyan-500/10 -bottom-32 left-1/4" style={{ animationDelay: '-10s' }} />
      
      {/* Running horses animation - realistic galloping silhouettes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="running-horse absolute bottom-24 opacity-50" style={{ animationDuration: '10s', animationDelay: '0s' }}>
          <svg viewBox="0 0 200 120" className="w-40 h-24 text-blue-400" fill="currentColor">
            <path d="M180 65c-3-2-7-3-11-2l-8-15c-2-4-6-7-11-7l-3-12c-1-5-5-9-10-10l-15-4c-3-1-6 0-8 2l-8 8-20 2c-4 0-8 2-10 5l-12 16c-3 4-7 6-12 6h-8c-5 0-10 3-12 8l-6 14c-2 4-1 9 2 12l8 10v12c0 3 2 5 5 5h8c3 0 5-2 5-5v-8l15-5 25 3v10c0 3 2 5 5 5h8c3 0 5-2 5-5v-15l20-8 15 8v15c0 3 2 5 5 5h8c3 0 5-2 5-5v-20l10-5c5-2 8-7 8-12v-8c0-4-2-8-5-10zM45 55c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5zm95 25c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z"/>
          </svg>
        </div>
        <div className="running-horse absolute bottom-40 opacity-50" style={{ animationDuration: '14s', animationDelay: '-4s' }}>
          <svg viewBox="0 0 200 120" className="w-32 h-20 text-purple-400" fill="currentColor">
            <path d="M175 58l-5-8c-2-3-5-5-9-5h-6l-10-18c-2-4-6-6-10-6h-8l-6-8c-3-4-8-6-13-5l-18 3c-4 1-7 4-9 8l-6 15-25 5c-5 1-9 5-10 10l-4 15c-1 5 1 10 5 13l12 10-2 18c0 3 2 5 5 5h10c3 0 5-2 5-5l2-12 18-8 22 5-2 15c0 3 2 5 5 5h10c3 0 5-2 5-5l3-20 25-10 8 12 2 18c0 3 2 5 5 5h10c3 0 5-2 5-5v-25c0-3-1-6-3-8l-8-10 5-8c2-3 2-7 0-10zM55 62c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5z"/>
          </svg>
        </div>
        <div className="running-horse absolute bottom-16 opacity-50" style={{ animationDuration: '18s', animationDelay: '-9s' }}>
          <svg viewBox="0 0 200 120" className="w-28 h-16 text-cyan-400" fill="currentColor">
            <path d="M185 70c-2-5-6-8-11-9l-10-5-5-20c-1-5-5-9-10-10l-20-5c-4-1-8 0-11 3l-10 12h-18c-5 0-10 3-13 7l-15 22c-2 3-5 5-9 5h-10c-5 0-9 3-11 7l-8 18c-2 4-1 9 2 12l10 12v8c0 3 2 5 5 5h8c3 0 5-2 5-5v-10l20-8 28 2v11c0 3 2 5 5 5h8c3 0 5-2 5-5v-12l22-10 12 5v17c0 3 2 5 5 5h8c3 0 5-2 5-5v-22c0-3-1-5-3-7l-5-5 8-3c4-2 7-6 7-11v-5zM50 75c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5z"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Header with gradient glow */}
          <div className="text-center mb-12 animate-fade-in-up relative">
            {/* Gradient glow behind logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 bg-gradient-radial from-blue-500/20 via-purple-500/10 to-transparent blur-3xl" />
            </div>
            <div className="relative">
              <img 
                src="/assets/racewise-logo.png" 
                alt="Racewise AI Toolbox" 
                className="h-48 md:h-64 mx-auto mb-4 object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
              />
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
