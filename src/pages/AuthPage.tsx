import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '@/components/auth/AuthHeader';
import SignupForm from '@/components/auth/SignupForm';
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

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-betting-navyBlue to-betting-darkPurple p-6 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400/20 rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-purple-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-400/20 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-10 right-10 w-18 h-18 bg-orange-300/20 rounded-full animate-pulse delay-500"></div>
        
        {/* Moving gradient orbs */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-gradient-to-r from-orange-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-xl animate-bounce"></div>
        
        {/* Horse and Jockey Silhouettes */}
        <div className="absolute top-20 left-1/4 opacity-20">
          <svg width="120" height="80" viewBox="0 0 120 80" className="stroke-white stroke-2 fill-transparent">
            {/* Horse silhouette */}
            <path d="M10 70 Q5 65 8 60 Q12 55 18 58 Q25 50 35 52 Q45 48 55 52 Q65 45 75 50 Q85 45 95 48 Q100 40 110 45 Q115 50 110 55 Q105 60 100 65 L95 70 Q90 72 85 70 Q80 68 75 70 Q70 72 65 70 Q60 68 55 70 Q50 72 45 70 Q40 68 35 70 Q30 72 25 70 Q20 68 15 70 Q10 58 5 60 Z" />
            {/* Jockey silhouette */}
            <circle cx="70" cy="35" r="8" className="stroke-white stroke-2 fill-transparent" />
            <path d="M70 43 Q65 45 68 50 Q72 48 75 50 Q78 45 73 43" className="stroke-white stroke-2 fill-transparent" />
            <path d="M65 50 L60 65 M75 50 L80 65" className="stroke-white stroke-2" />
          </svg>
        </div>

        <div className="absolute top-32 right-1/4 opacity-15 animate-pulse">
          <svg width="100" height="70" viewBox="0 0 100 70" className="stroke-white stroke-2 fill-transparent">
            {/* Horse silhouette running */}
            <path d="M5 60 Q2 55 5 50 Q10 45 15 48 Q20 40 30 42 Q40 38 50 42 Q60 35 70 40 Q80 35 90 38 Q95 30 100 35 Q102 40 98 45 Q94 50 90 55 L85 60 Q80 62 75 60 Q70 58 65 60 Q60 62 55 60 Q50 58 45 60 Q40 62 35 60 Q30 58 25 60 Q20 62 15 60 Q10 58 5 60 Z" />
            {/* Jockey silhouette in racing position */}
            <circle cx="60" cy="25" r="6" className="stroke-white stroke-2 fill-transparent" />
            <path d="M60 31 Q55 33 58 38 Q62 36 65 38 Q68 33 63 31" className="stroke-white stroke-2 fill-transparent" />
            <path d="M55 38 L50 50 M65 38 L70 50" className="stroke-white stroke-2" />
          </svg>
        </div>

        <div className="absolute bottom-32 left-1/6 opacity-10 animate-bounce">
          <svg width="140" height="90" viewBox="0 0 140 90" className="stroke-white stroke-2 fill-transparent">
            {/* Larger horse silhouette */}
            <path d="M15 80 Q10 75 13 70 Q17 65 23 68 Q30 60 40 62 Q50 58 60 62 Q70 55 80 60 Q90 55 100 58 Q110 50 120 55 Q125 60 120 65 Q115 70 110 75 L105 80 Q100 82 95 80 Q90 78 85 80 Q80 82 75 80 Q70 78 65 80 Q60 82 55 80 Q50 78 45 80 Q40 82 35 80 Q30 78 25 80 Q20 82 15 80 Z" />
            {/* Jockey silhouette */}
            <circle cx="80" cy="45" r="10" className="stroke-white stroke-2 fill-transparent" />
            <path d="M80 55 Q75 57 78 62 Q82 60 85 62 Q88 57 83 55" className="stroke-white stroke-2 fill-transparent" />
            <path d="M75 62 L70 75 M85 62 L90 75" className="stroke-white stroke-2" />
          </svg>
        </div>

        <div className="absolute top-1/2 right-1/6 opacity-20 animate-pulse delay-1000">
          <svg width="110" height="75" viewBox="0 0 110 75" className="stroke-white stroke-2 fill-transparent">
            {/* Horse galloping silhouette */}
            <path d="M8 65 Q3 60 6 55 Q11 50 17 53 Q24 45 34 47 Q44 43 54 47 Q64 40 74 45 Q84 40 94 43 Q99 35 109 40 Q114 45 109 50 Q104 55 99 60 L94 65 Q89 67 84 65 Q79 63 74 65 Q69 67 64 65 Q59 63 54 65 Q49 67 44 65 Q39 63 34 65 Q29 67 24 65 Q19 63 14 65 Q9 67 8 65 Z" />
            {/* Jockey in racing stance */}
            <circle cx="69" cy="30" r="7" className="stroke-white stroke-2 fill-transparent" />
            <path d="M69 37 Q64 39 67 44 Q71 42 74 44 Q77 39 72 37" className="stroke-white stroke-2 fill-transparent" />
            <path d="M64 44 L59 57 M74 44 L79 57" className="stroke-white stroke-2" />
          </svg>
        </div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white/20 rounded-full animate-pulse`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <AuthHeader />
          
          <div className="mt-6 max-w-4xl mx-auto">
            <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-900 via-betting-tertiaryPurple via-yellow-400 to-orange-500 bg-clip-text drop-shadow-lg">
              Join hundreds of professional and recreational handicappers using our advanced AI-Tools
            </p>
          </div>
        </div>

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

          {/* Center Column - Signup Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <SignupForm />
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

        {/* Bottom Features Banner */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-orange-500/20 to-purple-900/20 border-orange-500/30 backdrop-blur-md">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                🚀 Beta Access Features
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-200">
                <div>
                  <span className="font-semibold text-orange-400">✓ Real-Time Data:</span> Live odds from all major tracks
                </div>
                <div>
                  <span className="font-semibold text-orange-400">✓ AI-Powered:</span> Quantum computing analytics
                </div>
                <div>
                  <span className="font-semibold text-orange-400">✓ Professional Tools:</span> Used by successful handicappers
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
