import React, { useState } from 'react';
import { Horse } from '../utils/types';
import { formatOdds, getChangeClass, formatDifference } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp, AlertCircle, Loader2, Eye, EyeOff, ChevronUp, ChevronDown, BarChart3 } from 'lucide-react';
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

  const getOddsColor = (odds: number, mlOdds?: number) => {
    if (!mlOdds) return '';
    if (odds < mlOdds) return 'text-red-500';
    if (odds > mlOdds) return 'text-green-500';
    return '';
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
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.01] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm px-4 py-3 border-b border-purple-500/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <BarChart3 className="h-5 w-5 text-purple-300" />
          </div>
          Odds Table
          <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
          {isLoading && (
            <div className="flex items-center text-white ml-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Loading data...</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Collapsed horses displayed as PP buttons */}
        {collapsedHorsesData.length > 0 && (
          <div className="px-4 py-2 bg-gradient-to-r from-gray-800/40 to-gray-900/30 border-b border-gray-700/50 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 mr-2">Collapsed:</span>
              {collapsedHorsesData.map((horse) => {
                const ppColor = getPostPositionColor(horse.pp);
                const textColor = horse.pp === 2 || horse.pp === 4 || horse.pp === 12 ? "text-black" : "text-white";
                
                return (
                  <button
                    key={horse.id}
                    onClick={() => toggleHorseCollapse(horse.id)}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-gradient-to-r from-gray-700/60 to-gray-600/60 hover:from-gray-600/60 hover:to-gray-500/60 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-purple-500/30"
                    title={`Click to expand ${horse.name}`}
                  >
                    <div 
                      className="w-5 h-5 flex items-center justify-center border border-gray-500/50 rounded backdrop-blur-sm shadow-lg"
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
              <tr className="bg-gradient-to-r from-gray-800/80 to-gray-900/60 text-gray-200 backdrop-blur-sm">
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
            <tbody className="divide-y divide-gray-800/30">
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
                      className={`${horse.irregularBetting ? 'bg-gradient-to-r from-red-900/20 to-red-800/10' : 'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10'} ${highlightUpdates ? 'transition-all duration-500' : ''} ${isSelected ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/20 border-l-4 border-yellow-500' : ''} group/row relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"></div>
                      <td className="px-2 py-3 text-center relative z-10">
                        <button
                          onClick={() => toggleHorseCollapse(horse.id)}
                          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700/30"
                          title={isCollapsed ? "Expand horse" : "Collapse horse"}
                        >
                          <Eye className="h-4 w-4" />
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
                      <td className="px-4 py-3 text-left flex items-center space-x-2 relative z-10">
                        {horse.isFavorite && (
                          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-red-400 inline-block animate-pulse shadow-lg shadow-red-500/50"></span>
                        )}
                        <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-medium">{horse.name}</span>
                        {horse.irregularBetting && (
                          <Badge variant="destructive" className="ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs flex items-center gap-1 px-2 py-0.5 border border-red-400/30">
                            <AlertCircle className="h-3 w-3" />
                            <span>Irregular</span>
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        <span className={getOddsColor(horse.liveOdds, horse.mlOdds)}>
                          {formatOdds(horse.liveOdds)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatOdds(horse.mlOdds || 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        <span className={getOddsColor(horse.modelOdds, horse.mlOdds)}>
                          {formatOdds(horse.modelOdds)}
                        </span>
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
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform scale-x-0 group-hover/row:scale-x-100 transition-transform duration-500"></div>
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
