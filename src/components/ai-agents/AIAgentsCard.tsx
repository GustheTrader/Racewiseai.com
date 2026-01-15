import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Cpu, Sparkles, Mic, MessageSquare } from 'lucide-react';
import VoiceAgentDialog from './VoiceAgentDialog';

const AIAgentsCard: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'race-analyst',
      name: 'Agent RW Race Analyst',
      description: 'Expert race analysis and handicapping insights',
      icon: <Cpu className="h-6 w-6" />,
      cardGradient: 'bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700',
      buttonGradient: 'bg-gradient-to-br from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500',
      accentColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      fullDescription: 'Your expert AI assistant for comprehensive race analysis, handicapping strategies, and performance insights.'
    },
    {
      id: 'cosmic-bombs',
      name: 'Agent RW Cosmic Bombs',
      description: 'High-value longshot and overlay detection',
      icon: <Sparkles className="h-6 w-6" />,
      cardGradient: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-violet-700',
      buttonGradient: 'bg-gradient-to-br from-fuchsia-400 to-purple-600 hover:from-fuchsia-300 hover:to-purple-500',
      accentColor: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
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
            className={`${agent.cardGradient} border-0 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20">
                  {agent.icon}
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">{agent.name}</CardTitle>
                  <p className="text-white/80 text-sm">{agent.description}</p>
                </div>
                <div className="ml-auto w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
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
              </div>
              
              <Button
                onClick={() => handleAgentClick(agent.id)}
                className={`w-full ${agent.buttonGradient} text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-white/20`}
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
