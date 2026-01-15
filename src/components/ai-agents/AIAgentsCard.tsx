import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Cpu, Sparkles, Mic, MessageSquare, Settings2 } from 'lucide-react';
import VoiceAgentDialog from './VoiceAgentDialog';

const AIAgentsCard: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'race-analyst',
      name: 'Agent RW Race Analyst',
      description: 'Expert race analysis and handicapping insights',
      icon: <Cpu className="h-6 w-6" />,
      cardGradient: 'bg-gradient-to-br from-amber-600 via-orange-700 to-red-800',
      buttonGradient: 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500',
      accentColor: 'bg-gradient-to-br from-amber-600 to-orange-700',
      glowEffect: false,
      fullDescription: 'Your expert AI assistant for comprehensive race analysis, handicapping strategies, and performance insights.'
    },
    {
      id: 'cosmic-bombs',
      name: 'Agent RW Cosmic Bombs',
      description: 'High-value longshot and overlay detection',
      icon: <Sparkles className="h-6 w-6" />,
      cardGradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500',
      buttonGradient: 'bg-gradient-to-br from-orange-300 to-orange-500 hover:from-orange-200 hover:to-orange-400',
      accentColor: 'bg-gradient-to-br from-orange-400 to-orange-500',
      glowEffect: true,
      fullDescription: 'Your AI specialist for identifying explosive betting opportunities and high-value longshots.'
    }
  ];

  const handleAgentClick = (agentId: string) => {
    setActiveAgent(agentId);
  };

  const closeChat = () => {
    setActiveAgent(null);
  };

  const getActiveAgentData = () => {
    return agents.find(agent => agent.id === activeAgent);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card 
            key={agent.id}
            className={`${agent.cardGradient} border-0 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] ${
              agent.glowEffect 
                ? 'shadow-[0_0_30px_rgba(251,146,60,0.5)] hover:shadow-[0_0_50px_rgba(251,146,60,0.7)] ring-2 ring-orange-400/50' 
                : 'hover:shadow-2xl'
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl backdrop-blur-sm border border-white/20 ${
                  agent.glowEffect ? 'bg-white/30 shadow-lg shadow-orange-400/30' : 'bg-white/20'
                }`}>
                  {agent.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-white">{agent.name}</CardTitle>
                  <p className="text-white/80 text-sm">{agent.description}</p>
                </div>
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  agent.glowEffect 
                    ? 'bg-yellow-300 shadow-lg shadow-yellow-300/70' 
                    : 'bg-green-400 shadow-lg shadow-green-400/50'
                }`}></div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-2 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-xs text-white/90">
                  <Mic className="h-3 w-3" />
                  <span>Voice Enabled</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-xs text-white/90">
                  <MessageSquare className="h-3 w-3" />
                  <span>Text Chat</span>
                </div>
                <div className="flex items-center gap-1 bg-white/15 px-2 py-1 rounded-full text-xs text-white/90 ml-auto">
                  <Settings2 className="h-3 w-3" />
                  <span>Voice Select</span>
                </div>
              </div>
              
              <Button
                onClick={() => handleAgentClick(agent.id)}
                className={`w-full ${agent.buttonGradient} text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-white/20 ${
                  agent.glowEffect ? 'shadow-orange-400/40' : ''
                }`}
              >
                <Bot className="h-4 w-4 mr-2" />
                Launch Agent
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeAgent && (
        <VoiceAgentDialog
          isOpen={!!activeAgent}
          onClose={closeChat}
          agentName={getActiveAgentData()?.name || ''}
          agentDescription={getActiveAgentData()?.fullDescription || ''}
          agentType={activeAgent}
          accentColor={getActiveAgentData()?.accentColor || 'bg-blue-600'}
        />
      )}
    </>
  );
};

export default AIAgentsCard;
