
import React, { useState } from 'react';
import { Horse } from '../utils/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, BarChart3 } from 'lucide-react';
import SortableHeader from './odds-table/components/SortableHeader';
import CollapsedHorsesBar from './odds-table/components/CollapsedHorsesBar';
import HorseRow from './odds-table/components/HorseRow';
import LoadingState from './odds-table/components/LoadingState';
import { SortField, SortDirection } from './odds-table/types';

interface OddsTableProps {
  horses: Horse[];
  highlightUpdates?: boolean;
  isLoading?: boolean;
  selectedHorseIds?: Set<number>;
}

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
        <CollapsedHorsesBar 
          collapsedHorses={collapsedHorsesData}
          onToggleHorse={toggleHorseCollapse}
        />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800/80 to-gray-900/60 text-gray-200 backdrop-blur-sm">
                <th className="px-4 py-3 text-center w-16"><span className="text-xs">View</span></th>
                <SortableHeader field="pp" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>PP</SortableHeader>
                <SortableHeader field="name" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Horse</SortableHeader>
                <SortableHeader field="liveOdds" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Live Odds</SortableHeader>
                <SortableHeader field="mlOdds" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>ML Odds</SortableHeader>
                <SortableHeader field="modelOdds" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Q-Model Odds</SortableHeader>
                <SortableHeader field="qModelWinPct" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Q-Model Win %</SortableHeader>
                <SortableHeader field="qModelScore" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Q-Model Score</SortableHeader>
                <SortableHeader field="difference" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Delta</SortableHeader>
                <SortableHeader field="jockey" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Jockey</SortableHeader>
                <SortableHeader field="trainer" sortField={sortField} sortDirection={sortDirection} onSort={handleSort}>Trainer</SortableHeader>
                <th className="px-4 py-3 text-center"><span className="text-xs">J/T Stats</span></th>
                <th className="px-4 py-3 text-center"><span className="text-xs">HC Factor</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              <LoadingState isLoading={isLoading} hasNoData={visibleHorses.length === 0} />
              {!isLoading && visibleHorses.map((horse) => (
                <HorseRow
                  key={horse.id}
                  horse={horse}
                  highlightUpdates={highlightUpdates}
                  isSelected={selectedHorseIds.has(horse.id)}
                  onToggleCollapse={toggleHorseCollapse}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OddsTable;
