
import React, { useState } from 'react';
import { Horse } from '../utils/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { WeightingFactors } from './personal-model/types';
import { calculatePersonalModelResults } from './personal-model/utils';
import CollapsedHorsesBar from './personal-model/CollapsedHorsesBar';
import PersonalModelHorseRow from './personal-model/PersonalModelHorseRow';
import WeightingControls from './personal-model/WeightingControls';

interface PersonalModelCardProps {
  horses: Horse[];
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

  const calculatePersonalModelOdds = () => {
    const results = calculatePersonalModelResults(horses, weights);
    setPersonalModelOdds(results.odds);
    setPersonalModelScores(results.scores);
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

  // Filter out disqualified horses and separate visible from collapsed
  const availableHorses = horses.filter(horse => !horse.isDisqualified);
  const visibleHorses = availableHorses.filter(horse => !collapsedHorses.has(horse.id));
  const collapsedHorsesData = availableHorses.filter(horse => collapsedHorses.has(horse.id));

  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.01] animate-fade-in rounded-3xl bg-betting-darkPurple/50 shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(139,92,246,0.1)] border border-betting-tertiaryPurple/30 backdrop-blur-sm">
      <CardHeader className="bg-betting-darkPurple/50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(139,92,246,0.05)] px-4 py-3 border-b border-purple-500/20">
        <CardTitle className="text-base font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-betting-darkPurple/50 rounded-2xl shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(139,92,246,0.1)] border border-white/10">
            <Bot className="h-5 w-5 text-purple-300" />
          </div>
          Personal Model Odds
          <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <CollapsedHorsesBar 
            collapsedHorses={collapsedHorsesData}
            onToggleHorse={toggleHorseCollapse}
          />

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
                {visibleHorses.map((horse) => (
                  <PersonalModelHorseRow
                    key={horse.id}
                    horse={horse}
                    isCollapsed={collapsedHorses.has(horse.id)}
                    personalModelOdds={personalModelOdds}
                    personalModelScores={personalModelScores}
                    onToggleCollapse={toggleHorseCollapse}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <WeightingControls
            weights={weights}
            onWeightChange={handleWeightChange}
            onCalculate={calculatePersonalModelOdds}
            onReset={resetWeights}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalModelCard;
