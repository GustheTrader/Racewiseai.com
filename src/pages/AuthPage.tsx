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
      
      {/* Racing track silhouette effect with motion blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Track/rail lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-28 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
          <div className="absolute bottom-36 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
        
        {/* Running horses - realistic galloping silhouettes at 50% opacity */}
        <div className="running-horse absolute bottom-20" style={{ animationDuration: '8s', animationDelay: '0s' }}>
          <svg viewBox="0 0 300 180" className="w-48 h-28 text-foreground/50" fill="currentColor">
            <path d="M260 95c-4-3-9-4-14-3l-12-22c-3-6-9-10-16-10l-4-18c-2-7-7-13-14-15l-22-6c-4-1-9 0-12 3l-12 12-30 3c-6 0-12 3-15 8l-18 24c-4 6-10 9-18 9h-12c-8 0-15 4-18 12l-9 21c-3 6-2 14 3 18l12 15v18c0 4 3 8 8 8h12c4 0 8-3 8-8v-12l22-8 38 5v15c0 4 3 8 8 8h12c4 0 8-3 8-8v-22l30-12 22 12v22c0 4 3 8 8 8h12c4 0 8-3 8-8v-30l15-8c7-3 12-10 12-18v-12c0-6-3-12-8-15zM68 82c4 0 8 3 8 8s-3 8-8 8-8-3-8-8 3-8 8-8zm142 38c-3 0-6-3-6-6s3-6 6-6 6 3 6 6-3 6-6 6z"/>
            {/* Jockey silhouette */}
            <ellipse cx="195" cy="55" rx="8" ry="10"/>
            <path d="M185 65c0 0 5 15 10 20l15-5-10-20z"/>
          </svg>
        </div>
        
        <div className="running-horse absolute bottom-36" style={{ animationDuration: '9s', animationDelay: '-2s' }}>
          <svg viewBox="0 0 300 180" className="w-40 h-24 text-foreground/50" fill="currentColor">
            <path d="M255 90l-8-12c-3-5-8-8-14-8h-9l-15-27c-3-6-9-9-15-9h-12l-9-12c-4-6-12-9-19-8l-27 5c-6 2-10 6-14 12l-9 22-38 8c-8 2-14 8-15 15l-6 23c-2 8 2 15 8 20l18 15-3 27c0 4 3 8 8 8h15c4 0 8-3 8-8l3-18 27-12 33 8-3 22c0 4 3 8 8 8h15c4 0 8-3 8-8l5-30 38-15 12 18 3 27c0 4 3 8 8 8h15c4 0 8-3 8-8v-38c0-5-2-9-5-12l-12-15 8-12c3-5 3-10 0-15zM82 93c4 0 8 3 8 8s-3 8-8 8-8-3-8-8 3-8 8-8z"/>
            <ellipse cx="180" cy="50" rx="7" ry="9"/>
          </svg>
        </div>
        
        <div className="running-horse absolute bottom-14" style={{ animationDuration: '11s', animationDelay: '-5s' }}>
          <svg viewBox="0 0 300 180" className="w-36 h-20 text-foreground/50" fill="currentColor">
            <path d="M265 100c-3-7-9-12-16-13l-15-8-8-30c-2-8-8-14-15-15l-30-8c-6-2-12 0-16 4l-15 18h-27c-8 0-15 5-19 10l-22 33c-3 5-8 8-14 8h-15c-8 0-14 5-16 10l-12 27c-3 6-2 14 3 18l15 18v12c0 4 3 8 8 8h12c4 0 8-3 8-8v-15l30-12 42 3v16c0 4 3 8 8 8h12c4 0 8-3 8-8v-18l33-15 18 8v26c0 4 3 8 8 8h12c4 0 8-3 8-8v-33c0-5-2-8-5-10l-8-8 12-5c6-3 10-9 10-16v-8zM75 112c4 0 8 3 8 8s-3 8-8 8-8-3-8-8 3-8 8-8z"/>
            <ellipse cx="175" cy="58" rx="6" ry="8"/>
          </svg>
        </div>
        
        {/* Motion blur/dust effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
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
