
import React, { useState } from 'react';
import { Horse } from '../utils/types';
import { formatOdds, getChangeClass, formatDifference } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp, AlertCircle, Loader2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';

interface OddsTableProps {
  horses: Horse[];
  highlightUpdates?: boolean;
  isLoading?: boolean;
  selectedHorseIds?: Set<number>;
}

type SortField = 'pp' | 'name' | 'liveOdds' | 'mlOdds' | 'modelOdds' | 'qModelWinPct' | 'qModelScore' | 'difference' | 'jockey' | 'trainer';
type SortDirection = 'asc' | 'desc';

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

const OddsTable: React.FC<OddsTableProps> = ({ 
  horses, 
  highlightUpdates = false, 
  isLoading = false,
  selectedHorseIds = new Set()
}) => {
  const [collapsedHorses, setCollapsedHorses] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField>('pp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-500" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-white" /> : 
      <ChevronDown className="h-4 w-4 text-white" />;
  };

  const sortedHorses = [...horses].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Filter out disqualified horses and separate visible from collapsed
  const availableHorses = sortedHorses.filter(horse => !horse.isDisqualified);
  const visibleHorses = availableHorses.filter(horse => !collapsedHorses.has(horse.id));
  const collapsedHorsesData = availableHorses.filter(horse => collapsedHorses.has(horse.id));

  const getHandicappingFactorDisplay = (hf?: number) => {
    if (!hf) return <span className="text-gray-500">-</span>;
    
    if (hf === 15) {
      return (
        <span className="px-2 py-1 text-xs bg-green-600 text-white rounded font-bold">
          $$$
        </span>
      );
    } else if (hf === 15.5) { // 15a
      return (
        <span className="px-2 py-1 text-xs bg-green-700 text-white rounded font-bold">
          $$$
        </span>
      );
    } else if (hf === 19) {
      return (
        <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded font-bold">
          IP
        </span>
      );
    } else if (hf === 20) {
      return (
        <span className="px-2 py-1 text-xs bg-orange-600 text-white rounded font-bold">
          LL
        </span>
      );
    }
    
    return <span className="text-gray-500">-</span>;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs">{children}</span>
        {getSortIcon(field)}
      </div>
    </th>
  );

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
        {/* Collapsed horses displayed as PP buttons */}
        {collapsedHorsesData.length > 0 && (
          <div className="px-4 py-2 bg-gray-800/30 border-b border-gray-700">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 mr-2">Collapsed:</span>
              {collapsedHorsesData.map((horse) => {
                const ppColor = getPostPositionColor(horse.pp);
                const textColor = horse.pp === 2 || horse.pp === 4 || horse.pp === 12 ? "text-black" : "text-white";
                
                return (
                  <button
                    key={horse.id}
                    onClick={() => toggleHorseCollapse(horse.id)}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                    title={`Click to expand ${horse.name}`}
                  >
                    <div 
                      className="w-5 h-5 flex items-center justify-center border border-gray-500 rounded"
                      style={{ backgroundColor: ppColor }}
                    >
                      <span className={`text-xs font-bold ${textColor}`}>{horse.pp}</span>
                    </div>
                    <span className="text-xs text-white">{horse.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200">
                <th className="px-4 py-3 text-left w-8"></th>
                <SortableHeader field="pp">PP</SortableHeader>
                <SortableHeader field="name">Horse</SortableHeader>
                <SortableHeader field="liveOdds">Live Odds</SortableHeader>
                <SortableHeader field="mlOdds">ML Odds</SortableHeader>
                <SortableHeader field="modelOdds">Q-Model Odds</SortableHeader>
                <SortableHeader field="qModelWinPct">Q-Model Win %</SortableHeader>
                <SortableHeader field="qModelScore">Q-Model Score</SortableHeader>
                <SortableHeader field="difference">Delta</SortableHeader>
                <SortableHeader field="jockey">Jockey</SortableHeader>
                <SortableHeader field="trainer">Trainer</SortableHeader>
                <th className="px-4 py-3 text-center"><span className="text-xs">J/T Stats</span></th>
                <th className="px-4 py-3 text-center"><span className="text-xs">HC Factor</span></th>
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
              ) : visibleHorses.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                    No odds data available for this race
                  </td>
                </tr>
              ) : (
                visibleHorses.map((horse) => {
                  // Get proper color based on post position
                  const ppColor = getPostPositionColor(horse.pp);
                  // Determine text color for legibility
                  const textColor = horse.pp === 2 || horse.pp === 4 || horse.pp === 12 ? "text-black" : "text-white";
                  const isCollapsed = collapsedHorses.has(horse.id);
                  const isSelected = selectedHorseIds.has(horse.id);
                  
                  return (
                    <tr 
                      key={horse.id}
                      className={`${horse.irregularBetting ? 'bg-red-900/20' : ''} ${highlightUpdates ? 'transition-all duration-500' : ''} ${isSelected ? 'bg-yellow-900/30 border-l-4 border-yellow-500' : ''}`}
                    >
                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={() => toggleHorseCollapse(horse.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title={isCollapsed ? "Expand horse" : "Collapse horse"}
                        >
                          <Eye className="h-4 w-4" />
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
                        <span>{horse.name}</span>
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
                      <td className="px-4 py-3 text-right font-mono">
                        {horse.qModelScore || 'N/A'}
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
                        {getHandicappingFactorDisplay(horse.handicappingFactor)}
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
