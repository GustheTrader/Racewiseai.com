import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User, Award, Clock, DollarSign, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface LiveOdds {
  programNumber: string;
  horseName: string;
  currentOdds: string;
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
  trackCode?: string;
  trackPage?: string;
  trackName?: string;
  initialLiveOdds?: Record<string, LiveOdds>;
}

const ScrapedRaceCard: React.FC<ScrapedRaceCardProps> = ({ 
  race, 
  isExpanded, 
  onToggle,
  trackCode,
  trackPage,
  trackName,
  initialLiveOdds
}) => {
  const [sortField, setSortField] = useState<'programNumber' | 'morningLineOdds' | 'currentOdds'>('programNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [liveOdds, setLiveOdds] = useState<Record<string, LiveOdds>>(initialLiveOdds || {});
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(initialLiveOdds ? 'Pre-loaded' : null);

  // Update liveOdds when initialLiveOdds changes
  React.useEffect(() => {
    if (initialLiveOdds && Object.keys(initialLiveOdds).length > 0) {
      setLiveOdds(initialLiveOdds);
      setLastUpdated('Pre-loaded');
    }
  }, [initialLiveOdds]);

  const parseOdds = (odds: string | undefined): number => {
    if (!odds) return 999;
    const match = odds.match(/(\d+)-(\d+)/);
    if (match) {
      return parseInt(match[1]) / parseInt(match[2]);
    }
    return parseFloat(odds.replace(/[^0-9.]/g, '')) || 999;
  };

  const fetchLiveOdds = async () => {
    if (!trackName) {
      toast.error('Track information required');
      return;
    }

    setIsLoadingLive(true);
    try {
      const { data, error } = await supabase.functions.invoke('firecrawl-live-odds', {
        body: {
          trackName,
          trackCode,
          trackPage,
          raceNumber: race.raceNumber
        }
      });

      if (error) throw error;

      if (data.success && data.data?.horses) {
        const oddsMap: Record<string, LiveOdds> = {};
        data.data.horses.forEach((h: LiveOdds) => {
          oddsMap[h.programNumber] = h;
        });
        setLiveOdds(oddsMap);
        setLastUpdated(new Date().toLocaleTimeString());
        toast.success(`Live odds updated for Race ${race.raceNumber}`);
      } else {
        toast.error(data.error || 'No live odds data found');
      }
    } catch (err: any) {
      console.error('Error fetching live odds:', err);
      toast.error(err.message || 'Failed to fetch live odds');
    } finally {
      setIsLoadingLive(false);
    }
  };

  const getOddsDifference = (mlOdds: string | undefined, liveOddsVal: string | undefined): { diff: number; direction: 'up' | 'down' | 'same' } => {
    const ml = parseOdds(mlOdds);
    const live = parseOdds(liveOddsVal);
    
    if (ml === 999 || live === 999) return { diff: 0, direction: 'same' };
    
    const diff = ((live - ml) / ml) * 100;
    
    if (Math.abs(diff) < 5) return { diff: 0, direction: 'same' };
    return { 
      diff: Math.round(diff), 
      direction: diff > 0 ? 'up' : 'down' 
    };
  };

  const sortedHorses = [...(race.horses || [])].sort((a, b) => {
    if (sortField === 'programNumber') {
      const numA = parseInt(a.programNumber) || 0;
      const numB = parseInt(b.programNumber) || 0;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    } else if (sortField === 'currentOdds') {
      const oddsA = parseOdds(liveOdds[a.programNumber]?.currentOdds);
      const oddsB = parseOdds(liveOdds[b.programNumber]?.currentOdds);
      return sortDirection === 'asc' ? oddsA - oddsB : oddsB - oddsA;
    } else {
      const oddsA = parseOdds(a.morningLineOdds);
      const oddsB = parseOdds(b.morningLineOdds);
      return sortDirection === 'asc' ? oddsA - oddsB : oddsB - oddsA;
    }
  });

  const handleSort = (field: 'programNumber' | 'morningLineOdds' | 'currentOdds') => {
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

  const hasLiveOdds = Object.keys(liveOdds).length > 0;

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
                {hasLiveOdds && (
                  <Badge className="bg-green-900/30 text-green-400 border-green-600/30 text-[10px]">
                    LIVE
                  </Badge>
                )}
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
          {/* Live Odds Controls */}
          <div className="px-4 py-2 bg-[#0d1221] border-b border-blue-900/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchLiveOdds}
                disabled={isLoadingLive}
                className="border-green-600/50 text-green-400 hover:bg-green-900/20 text-xs h-7"
              >
                {isLoadingLive ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Fetch Live Odds
              </Button>
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Updated: {lastUpdated}
                </span>
              )}
            </div>
            {race.conditions && (
              <p className="text-xs text-gray-400 italic max-w-md truncate">{race.conditions}</p>
            )}
          </div>
          
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
                  <TableHead className="text-gray-400 font-semibold text-xs uppercase min-w-[160px]">Horse</TableHead>
                  <TableHead className="text-gray-400 font-semibold text-xs uppercase min-w-[100px]">Jockey</TableHead>
                  <TableHead className="text-gray-400 font-semibold text-xs uppercase min-w-[100px]">Trainer</TableHead>
                  <TableHead 
                    className="text-gray-400 font-semibold text-xs uppercase cursor-pointer hover:text-white text-center w-20"
                    onClick={() => handleSort('morningLineOdds')}
                  >
                    M/L {sortField === 'morningLineOdds' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className={cn(
                      "font-semibold text-xs uppercase cursor-pointer hover:text-white text-center w-20",
                      hasLiveOdds ? "text-green-400" : "text-gray-400"
                    )}
                    onClick={() => handleSort('currentOdds')}
                  >
                    LIVE {sortField === 'currentOdds' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-gray-400 font-semibold text-xs uppercase text-center w-20">
                    DIFF
                  </TableHead>
                  <TableHead className="text-gray-400 font-semibold text-xs uppercase text-center w-14">M/E</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHorses.map((horse, idx) => {
                  const horseliveLiveOdds = liveOdds[horse.programNumber];
                  const oddsDiff = getOddsDifference(horse.morningLineOdds, horseliveLiveOdds?.currentOdds);
                  
                  return (
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
                          <span className="truncate max-w-[80px]">{horse.jockey || <span className="text-gray-600">TBD</span>}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-300">
                          <Award className="h-3.5 w-3.5 text-amber-400" />
                          <span className="truncate max-w-[80px]">{horse.trainer || <span className="text-gray-600">TBD</span>}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("font-mono font-bold text-xs", getOddsColor(horse.morningLineOdds))}>
                          {horse.morningLineOdds || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {horseliveLiveOdds?.currentOdds ? (
                          <Badge className={cn("font-mono font-bold text-xs", getOddsColor(horseliveLiveOdds.currentOdds))}>
                            {horseliveLiveOdds.currentOdds}
                          </Badge>
                        ) : (
                          <span className="text-gray-600 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {horseliveLiveOdds?.currentOdds ? (
                          <div className={cn(
                            "flex items-center justify-center gap-1 text-xs font-semibold",
                            oddsDiff.direction === 'up' ? 'text-red-400' : 
                            oddsDiff.direction === 'down' ? 'text-green-400' : 'text-gray-500'
                          )}>
                            {oddsDiff.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                            {oddsDiff.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                            {oddsDiff.direction === 'same' && <Minus className="h-3 w-3" />}
                            {oddsDiff.diff !== 0 && `${oddsDiff.diff > 0 ? '+' : ''}${oddsDiff.diff}%`}
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs">-</span>
                        )}
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
                  );
                })}
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
