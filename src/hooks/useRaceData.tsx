import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Horse, Race, Track } from '@/utils/types';

export const useRaceData = () => {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate sample horses for demo
  const generateSampleHorses = (): Horse[] => {
    const sampleNames = [
      "THUNDER BOLT", "RACING SPIRIT", "MIDNIGHT EXPRESS", 
      "GOLDEN ARROW", "SPEED DEMON", "LUCKY CHARM",
      "FIRE STORM", "WIND RUNNER", "CHAMPION'S PRIDE",
      "VICTORY LAP", "BLAZING TRAIL", "ROYAL FLUSH"
    ];

    return sampleNames.map((name, index) => ({
      id: index + 1,
      name,
      number: index + 1,
      pp: index + 1,
      jockey: `Jockey ${index + 1}`,
      trainer: `Trainer ${index + 1}`,
      ml_odds: Math.random() * 20 + 2,
      liveOdds: Math.random() * 25 + 2,
      modelOdds: Math.random() * 20 + 3,
      qModelScore: Math.random() * 100,
      qModelWinPct: Math.random() * 40 + 5,
      fireNumber: Math.floor(Math.random() * 100) + 50,
      difference: (Math.random() - 0.5) * 10,
      isFavorite: index === 0,
      weight: 120,
      age: Math.floor(Math.random() * 6) + 2,
      sex: Math.random() > 0.5 ? 'C' : 'F',
      earnings: Math.floor(Math.random() * 500000),
      wins: Math.floor(Math.random() * 15),
      places: Math.floor(Math.random() * 10),
      shows: Math.floor(Math.random() * 8),
      starts: Math.floor(Math.random() * 25) + 5,
    }));
  };

  // Generate sample races
  const generateSampleRaces = (): Race[] => {
    const trackNames = ["CHURCHILL DOWNS", "BELMONT PARK", "AQUEDUCT", "GULFSTREAM"];
    
    return Array.from({ length: 8 }, (_, index) => ({
      id: `race-${index + 1}`,
      number: index + 1,
      track_name: trackNames[Math.floor(Math.random() * trackNames.length)],
      race_date: new Date().toISOString().split('T')[0],
      post_time: `${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} PM`,
      distance: `${Math.floor(Math.random() * 3) + 6} furlongs`,
      surface: Math.random() > 0.5 ? 'dirt' : 'turf' as 'dirt' | 'turf',
      race_type: 'Allowance',
      purse: Math.floor(Math.random() * 100000) + 50000,
      horses: generateSampleHorses()
    }));
  };

  // Generate sample tracks
  const generateSampleTracks = (): Track[] => {
    return [
      { id: '1', name: 'CHURCHILL DOWNS', abbreviation: 'CD', location: 'Louisville, KY' },
      { id: '2', name: 'BELMONT PARK', abbreviation: 'BEL', location: 'Elmont, NY' },
      { id: '3', name: 'AQUEDUCT', abbreviation: 'AQU', location: 'Ozone Park, NY' },
      { id: '4', name: 'GULFSTREAM', abbreviation: 'GP', location: 'Hallandale Beach, FL' },
    ];
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Try to fetch real data from Supabase first
      const { data: raceData } = await supabase
        .from('race_data')
        .select(`
          *,
          race_horses (*)
        `)
        .limit(10);

      if (raceData && raceData.length > 0) {
        // Convert Supabase data to our format
        const formattedRaces: Race[] = raceData.map(race => ({
          id: race.id,
          number: race.race_number,
          track_name: race.track_name,
          race_date: race.race_date,
          horses: (race.race_horses || []).map((horse: any) => ({
            id: horse.id,
            name: horse.name,
            number: horse.pp,
            pp: horse.pp,
            jockey: horse.jockey,
            trainer: horse.trainer,
            ml_odds: horse.ml_odds,
            liveOdds: Math.random() * 25 + 2,
            modelOdds: Math.random() * 20 + 3,
            qModelScore: Math.random() * 100,
            qModelWinPct: Math.random() * 40 + 5,
            fireNumber: Math.floor(Math.random() * 100) + 50,
            difference: (Math.random() - 0.5) * 10,
            isFavorite: horse.pp === 1,
          }))
        }));
        
        setRaces(formattedRaces);
        setHorses(formattedRaces.flatMap(race => race.horses));
      } else {
        // Fallback to sample data
        const sampleRaces = generateSampleRaces();
        setRaces(sampleRaces);
        setHorses(sampleRaces.flatMap(race => race.horses));
      }
      
      setTracks(generateSampleTracks());
    } catch (error) {
      console.error('Error fetching race data:', error);
      // Fallback to sample data on error
      const sampleRaces = generateSampleRaces();
      setRaces(sampleRaces);
      setHorses(sampleRaces.flatMap(race => race.horses));
      setTracks(generateSampleTracks());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    horses,
    races,
    tracks,
    isLoading,
    refetch: fetchData
  };
};