import React, { useState } from 'react';
import { Horse } from '../utils/types';
import { formatOdds } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

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

  // Calculate personal model odds based on weights
  const calculatePersonalModelOdds = () => {
    const newOdds: Record<number, number> = {};
    const newScores: Record<number, number> = {};
    
    horses.forEach(horse => {
      // Base factors (using mock data for demonstration)
      const factors = {
        speed: Math.random() * 100, // Mock speed rating
        pace: Math.random() * 100, // Mock pace rating
        closer: Math.random() * 100, // Mock closer rating
        classLevel: Math.random() * 100, // Mock class rating
        fireNumber: horse.fireNumber || Math.random() * 100, // Use existing or mock
        finalTimeRating: Math.random() * 100 // Mock final time rating
      };

      // Calculate weighted score
      const weightedScore = (
        (factors.speed * weights.speed / 100) +
        (factors.pace * weights.pace / 100) +
        (factors.closer * weights.closer / 100) +
        (factors.classLevel * weights.classLevel / 100) +
        (factors.fireNumber * weights.fireNumber / 100) +
        (factors.finalTimeRating * weights.finalTimeRating / 100)
      ) / 6; // Average the weighted factors

      // Convert score to odds (higher score = lower odds)
      const odds = Math.max(1.1, (100 - weightedScore) / 10 + 1);
      newOdds[horse.id] = parseFloat(odds.toFixed(2));
      
      // Calculate PModel Score (1-100 scale)
      const pModelScore = Math.max(1, Math.min(100, Math.round(weightedScore)));
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

  // Filter out disqualified horses
  const availableHorses = horses.filter(horse => !horse.isDisqualified);

  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-betting-darkPurple overflow-hidden w-full">
      <CardHeader className="bg-purple-header px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Personal Model Odds</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200">
                <th className="px-4 py-3 text-left">PP</th>
                <th className="px-4 py-3 text-left">Horse</th>
                <th className="px-4 py-3 text-right">Live Odds</th>
                <th className="px-4 py-3 text-right">ML Odds</th>
                <th className="px-4 py-3 text-right">Q-Model Odds</th>
                <th className="px-4 py-3 text-right">Q-Model Score</th>
                <th className="px-4 py-3 text-right">Personal Model Odds</th>
                <th className="px-4 py-3 text-right">PModel Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {availableHorses.map((horse) => {
                const ppColor = getPostPositionColor(horse.pp);
                const textColor = horse.pp === 2 || horse.pp === 4 || horse.pp === 12 ? "text-black" : "text-white";
                
                return (
                  <tr key={horse.id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-left">
                      <div 
                        className="w-6 h-6 flex items-center justify-center border border-gray-500"
                        style={{ backgroundColor: ppColor }}
                      >
                        <span className={`text-xs font-bold ${textColor}`}>{horse.pp}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <span>{horse.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatOdds(horse.liveOdds)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatOdds(horse.mlOdds || 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatOdds(horse.modelOdds)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {horse.qModelScore || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-400">
                      {personalModelOdds[horse.id] ? formatOdds(personalModelOdds[horse.id]) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-green-400">
                      {personalModelScores[horse.id] || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Weighting Controls */}
        <div className="p-4 border-t border-gray-800">
          <div className="mb-4">
            <h4 className="text-white font-semibold mb-3">PModel Boost Weighting Percentages</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(weights).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm text-gray-300 mb-1 capitalize">
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
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white text-sm w-12 text-right">{value.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
              Total: {Object.values(weights).reduce((sum, weight) => sum + weight, 0).toFixed(1)}%
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={calculatePersonalModelOdds}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Evaluate Model
            </Button>
            <Button 
              onClick={resetWeights}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Reset Weights
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalModelCard;
