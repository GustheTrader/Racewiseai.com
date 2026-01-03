
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type StreamItem = {
  id: string;
  scraped_at?: string;
  created_at?: string;
  track_name?: string;
  race_number?: number;
  [key: string]: any;
};

interface UseDataStreamProps {
  trackName?: string;
  jobType?: 'odds' | 'will_pays' | 'results';
}

export const useDataStream = ({ trackName, jobType = 'odds' }: UseDataStreamProps) => {
  const [streamData, setStreamData] = useState<StreamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        let data: StreamItem[] = [];
        
        // Determine which table to query based on jobType
        if (jobType === 'odds') {
          const response = trackName 
            ? await supabase
                .from('odds_data')
                .select('*')
                .eq('track_name', trackName)
                .order('scraped_at', { ascending: false })
                .limit(15)
            : await supabase
                .from('odds_data')
                .select('*')
                .order('scraped_at', { ascending: false })
                .limit(15);
          
          if (response.error) throw response.error;
          data = response.data;
          
        } else if (jobType === 'will_pays') {
          const response = trackName 
            ? await supabase
                .from('exotic_will_pays')
                .select('*')
                .eq('track_name', trackName)
                .order('scraped_at', { ascending: false })
                .limit(15)
            : await supabase
                .from('exotic_will_pays')
                .select('*')
                .order('scraped_at', { ascending: false })
                .limit(15);
          
          if (response.error) throw response.error;
          data = response.data;
          
        } else if (jobType === 'results') {
          const response = trackName 
            ? await supabase
                .from('race_results')
                .select('*')
                .eq('track_name', trackName)
                .order('created_at', { ascending: false })
                .limit(15)
            : await supabase
                .from('race_results')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(15);
          
          if (response.error) throw response.error;
          data = response.data;
        }
        
        setStreamData(data || []);
      } catch (err: any) {
        console.error('Error fetching stream data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Set up real-time subscription
    let channel: ReturnType<typeof supabase.channel> | undefined;
    
    if (jobType === 'odds') {
      channel = supabase
        .channel('odds-data-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'odds_data',
          filter: trackName ? `track_name=eq.${trackName}` : undefined
        }, (payload) => {
          setStreamData(prevData => {
            // Ensure payload.new has the correct type with all required properties
            const newItem = payload.new as StreamItem;
            return [newItem, ...prevData].slice(0, 15);
          });
        })
        .subscribe();
    } else if (jobType === 'will_pays') {
      channel = supabase
        .channel('will-pays-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'exotic_will_pays',
          filter: trackName ? `track_name=eq.${trackName}` : undefined
        }, (payload) => {
          setStreamData(prevData => {
            // Ensure payload.new has the correct type with all required properties
            const newItem = payload.new as StreamItem;
            return [newItem, ...prevData].slice(0, 15);
          });
        })
        .subscribe();
    } else if (jobType === 'results') {
      channel = supabase
        .channel('results-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'race_results',
          filter: trackName ? `track_name=eq.${trackName}` : undefined
        }, (payload) => {
          setStreamData(prevData => {
            // Ensure payload.new has the correct type with all required properties
            const newItem = payload.new as StreamItem;
            return [newItem, ...prevData].slice(0, 15);
          });
        })
        .subscribe();
    }
    
    // Refresh data every 10 seconds as backup
    const interval = setInterval(fetchData, 10000);
    
    return () => {
      if (channel) supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [trackName, jobType]);
  
  return { streamData, isLoading, error };
};
