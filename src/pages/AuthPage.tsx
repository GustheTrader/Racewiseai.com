
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
  // Removed login toggle - always show signup form

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
    <div className="min-h-screen bg-[#e0e0e0] p-6 text-gray-800 relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gray-400"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gray-400"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-block px-8 py-4 rounded-3xl bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] mb-6">
            <h1 className="text-5xl font-bold text-gray-700">RaceEdge AI</h1>
          </div>
          
          <div className="mt-6 max-w-4xl mx-auto px-8 py-6 rounded-3xl bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]">
            <p className="text-2xl font-semibold text-gray-600">
              Join hundreds of professional and recreational handicappers using our advanced AI-Tools
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tools 1-4 */}
          <div className="space-y-4">
            {tools.slice(0, 4).map((tool) => (
              <div 
                key={tool.id} 
                className="p-6 rounded-3xl bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] hover:shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 cursor-pointer active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-gray-500 shrink-0 mt-1 p-3 rounded-2xl bg-[#e0e0e0] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Center Column - Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <SimpleBetaForm />
            </div>
          </div>

          {/* Right Column - Tools 5-8 */}
          <div className="space-y-4">
            {tools.slice(4, 8).map((tool) => (
              <div 
                key={tool.id} 
                className="p-6 rounded-3xl bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] hover:shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] transition-all duration-300 cursor-pointer active:shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-gray-500 shrink-0 mt-1 p-3 rounded-2xl bg-[#e0e0e0] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Features Banner */}
        <div className="mt-12 text-center">
          <div className="p-8 rounded-3xl bg-[#e0e0e0] shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]">
            <div className="inline-block px-6 py-3 rounded-2xl bg-[#e0e0e0] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] mb-6">
              <h2 className="text-2xl font-bold text-gray-700">
                🚀 Beta Access Features
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="p-4 rounded-2xl bg-[#e0e0e0] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]">
                <span className="font-semibold text-gray-700">✓ ML Algo Modeling:</span>
                <p className="text-gray-600 mt-1">Clean data with advanced algorithms</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#e0e0e0] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]">
                <span className="font-semibold text-gray-700">✓ AI Video Performance:</span>
                <p className="text-gray-600 mt-1">Grades with run-out notes</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#e0e0e0] shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff]">
                <span className="font-semibold text-gray-700">✓ AI Agent Cosmic Bombs:</span>
                <p className="text-gray-600 mt-1">EV live longshots with deep research RL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
