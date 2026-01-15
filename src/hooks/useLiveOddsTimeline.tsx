import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BettingDataPoint } from '@/utils/types';
import { generateBettingTimeline } from '@/utils/data/betting';

interface UseLiveOddsTimelineProps {
  trackName?: string;
  raceNumber?: number;
}

interface OddsHistoryRecord {
  id: number;
  race_id: string | null;
  entry_id: string | null;
  program_number: string | null;
  odds: number;
  timestamp: string | null;
  minutes_to_post: number | null;
  win_pool: number | null;
  place_pool: number | null;
  show_pool: number | null;
}

interface OddsDataRecord {
  id: string;
  track_name: string;
  race_date: string;
  race_number: number;
  horse_number: number;
  horse_name: string;
  win_odds: string | null;
  pool_data: any;
  scraped_at: string;
}

export const useLiveOddsTimeline = ({ trackName, raceNumber }: UseLiveOddsTimelineProps = {}) => {
  const [bettingData, setBettingData] = useState<BettingDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Transform odds_history data into BettingDataPoint format
  const transformOddsHistory = (records: OddsHistoryRecord[]): BettingDataPoint[] => {
    // Group by timestamp
    const timeGroups = new Map<string, OddsHistoryRecord[]>();
    
    records.forEach(record => {
      const timestamp = record.timestamp || new Date().toISOString();
      const timeKey = new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, []);
      }
      timeGroups.get(timeKey)!.push(record);
    });

    // Convert to BettingDataPoint array
    const dataPoints: BettingDataPoint[] = [];
    
    timeGroups.forEach((records, time) => {
      const dataPoint: BettingDataPoint = {
        time,
        volume: records.reduce((sum, r) => sum + (r.win_pool || 0) + (r.place_pool || 0) + (r.show_pool || 0), 0),
        timestamp: new Date(records[0].timestamp || Date.now()).getTime(),
        isSpike: false,
      };

      // Add odds for each runner
      records.forEach(record => {
        const pp = parseInt(record.program_number || '0');
        if (pp > 0 && pp <= 12) {
          dataPoint[`runner${pp}Odds`] = record.odds;
          dataPoint[`runner${pp}`] = Math.floor(Math.random() * 6) + 1; // Position placeholder
        }
      });

      dataPoints.push(dataPoint);
    });

    // Mark spikes (high volume points)
    if (dataPoints.length > 0) {
      const avgVolume = dataPoints.reduce((sum, d) => sum + d.volume, 0) / dataPoints.length;
      dataPoints.forEach(dp => {
        if (dp.volume > avgVolume * 1.5) {
          dp.isSpike = true;
        }
      });
    }

    return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  };

  // Transform odds_data into BettingDataPoint format
  const transformOddsData = (records: OddsDataRecord[]): BettingDataPoint[] => {
    // Group by scraped_at timestamp
    const timeGroups = new Map<string, OddsDataRecord[]>();
    
    records.forEach(record => {
      const timeKey = new Date(record.scraped_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      if (!timeGroups.has(timeKey)) {
        timeGroups.set(timeKey, []);
      }
      timeGroups.get(timeKey)!.push(record);
    });

    const dataPoints: BettingDataPoint[] = [];
    
    timeGroups.forEach((records, time) => {
      const dataPoint: BettingDataPoint = {
        time,
        volume: Math.round(5000 + Math.random() * 15000), // Estimated volume
        timestamp: new Date(records[0].scraped_at).getTime(),
        isSpike: false,
      };

      // Add odds for each horse
      records.forEach(record => {
        const pp = record.horse_number;
        if (pp > 0 && pp <= 12) {
          const odds = parseFloat(record.win_odds || '0') || (Math.random() * 10 + 2);
          dataPoint[`runner${pp}Odds`] = odds;
          dataPoint[`runner${pp}`] = Math.floor(Math.random() * 6) + 1;
        }
      });

      dataPoints.push(dataPoint);
    });

    return dataPoints.sort((a, b) => a.timestamp - b.timestamp);
  };

  const fetchLiveData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try odds_history first (more detailed timeline data)
      let query = supabase
        .from('odds_history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      const { data: historyData, error: historyError } = await query;

      if (!historyError && historyData && historyData.length > 0) {
        const transformed = transformOddsHistory(historyData as OddsHistoryRecord[]);
        if (transformed.length >= 5) {
          setBettingData(transformed);
          setIsLiveData(true);
          setLastUpdate(new Date());
          return;
        }
      }

      // Fallback to odds_data
      let oddsQuery = supabase
        .from('odds_data')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(100);

      if (trackName) {
        oddsQuery = oddsQuery.eq('track_name', trackName);
      }
      if (raceNumber) {
        oddsQuery = oddsQuery.eq('race_number', raceNumber);
      }

      const { data: oddsData, error: oddsError } = await oddsQuery;

      if (!oddsError && oddsData && oddsData.length > 0) {
        const transformed = transformOddsData(oddsData as OddsDataRecord[]);
        if (transformed.length >= 3) {
          setBettingData(transformed);
          setIsLiveData(true);
          setLastUpdate(new Date());
          return;
        }
      }

      // Use mock data if no live data available
      console.log('No live odds data available, using mock data');
      setBettingData(generateBettingTimeline());
      setIsLiveData(false);
      setLastUpdate(new Date());

    } catch (err: any) {
      console.error('Error fetching live odds:', err);
      setError(err.message);
      // Fallback to mock data on error
      setBettingData(generateBettingTimeline());
      setIsLiveData(false);
    } finally {
      setIsLoading(false);
    }
  }, [trackName, raceNumber]);

  // Initial fetch
  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('odds-timeline-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'odds_history'
      }, () => {
        fetchLiveData();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'odds_data'
      }, () => {
        fetchLiveData();
      })
      .subscribe();

    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchLiveData]);

  // Update mock data periodically when not using live data
  useEffect(() => {
    if (!isLiveData) {
      const mockUpdateInterval = setInterval(() => {
        setBettingData(generateBettingTimeline());
        setLastUpdate(new Date());
      }, 5000); // Refresh mock data every 5 seconds

      return () => clearInterval(mockUpdateInterval);
    }
  }, [isLiveData]);

  return { 
    bettingData, 
    isLoading, 
    isLiveData, 
    error, 
    lastUpdate,
    refetch: fetchLiveData 
  };
};
