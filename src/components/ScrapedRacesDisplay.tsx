import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface RaceCard {
  id: string;
  track_name: string;
  race_date: string;
  race_number: number;
  race_time?: string;
  post_time?: string;
  race_type?: string;
  distance?: string;
  surface?: string;
  conditions?: string;
  purse?: string;
  scraped_at: string;
  horses?: Horse[];
  betting_pools?: BettingPool[];
}

interface Horse {
  id: string;
  program_number: number;
  horse_name: string;
  jockey_name?: string;
  trainer_name?: string;
  post_position?: number;
  morning_line?: string;
  weight?: number;
  age?: number;
}

interface BettingPool {
  pool_type: string;
  total_pool: number;
}

const ScrapedRacesDisplay: React.FC = () => {
  const [races, setRaces] = useState<RaceCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<string>('all');

  // Fetch scraped races
  const fetchRaces = async () => {
    setIsLoading(true);
    try {
                  let query = (supabase as any)
        .from('race_cards')
        .select(`
          *,
          horses (*),
          betting_pools (*)
        `)
        .order('scraped_at', { ascending: false })
        .limit(50);

      if (selectedTrack !== 'all') {
        query = query.eq('track_name', selectedTrack);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setRaces((data || []) as unknown as RaceCard[]);
    } catch (error: any) {
      console.error('Error fetching races:', error);
      toast.error('Failed to load scraped races');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces();
  }, [selectedTrack]);

  // Get unique tracks
  const tracks = Array.from(new Set(races.map(r => r.track_name)));

  // Format currency
  const formatCurrency = (value: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-betting-navyBlue border-betting-mediumBlue">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>📊 Scraped Races Database</CardTitle>
          <Button
            onClick={fetchRaces}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-betting-tertiaryPurple hover:bg-betting-tertiaryPurple/10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Track Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setSelectedTrack('all')}
              variant={selectedTrack === 'all' ? 'default' : 'outline'}
              size="sm"
              className={selectedTrack === 'all' ? 'bg-blue-600' : 'border-betting-mediumBlue'}
            >
              All Tracks ({races.length})
            </Button>
            {tracks.map(track => (
              <Button
                key={track}
                onClick={() => setSelectedTrack(track)}
                variant={selectedTrack === track ? 'default' : 'outline'}
                size="sm"
                className={selectedTrack === track ? 'bg-blue-600' : 'border-betting-mediumBlue'}
              >
                {track} ({races.filter(r => r.track_name === track).length})
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          )}

          {/* Races List */}
          {!isLoading && races.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No scraped races yet. Use the Gemini Scraper to collect data.</p>
            </div>
          )}

          {!isLoading && races.length > 0 && (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {races.map(race => (
                <div
                  key={race.id}
                  className="border border-betting-mediumBlue rounded-lg p-3 bg-betting-dark hover:bg-betting-dark/80 cursor-pointer transition"
                  onClick={() => setExpandedRaceId(expandedRaceId === race.id ? null : race.id)}
                >
                  {/* Race Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {race.track_name} - Race {race.race_number}
                      </div>
                      <div className="text-xs text-gray-400 space-x-2">
                        <span>📅 {race.race_date}</span>
                        {race.race_time && <span>🕐 {race.race_time}</span>}
                        {race.distance && <span>📏 {race.distance}</span>}
                        {race.surface && <span>🏜️ {race.surface}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">
                        🐴 {race.horses?.length || 0} horses
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(race.scraped_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedRaceId === race.id && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-betting-mediumBlue">
                      {/* Race Info */}
                      {(race.race_type || race.conditions || race.purse) && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {race.race_type && (
                            <div>
                              <span className="text-gray-400">Type:</span>
                              <span className="ml-1 text-white">{race.race_type}</span>
                            </div>
                          )}
                          {race.conditions && (
                            <div>
                              <span className="text-gray-400">Conditions:</span>
                              <span className="ml-1 text-white">{race.conditions}</span>
                            </div>
                          )}
                          {race.purse && (
                            <div className="col-span-2">
                              <span className="text-gray-400">Purse:</span>
                              <span className="ml-1 text-white">{race.purse}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Horses Table */}
                      {race.horses && race.horses.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-300 mb-2">Horses</div>
                          <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {race.horses.map(horse => (
                              <div
                                key={horse.id}
                                className="text-xs p-2 bg-betting-navyBlue rounded flex justify-between"
                              >
                                <div>
                                  <span className="font-semibold text-white">
                                    #{horse.program_number}
                                  </span>
                                  <span className="ml-2 text-gray-300">{horse.horse_name}</span>
                                </div>
                                <div className="text-gray-400">
                                  {horse.jockey_name && (
                                    <span>{horse.jockey_name}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Betting Pools */}
                      {race.betting_pools && race.betting_pools.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-300 mb-2">Pools</div>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {race.betting_pools.map((pool, idx) => (
                              <div key={idx} className="p-1 bg-betting-navyBlue rounded">
                                <div className="text-gray-400">{pool.pool_type}</div>
                                <div className="font-semibold text-white">
                                  {formatCurrency(pool.total_pool)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrapedRacesDisplay;
