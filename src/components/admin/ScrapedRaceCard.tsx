import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Award, Clock, DollarSign, Pill, Wrench, Weight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Horse {
  programNumber: string;
  horseName: string;
  jockey?: string;
  trainer?: string;
  morningLineOdds?: string;
  weight?: string;
  medication?: string;
  equipment?: string;
  owner?: string;
  age?: string;
  sex?: string;
  sire?: string;
  dam?: string;
}

interface Race {
  raceNumber: number;
  postTime?: string;
  distance?: string;
  surface?: string;
  raceType?: string;
  conditions?: string;
  purse?: string;
  horses?: Horse[];
}

interface ScrapedRaceCardProps {
  race: Race;
  isExpanded: boolean;
  onToggle: () => void;
}

const ScrapedRaceCard: React.FC<ScrapedRaceCardProps> = ({ race, isExpanded, onToggle }) => {
  const [sortField, setSortField] = useState<'programNumber' | 'morningLineOdds'>('programNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const parseOdds = (odds: string | undefined): number => {
    if (!odds) return 999;
    const match = odds.match(/(\d+)-(\d+)/);
    if (match) {
      return parseInt(match[1]) / parseInt(match[2]);
    }
    return parseFloat(odds.replace(/[^0-9.]/g, '')) || 999;
  };

  const sortedHorses = [...(race.horses || [])].sort((a, b) => {
    if (sortField === 'programNumber') {
      const numA = parseInt(a.programNumber) || 0;
      const numB = parseInt(b.programNumber) || 0;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    } else {
      const oddsA = parseOdds(a.morningLineOdds);
      const oddsB = parseOdds(b.morningLineOdds);
      return sortDirection === 'asc' ? oddsA - oddsB : oddsB - oddsA;
    }
  });

  const handleSort = (field: 'programNumber' | 'morningLineOdds') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getOddsColor = (odds: string | undefined): string => {
    const parsed = parseOdds(odds);
    if (parsed <= 2) return 'text-green-400 bg-green-900/20 border-green-600/30';
    if (parsed <= 5) return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
    if (parsed <= 10) return 'text-yellow-400 bg-yellow-900/20 border-yellow-600/30';
    return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 bg-[#0d1221] rounded-lg cursor-pointer hover:bg-[#151d33] transition-colors border border-blue-900/20">
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30 font-bold text-sm px-3 py-1">
              R{race.raceNumber}
            </Badge>
            <div>
              <p className="text-sm font-medium text-white flex items-center gap-2">
                {race.distance && <span>{race.distance}</span>}
                {race.surface && <span className="text-blue-400">{race.surface}</span>}
                {race.raceType && <span className="text-gray-400">• {race.raceType}</span>}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {race.postTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {race.postTime}
                  </span>
                )}
                {race.purse && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {race.purse}
                  </span>
                )}
                <span>{race.horses?.length || 0} entries</span>
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2 rounded-lg border border-blue-900/20 overflow-hidden">
          {race.conditions && (
            <div className="px-4 py-2 bg-[#0a0e1a] border-b border-blue-900/20">
              <p className="text-xs text-gray-400 italic">{race.conditions}</p>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#0d1221] border-blue-900/30 hover:bg-[#0d1221]">
                  <TableHead 
                    className="text-gray-400 font-semibold text-xs uppercase cursor-pointer hover:text-white w-14"
                    onClick={() => handleSort('programNumber')}
                  >
                    PP {sortField === 'programNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-gray-400 font-semibold text-xs uppercase min-w-[180px]">Horse</TableHead>
                  <TableHead className="text-gray-400 font-semibold text-xs uppercase min-w-[120px]">Jockey</TableHead>
                  <TableHead className="text-gray-400 font-semibold text-xs uppercase min-w-[120px]">Trainer</TableHead>
                  <TableHead 
                    className="text-gray-400 font-semibold text-xs uppercase cursor-pointer hover:text-white text-center w-20"
                    onClick={() => handleSort('morningLineOdds')}
                  >
                    M/L {sortField === 'morningLineOdds' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-gray-400 font-semibold text-xs uppercase text-center w-16">Wt</TableHead>
                  <TableHead className="text-gray-400 font-semibold text-xs uppercase text-center w-16">M/E</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHorses.map((horse, idx) => (
                  <TableRow 
                    key={idx} 
                    className={cn(
                      "border-blue-900/20 hover:bg-blue-900/10 transition-colors",
                      idx % 2 === 0 ? "bg-[#0a0e1a]" : "bg-[#0d1221]/50"
                    )}
                  >
                    <TableCell className="font-mono">
                      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-900/40 text-blue-300 text-sm font-bold">
                        {horse.programNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-white">{horse.horseName}</p>
                        {(horse.age || horse.sex || horse.sire) && (
                          <p className="text-xs text-gray-500">
                            {horse.age && horse.sex ? `${horse.age} ${horse.sex}` : (horse.age || horse.sex)}
                            {horse.sire && ` by ${horse.sire}`}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <User className="h-3.5 w-3.5 text-blue-400" />
                        {horse.jockey || <span className="text-gray-600">TBD</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-300">
                        <Award className="h-3.5 w-3.5 text-amber-400" />
                        {horse.trainer || <span className="text-gray-600">TBD</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("font-mono font-bold", getOddsColor(horse.morningLineOdds))}>
                        {horse.morningLineOdds || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs text-gray-400">
                        {horse.weight || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {horse.medication && (
                          <span className="text-xs text-red-400 font-semibold" title="Medication">
                            {horse.medication}
                          </span>
                        )}
                        {horse.equipment && (
                          <span className="text-xs text-yellow-400" title="Equipment">
                            {horse.equipment}
                          </span>
                        )}
                        {!horse.medication && !horse.equipment && (
                          <span className="text-gray-600">-</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {(!race.horses || race.horses.length === 0) && (
            <div className="p-8 text-center text-gray-500 text-sm">
              No entries found for this race
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ScrapedRaceCard;
