
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Brain, 
  Calculator, 
  DollarSign, 
  BarChart3, 
  Zap, 
  Users, 
  MessageSquare, 
  Database, 
  Star,
  Bot
} from 'lucide-react';

const AuthToolsGrid = () => {
  const tools = [
    {
      id: 1,
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Live Odds Tracking",
      description: "Real-time monitoring of horse racing odds with automatic updates, change indicators, and irregular betting alerts across all major tracks."
    },
    {
      id: 2,
      icon: <Brain className="h-6 w-6" />,
      title: "Q-Model Analytics",
      description: "Quantum-powered predictive model providing win percentages, confidence scores, and AI-driven probability assessments for each horse."
    },
    {
      id: 3,
      icon: <Calculator className="h-6 w-6" />,
      title: "Personal Model Builder",
      description: "Customizable weighting system to create your own handicapping model with adjustable factors like speed, pace, class, and fire numbers."
    },
    {
      id: 4,
      icon: <DollarSign className="h-6 w-6" />,
      title: "Sharp Money Movement",
      description: "Track professional betting patterns, steam moves, and irregular betting activity with real-time alerts and movement analysis."
    },
    {
      id: 5,
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Pool Analysis",
      description: "Monitor win, place, show, exacta, trifecta and superfecta pool movements with percentage breakdowns and payout projections."
    },
    {
      id: 6,
      icon: <Zap className="h-6 w-6" />,
      title: "Pace Analysis",
      description: "Advanced pace analysis tools for race strategy assessment including early pace, late pace, and speed figure calculations."
    },
    {
      id: 7,
      icon: <Users className="h-6 w-6" />,
      title: "Jockey/Trainer Statistics",
      description: "Comprehensive performance data for jockeys and trainers including win percentages, ROI metrics, and track-specific statistics."
    },
    {
      id: 8,
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Live Paddock Comments",
      description: "Real-time insights and observations from track personnel, including horse behavior, equipment changes, and visual assessments."
    },
    {
      id: 9,
      icon: <Database className="h-6 w-6" />,
      title: "Race Results Database",
      description: "Historical race results and performance tracking with detailed analytics, speed figures, and comparative performance metrics."
    },
    {
      id: 10,
      icon: <Star className="h-6 w-6" />,
      title: "Quantum Rankings",
      description: "AI-powered horse rankings across multiple tracks and races using quantum computing algorithms for superior predictive accuracy."
    },
    {
      id: 11,
      icon: <Bot className="h-6 w-6" />,
      title: "ML Ensemble & AI Analyst",
      description: "4-weighted ensemble model: CatBoost (40%), LightGBM (30%), RNN (20%), XGBoost (10%) with RL optimization. AI Race Agent provides real-time analysis with up-to-the-minute odds data and strategic insights."
    }
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Column - Tools 1-3, #10, and #11 */}
      <div className="space-y-4">
        {tools.slice(0, 3).map((tool) => (
          <Card key={tool.id} className="bg-betting-darkPurple/70 border-betting-secondaryPurple/50 backdrop-blur-md hover:bg-betting-darkPurple/80 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="bg-orange-500 text-white shrink-0">
                  #{tool.id}
                </Badge>
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

        {/* Tool #10 */}
        <Card className="bg-betting-darkPurple/70 border-betting-secondaryPurple/50 backdrop-blur-md hover:bg-betting-darkPurple/80 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="bg-orange-500 text-white shrink-0">
                #10
              </Badge>
              <div className="text-orange-400 shrink-0 mt-1">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Quantum Rankings</h3>
                <p className="text-sm text-gray-300 leading-relaxed">AI-powered horse rankings across multiple tracks and races using quantum computing algorithms for superior predictive accuracy.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tool #11 */}
        <Card className="bg-betting-darkPurple/70 border-betting-secondaryPurple/50 backdrop-blur-md hover:bg-betting-darkPurple/80 transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Badge variant="secondary" className="bg-orange-500 text-white shrink-0">
                #11
              </Badge>
              <div className="text-orange-400 shrink-0 mt-1">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">ML Ensemble & AI Analyst</h3>
                <p className="text-sm text-gray-300 leading-relaxed">4-weighted ensemble model: CatBoost (40%), LightGBM (30%), RNN (20%), XGBoost (10%) with RL optimization. AI Race Agent provides real-time analysis with up-to-the-minute odds data and strategic insights.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center Column - Auth Forms placeholder (will be filled by parent) */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* This div will be filled by the parent component */}
        </div>
      </div>

      {/* Right Column - Tools 4-9 */}
      <div className="space-y-4">
        {tools.slice(3, 9).map((tool) => (
          <Card key={tool.id} className="bg-betting-darkPurple/70 border-betting-secondaryPurple/50 backdrop-blur-md hover:bg-betting-darkPurple/80 transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="bg-orange-500 text-white shrink-0">
                  #{tool.id}
                </Badge>
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
  );
};

export default AuthToolsGrid;
