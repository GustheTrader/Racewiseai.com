
import React, { useState } from 'react';
import { Horse } from '../utils/types';
import { formatOdds } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Bot, Eye, EyeOff } from 'lucide-react';

interface PersonalModelCardProps {
  horses: Horse[];
}

interface WeightingFactors {
  speed: number;
  pace: number;
  closer: number;
  classLevel: number;
  fireNumber: number;
  finalTimeRating: number;
}

const PersonalModelCard: React.FC<PersonalModelCardProps> = ({ horses }) => {
  const [weights, setWeights] = useState<WeightingFactors>({
    speed: 0,
    pace: 0,
    closer: 0,
    classLevel: 0,
    fireNumber: 0,
    finalTimeRating: 0
  });

  const [personalModelOdds, setPersonalModelOdds] = useState<Record<number, number>>({});
  const [personalModelScores, setPersonalModelScores] = useState<Record<number, number>>({});
  const [collapsedHorses, setCollapsedHorses] = useState<Set<number>>(new Set());

  const toggleHorseCollapse = (horseId: number) => {
    setCollapsedHorses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(horseId)) {
        newSet.delete(horseId);
      } else {
        newSet.add(horseId);
      }
      return newSet;
    });
  };

  // Calculate personal model odds based on weights
  const calculatePersonalModelOdds = () => {
    const newOdds: Record<number, number> = {};
    const newScores: Record<number, number> = {};
    
    horses.forEach(horse => {
      // Use Q-Model Score as the base score
      const baseScore = horse.qModelScore || 50; // Default to 50 if no Q-Model Score
      
      // Base factors (using mock data for demonstration)
      const factors = {
        speed: Math.random() * 100, // Mock speed rating
        pace: Math.random() * 100, // Mock pace rating
        closer: Math.random() * 100, // Mock closer rating
        classLevel: Math.random() * 100, // Mock class rating
        fireNumber: horse.fireNumber || Math.random() * 100, // Use existing or mock
        finalTimeRating: Math.random() * 100 // Mock final time rating
      };

      // Calculate weighted boost
      const totalBoost = (
        (factors.speed * weights.speed / 100) +
        (factors.pace * weights.pace / 100) +
        (factors.closer * weights.closer / 100) +
        (factors.classLevel * weights.classLevel / 100) +
        (factors.fireNumber * weights.fireNumber / 100) +
        (factors.finalTimeRating * weights.finalTimeRating / 100)
      );

      // Apply boost to base Q-Model Score (allow up to 199, minimum 1)
      const pModelScore = Math.max(1, Math.min(199, Math.round(baseScore + totalBoost)));
      
      // Convert P-Model Score to odds (higher score = lower odds, based on Q-Model odds as base)
      const baseOdds = horse.modelOdds;
      const scoreRatio = pModelScore / (horse.qModelScore || 50);
      const pModelOdds = Math.max(1.1, baseOdds / scoreRatio);
      
      newOdds[horse.id] = parseFloat(pModelOdds.toFixed(2));
      newScores[horse.id] = pModelScore;
    });

    setPersonalModelOdds(newOdds);
    setPersonalModelScores(newScores);
  };

  const handleWeightChange = (factor: keyof WeightingFactors, value: number) => {
    setWeights(prev => ({
      ...prev,
      [factor]: value
    }));
  };

  const resetWeights = () => {
    setWeights({
      speed: 0,
      pace: 0,
      closer: 0,
      classLevel: 0,
      fireNumber: 0,
      finalTimeRating: 0
    });
  };

  // Get proper color based on post position
  const getPostPositionColor = (position: number): string => {
    switch (position) {
      case 1: return "#DC2626"; // red-600
      case 2: return "#FFFFFF"; // white
      case 3: return "#2563EB"; // blue-600
      case 4: return "#FACC15"; // yellow-400
      case 5: return "#16A34A"; // green-600
      case 6: return "#000000"; // black
      case 7: return "#F97316"; // orange-500
      case 8: return "#EC4899"; // pink-500
      case 9: return "#10B981"; // emerald-500
      case 10: return "#9333EA"; // purple-600
      case 11: return "#84CC16"; // lime-500
      case 12: return "#9CA3AF"; // gray-400
      default: return "#3B82F6"; // blue-500 (default)
    }
  };

  // Get odds color based on comparison with ML odds
  const getOddsColor = (odds: number, mlOdds?: number) => {
    if (!mlOdds) return '';
    if (odds < mlOdds) return 'text-red-500';
    if (odds > mlOdds) return 'text-green-500';
    return '';
  };

  // Filter out disqualified horses and separate visible from collapsed
  const availableHorses = horses.filter(horse => !horse.isDisqualified);
  const visibleHorses = availableHorses.filter(horse => !collapsedHorses.has(horse.id));
  const collapsedHorsesData = availableHorses.filter(horse => collapsedHorses.has(horse.id));

  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.01] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm px-4 py-3 border-b border-purple-500/30">
        <CardTitle className="text-base font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <Bot className="h-5 w-5 text-purple-300" />
          </div>
          Personal Model Odds
          <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          {/* Collapsed horses bar */}
          {collapsedHorsesData.length > 0 && (
            <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700/50">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-400">Collapsed horses:</span>
                {collapsedHorsesData.map((horse) => (
                  <button
                    key={horse.id}
                    onClick={() => toggleHorseCollapse(horse.id)}
                    className="text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded transition-colors"
                  >
                    {horse.pp} - {horse.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800/80 to-gray-900/60 text-gray-200 backdrop-blur-sm">
                  <th className="px-4 py-3 text-center w-16"><span className="text-xs">View</span></th>
                  <th className="px-4 py-3 text-left text-xs">PP</th>
                  <th className="px-4 py-3 text-left text-xs">Horse</th>
                  <th className="px-4 py-3 text-right text-xs">Live Odds</th>
                  <th className="px-4 py-3 text-right text-xs">ML Odds</th>
                  <th className="px-4 py-3 text-right text-xs">Q-Model Odds</th>
                  <th className="px-4 py-3 text-right text-xs">Q-Model Score</th>
                  <th className="px-4 py-3 text-right text-xs">P-Model Odds</th>
                  <th className="px-4 py-3 text-right text-xs">P-Model Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {visibleHorses.map((horse) => {
                  const ppColor = getPostPositionColor(horse.pp);
                  const textColor = horse.pp === 2 || horse.pp === 4 || horse.pp === 12 ? "text-black" : "text-white";
                  const isCollapsed = collapsedHorses.has(horse.id);
                  
                  return (
                    <tr key={horse.id} className="hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300 group/row relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"></div>
                      <td className="px-4 py-3 text-center relative z-10">
                        <button onClick={() => toggleHorseCollapse(horse.id)} className="rounded-full p-1 bg-gray-800/50 group-hover:bg-gray-600/50 transition-colors duration-300">
                          {isCollapsed ? (
                            <EyeOff className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-left relative z-10">
                        <div 
                          className="w-6 h-6 flex items-center justify-center border border-gray-500/50 backdrop-blur-sm shadow-lg"
                          style={{ backgroundColor: ppColor }}
                        >
                          <span className={`text-xs font-bold ${textColor}`}>{horse.pp}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-left relative z-10">
                        <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-medium">{horse.name}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono relative z-10">
                        <span className={getOddsColor(horse.liveOdds, horse.mlOdds)}>
                          {formatOdds(horse.liveOdds)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono relative z-10">
                        {formatOdds(horse.mlOdds || 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono relative z-10">
                        <span className={getOddsColor(horse.modelOdds, horse.mlOdds)}>
                          {formatOdds(horse.modelOdds)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono relative z-10">
                        {horse.qModelScore || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-400 relative z-10">
                        {personalModelOdds[horse.id] ? (
                          <span className={getOddsColor(personalModelOdds[horse.id], horse.mlOdds)}>
                            {formatOdds(personalModelOdds[horse.id])}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-green-400 relative z-10">
                        {personalModelScores[horse.id] || '-'}
                      </td>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform scale-x-0 group-hover/row:scale-x-100 transition-transform duration-500"></div>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Weighting Controls */}
          <div className="p-4 border-t border-gray-800/50 bg-gradient-to-r from-gray-800/30 to-gray-900/20 backdrop-blur-sm">
            <div className="mb-4">
              <h4 className="text-white font-semibold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">P-Model Boost Weighting Percentages</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(weights).map(([key, value]) => (
                  <div key={key} className="flex flex-col group/weight">
                    <label className="text-sm text-gray-300 mb-1 capitalize group-hover/weight:text-white transition-colors">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="0.1"
                        value={value}
                        onChange={(e) => handleWeightChange(key as keyof WeightingFactors, parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg appearance-none cursor-pointer slider backdrop-blur-sm"
                      />
                      <span className="text-white text-sm w-12 text-right font-mono bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{value.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                Total: <span className="text-white font-medium">{Object.values(weights).reduce((sum, weight) => sum + weight, 0).toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={calculatePersonalModelOdds}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center gap-2 border border-blue-500/30 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              >
                <Calculator className="h-4 w-4" />
                Evaluate Model
              </Button>
              <Button 
                onClick={resetWeights}
                variant="outline"
                className="border-gray-600/50 text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/60 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300"
              >
                Reset Weights
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalModelCard;
