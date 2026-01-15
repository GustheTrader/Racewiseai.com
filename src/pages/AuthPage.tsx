import React, { useEffect } from 'react';
import fireHorseImg from '@/assets/racewise-fire-horse.png';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import SimpleBetaForm from '@/components/auth/SimpleBetaForm';
import FireParticles from '@/components/auth/FireParticles';
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
      navigate('/');
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
        poster={fireHorseImg}
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      >
        <source src="/videos/horse-racing-bg.mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80" />

      {/* Fire particle effect */}
      <FireParticles />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 origin-top" style={{ transform: 'scale(0.75)', minHeight: '133.33vh' }}>
        <div className="w-full max-w-6xl mx-auto">
          
          {/* Header with fire glow */}
          <div className="text-center mb-12 animate-fade-in-up relative">
            {/* Fire glow behind logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] bg-gradient-radial from-orange-600/40 via-red-600/20 to-transparent blur-3xl animate-pulse" />
            </div>
            <div className="relative">
              <img 
                src={fireHorseImg} 
                alt="Racewise AI - Fire Horse" 
                className="h-64 md:h-80 mx-auto mb-6 object-contain drop-shadow-[0_0_60px_rgba(249,115,22,0.6)] animate-[pulse_3s_ease-in-out_infinite]"
              />
            </div>
            {/* 3D Title with teal-to-coral gradient */}
            <h1 className="text-4xl md:text-7xl font-black mb-4 relative tracking-tight">
              {/* Deep shadow layer */}
              <span className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 bg-clip-text text-transparent blur-[3px] translate-x-2 translate-y-2">
                ⚡ RACEWISE AI TOOLBOX ⚡
              </span>
              {/* Mid shadow with teal tones */}
              <span className="absolute inset-0 bg-gradient-to-r from-teal-900 via-orange-900 to-teal-900 bg-clip-text text-transparent blur-[1px] translate-x-1 translate-y-1">
                ⚡ RACEWISE AI TOOLBOX ⚡
              </span>
              {/* Teal/coral underlayer */}
              <span className="absolute inset-0 bg-gradient-to-r from-teal-600 via-orange-500 to-teal-600 bg-clip-text text-transparent translate-x-0.5 translate-y-0.5">
                ⚡ RACEWISE AI TOOLBOX ⚡
              </span>
              {/* Main gradient - teal to coral/orange to teal */}
              <span className="relative bg-gradient-to-r from-teal-400 via-orange-400 to-teal-400 bg-clip-text text-transparent" style={{ textShadow: '0 0 60px rgba(45,212,191,0.6), 0 0 120px rgba(251,146,60,0.5), 0 4px 0 rgba(0,0,0,0.3)' }}>
                ⚡ RACEWISE AI TOOLBOX ⚡
              </span>
            </h1>
            
            {/* Tagline with contrasting cyan/electric blue for flair */}
            <p className="text-xl md:text-2xl font-bold max-w-2xl mx-auto relative">
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-800 via-blue-700 to-cyan-800 bg-clip-text text-transparent blur-[1px] translate-x-0.5 translate-y-0.5">
                Ignite Your Edge • ML-Powered Handicapping Intelligence
              </span>
              <span className="relative bg-gradient-to-r from-cyan-300 via-sky-400 to-cyan-300 bg-clip-text text-transparent" style={{ textShadow: '0 0 25px rgba(34,211,238,0.6)' }}>
                Ignite Your Edge • ML-Powered Handicapping Intelligence
              </span>
            </p>
            
            {/* Subtitle with electric cyan accent */}
            <p className="mt-4 text-base md:text-lg font-semibold tracking-wider uppercase">
              <span className="bg-gradient-to-r from-cyan-400 via-white to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                ⚡ Professional-Grade AI Racing Analytics Platform ⚡
              </span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column - Tools 1-4 */}
            <div className="space-y-4">
              {tools.slice(0, 4).map((tool, index) => (
                <div 
                  key={tool.id} 
                  className={`glass-card-hover p-5 animate-fade-in-up stagger-${index + 1} border border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.15),inset_0_0_10px_rgba(34,211,238,0.05)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3),inset_0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-orange-500/10 to-red-600/10 animate-glow-pulse">
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
                  className={`glass-card-hover p-5 animate-fade-in-up stagger-${index + 5} border border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.15),inset_0_0_10px_rgba(34,211,238,0.05)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3),inset_0_0_15px_rgba(34,211,238,0.1)] transition-all duration-300`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-orange-500/10 to-red-600/10 animate-glow-pulse">
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
          <div className="mt-16 glass-card p-8 animate-fade-in-up stagger-8 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2),inset_0_0_15px_rgba(34,211,238,0.05)]">
            <h2 className="text-center text-xl md:text-2xl font-bold mb-6 relative inline-block w-full">
              <span className="bg-gradient-to-r from-cyan-400 via-orange-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" style={{ textShadow: '0 0 25px rgba(34,211,238,0.5)' }}>
                ⚡ Beta Access Features ⚡
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-orange-500/20 text-cyan-400 mb-3 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <Brain className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground text-sm">ML Algo Modeling</h3>
                <p className="text-xs text-muted-foreground mt-1">Clean data with advanced algorithms</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/20 text-orange-400 mb-3 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-foreground text-sm">AI Video Performance</h3>
                <p className="text-xs text-muted-foreground mt-1">Grades with run-out notes</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-orange-500/20 text-cyan-400 mb-3 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
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
