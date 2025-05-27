
import React, { useState } from 'react';
import { Horse } from '../utils/types';
import { formatOdds, getChangeClass, formatDifference } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Badge } from './ui/badge';

interface OddsTableProps {
  horses: Horse[];
  highlightUpdates?: boolean;
  isLoading?: boolean;
}

// Map to convert post position to standard colors
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
    case 13: return "#9F1239"; // rose-800
    case 14: return "#14B8A6"; // teal-500
    case 15: return "#4338CA"; // indigo-700
    case 16: return "#F59E0B"; // amber-500
    default: return "#3B82F6"; // blue-500 (default)
  }
};

const OddsTable: React.FC<OddsTableProps> = ({ horses, highlightUpdates = false, isLoading = false }) => {
  const [hiddenHorses, setHiddenHorses] = useState<Set<number>>(new Set());

  const toggleHorseVisibility = (horseId: number) => {
    setHiddenHorses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(horseId)) {
        newSet.delete(horseId);
      } else {
        newSet.add(horseId);
      }
      return newSet;
    });
  };

  // Separate visible and hidden horses
  const visibleHorses = horses.filter(horse => !hiddenHorses.has(horse.id));
  const hiddenHorsesData = horses.filter(horse => hiddenHorses.has(horse.id));
  const orderedHorses = [...visibleHorses, ...hiddenHorsesData];

  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-betting-darkPurple overflow-hidden w-full">
      <CardHeader className="bg-purple-header px-4 py-3 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-semibold text-white">Odds Table</CardTitle>
        {isLoading && (
          <div className="flex items-center text-white">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Loading data...</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200">
                <th className="px-4 py-3 text-left w-8"></th>
                <th className="px-4 py-3 text-left">PP</th>
                <th className="px-4 py-3 text-left">Horse</th>
                <th className="px-4 py-3 text-right">Live Odds</th>
                <th className="px-4 py-3 text-right">ML Odds</th>
                <th className="px-4 py-3 text-right">Q-Model Odds</th>
                <th className="px-4 py-3 text-right">Q-Model Win %</th>
                <th className="px-4 py-3 text-right">Difference</th>
                <th className="px-4 py-3 text-left">Jockey</th>
                <th className="px-4 py-3 text-left">Trainer</th>
                <th className="px-4 py-3 text-center">J/T Stats</th>
                <th className="px-4 py-3 text-center">HFactors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <span>Fetching latest odds data...</span>
                    </div>
                  </td>
                </tr>
              ) : horses.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                    No odds data available for this race
                  </td>
                </tr>
              ) : (
                orderedHorses.map((horse) => {
                  // Get proper color based on post position
                  const ppColor = getPostPositionColor(horse.pp);
                  // Determine text color for legibility
                  const textColor = horse.pp === 2 || horse.pp === 4 || horse.pp === 12 ? "text-black" : "text-white";
                  const isHidden = hiddenHorses.has(horse.id);
                  
                  return (
                    <tr 
                      key={horse.id}
                      className={`${horse.irregularBetting ? 'bg-red-900/20' : ''} ${highlightUpdates ? 'transition-all duration-500' : ''} ${isHidden ? 'opacity-50 bg-gray-800/30' : ''}`}
                    >
                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={() => toggleHorseVisibility(horse.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title={isHidden ? "Show horse" : "Hide horse"}
                        >
                          {isHidden ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div 
                          className="w-6 h-6 flex items-center justify-center border border-gray-500"
                          style={{ backgroundColor: ppColor }}
                        >
                          <span className={`text-xs font-bold ${textColor}`}>{horse.pp}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-left flex items-center space-x-2">
                        {horse.isFavorite && (
                          <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
                        )}
                        <span className={isHidden ? 'text-gray-500' : ''}>{horse.name}</span>
                        {horse.irregularBetting && (
                          <Badge variant="destructive" className="ml-2 bg-red-500 text-white text-xs flex items-center gap-1 px-2 py-0.5">
                            <AlertCircle className="h-3 w-3" />
                            <span>Irregular</span>
                          </Badge>
                        )}
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
                        {horse.qModelWinPct ? `${horse.qModelWinPct}%` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono flex justify-end items-center">
                        <span className={getChangeClass(horse.difference)}>
                          {formatDifference(horse.difference)}
                        </span>
                        {horse.difference < 0 ? (
                          <TrendingDown className="h-4 w-4 ml-1 text-betting-positive" />
                        ) : horse.difference > 0 ? (
                          <TrendingUp className="h-4 w-4 ml-1 text-betting-negative" />
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-left">
                        {horse.jockey || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-left">
                        {horse.trainer || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-xs">{horse.jockeyWinPct || '0'}%</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-xs">{horse.trainerWinPct || '0'}%</span>
                          {horse.fireNumber && (
                            <span className="fire-number ml-1">{horse.fireNumber}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {horse.hFactors ? (
                            <>
                              {horse.hFactors.speed && <span className="px-1 py-0.5 text-xs bg-blue-700 text-white rounded">S</span>}
                              {horse.hFactors.pace && <span className="px-1 py-0.5 text-xs bg-green-700 text-white rounded">P</span>}
                              {horse.hFactors.form && <span className="px-1 py-0.5 text-xs bg-yellow-700 text-white rounded">F</span>}
                              {horse.hFactors.class && <span className="px-1 py-0.5 text-xs bg-red-700 text-white rounded">C</span>}
                            </>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OddsTable;
