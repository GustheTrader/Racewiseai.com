
import { Horse } from '../../utils/types';
import { WeightingFactors, PersonalModelResults } from './types';

export const calculatePersonalModelResults = (horses: Horse[], weights: WeightingFactors): PersonalModelResults => {
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

  return { odds: newOdds, scores: newScores };
};

// Get proper color based on post position
export const getPostPositionColor = (position: number): string => {
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
export const getOddsColor = (odds: number, mlOdds?: number) => {
  if (!mlOdds) return '';
  if (odds < mlOdds) return 'text-red-500';
  if (odds > mlOdds) return 'text-green-500';
  return '';
};
