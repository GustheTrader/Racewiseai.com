
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StatpalRace {
  id: number;
  statpal_race_id: string;
  track_name: string;
  country: string;
  race_date: string;
  race_time?: string;
  race_name?: string;
  distance?: string;
  class?: string;
  status?: string;
  going?: string;
  raw_data?: any;
  created_at?: string;
  updated_at?: string;
}

export interface StatpalHorse {
  id: number;
  statpal_horse_id: string;
  statpal_race_id?: string;
  horse_name: string;
  number?: number;
  age?: string;
  gender?: string;
  weight?: string;
  weight_lbs?: number;
  jockey_name?: string;
  jockey_id?: string;
  trainer_name?: string;
  trainer_id?: string;
  stall?: string;
  rating?: string;
  recent_form?: any;
  created_at?: string;
  updated_at?: string;
}

export interface StatpalResult {
  id: number;
  statpal_race_id?: string;
  horse_id?: string;
  horse_name?: string;
  position?: number;
  jockey_name?: string;
  distance_behind?: string;
  starting_price?: number;
  time_taken?: string;
  weight?: string;
  created_at?: string;
}

interface UseStatpalRealtimeProps {
  country?: 'usa' | 'uk';
  trackName?: string;
}

export const useStatpalRealtime = ({ country, trackName }: UseStatpalRealtimeProps = {}) => {
  const [races, setRaces] = useState<StatpalRace[]>([]);
  const [horses, setHorses] = useState<StatpalHorse[]>([]);
  const [results, setResults] = useState<StatpalResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch races
        let racesQuery = supabase
          .from('statpal_live_races')
          .select('*')
          .order('race_date', { ascending: false })
          .order('race_time', { ascending: true })
          .limit(20);
        
        if (country) {
          racesQuery = racesQuery.eq('country', country);
        }
        if (trackName) {
          racesQuery = racesQuery.eq('track_name', trackName);
        }
        
        const { data: racesData, error: racesError } = await racesQuery;
        
        if (racesError) throw racesError;
        setRaces(racesData || []);
        
        // Fetch horses for the races
        if (racesData && racesData.length > 0) {
          const raceIds = racesData.map(race => race.statpal_race_id);
          const { data: horsesData, error: horsesError } = await supabase
            .from('statpal_horses')
            .select('*')
            .in('statpal_race_id', raceIds)
            .order('number', { ascending: true });
          
          if (horsesError) throw horsesError;
          setHorses(horsesData || []);
          
          // Fetch results
          const { data: resultsData, error: resultsError } = await supabase
            .from('statpal_results')
            .select('*')
            .in('statpal_race_id', raceIds)
            .order('position', { ascending: true });
          
          if (resultsError) throw resultsError;
          setResults(resultsData || []);
        }
        
      } catch (err: any) {
        console.error('Error fetching Statpal data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Set up real-time subscriptions
    const racesChannel = supabase
      .channel('statpal-races-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'statpal_live_races',
        filter: country ? `country=eq.${country}` : undefined
      }, (payload) => {
        console.log('Race change received:', payload);
        if (payload.eventType === 'INSERT') {
          setRaces(prev => [payload.new as StatpalRace, ...prev].slice(0, 20));
        } else if (payload.eventType === 'UPDATE') {
          setRaces(prev => prev.map(race => 
            race.id === payload.new.id ? payload.new as StatpalRace : race
          ));
        } else if (payload.eventType === 'DELETE') {
          setRaces(prev => prev.filter(race => race.id !== payload.old.id));
        }
      })
      .subscribe();

    const horsesChannel = supabase
      .channel('statpal-horses-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'statpal_horses'
      }, (payload) => {
        console.log('Horse change received:', payload);
        if (payload.eventType === 'INSERT') {
          setHorses(prev => [...prev, payload.new as StatpalHorse]);
        } else if (payload.eventType === 'UPDATE') {
          setHorses(prev => prev.map(horse => 
            horse.id === payload.new.id ? payload.new as StatpalHorse : horse
          ));
        } else if (payload.eventType === 'DELETE') {
          setHorses(prev => prev.filter(horse => horse.id !== payload.old.id));
        }
      })
      .subscribe();

    const resultsChannel = supabase
      .channel('statpal-results-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'statpal_results'
      }, (payload) => {
        console.log('Result change received:', payload);
        if (payload.eventType === 'INSERT') {
          setResults(prev => [...prev, payload.new as StatpalResult]);
        } else if (payload.eventType === 'UPDATE') {
          setResults(prev => prev.map(result => 
            result.id === payload.new.id ? payload.new as StatpalResult : result
          ));
        } else if (payload.eventType === 'DELETE') {
          setResults(prev => prev.filter(result => result.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(racesChannel);
      supabase.removeChannel(horsesChannel);
      supabase.removeChannel(resultsChannel);
    };
  }, [country, trackName]);

  return {
    races,
    horses,
    results,
    isLoading,
    error,
  };
};
