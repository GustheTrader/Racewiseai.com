
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Zap, BarChart3 } from 'lucide-react';
import AIAgentChat from './AIAgentChat';

const AIAgentsCard: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'race-analyst',
      name: 'Agent RW Race Analyst',
      description: 'Expert race analysis and handicapping insights',
      icon: <BarChart3 className="h-8 w-8" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      fullDescription: 'your expert AI assistant for comprehensive race analysis, handicapping strategies, and performance insights'
    },
    {
      id: 'cosmic-bombs',
      name: 'Agent RW Cosmic Bombs',
      description: 'High-value longshot and overlay detection',
      icon: <Zap className="h-8 w-8" />,
      color: 'bg-purple-500 hover:bg-purple-600',
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
      <Card className="border-4 border-betting-secondaryPurple shadow-xl bg-betting-darkCard overflow-hidden h-full">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Race Agents
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <Button
                key={agent.id}
                onClick={() => handleAgentClick(agent.id)}
                className={`${agent.color} text-white p-6 h-auto flex flex-col items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg`}
              >
                <div className="text-white">
                  {agent.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-sm mb-1">{agent.name}</h3>
                  <p className="text-xs opacity-90">{agent.description}</p>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Click on any agent to start an interactive conversation
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
