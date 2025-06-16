
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Cpu, Sparkles } from 'lucide-react';
import AIAgentChat from './AIAgentChat';

const AIAgentsCard: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'race-analyst',
      name: 'Agent RW Race Analyst',
      description: 'Expert race analysis and handicapping insights',
      icon: <Cpu className="h-5 w-5" />,
      color: 'bg-gradient-to-br from-blue-500/80 to-blue-600/90 hover:from-blue-400/90 hover:to-blue-500/95',
      fullDescription: 'your expert AI assistant for comprehensive race analysis, handicapping strategies, and performance insights'
    },
    {
      id: 'cosmic-bombs',
      name: 'Agent RW Cosmic Bombs',
      description: 'High-value longshot and overlay detection',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'bg-gradient-to-br from-purple-500/80 to-purple-600/90 hover:from-purple-400/90 hover:to-purple-500/95',
      fullDescription: 'your AI specialist for identifying explosive betting opportunities and high-value longshots'
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
      <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.02] animate-fade-in">
        <CardHeader className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm px-4 py-3 border-b border-betting-tertiaryPurple/20">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-white/10">
              <Bot className="h-5 w-5 text-blue-300" />
            </div>
            AI Race Agents
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <Button
                key={agent.id}
                onClick={() => handleAgentClick(agent.id)}
                className={`${agent.color} text-white p-5 h-auto flex flex-col items-center gap-3 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl border border-white/10 backdrop-blur-sm rounded-xl group relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  {agent.icon}
                </div>
                <div className="text-center relative z-10">
                  <h3 className="font-bold text-sm mb-1 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">{agent.name}</h3>
                  <p className="text-xs opacity-90 text-gray-200">{agent.description}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </Button>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400/80 flex items-center justify-center gap-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
              Click on any agent to start an interactive conversation
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
            </p>
          </div>
        </CardContent>
      </Card>

      {activeAgent && (
        <AIAgentChat
          isOpen={!!activeAgent}
          onClose={closeChat}
          agentName={getActiveAgentData()?.name || ''}
          agentDescription={getActiveAgentData()?.fullDescription || ''}
        />
      )}
    </>
  );
};

export default AIAgentsCard;
