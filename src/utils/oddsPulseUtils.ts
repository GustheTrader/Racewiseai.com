import { supabase } from '../integrations/supabase/client';
import { OddsPulseData } from '../types/RaceResultTypes';
import { toast } from 'sonner';

export interface OddsPulseConfig {
  enabled: boolean;
  pollingInterval: number;
}

export const getOddsPulseConfig = (): OddsPulseConfig => {
  try {
    const stored = localStorage.getItem('oddsPulseConfig');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading odds pulse config:', error);
  }
  
  // Default configuration
  return {
    enabled: false,
    pollingInterval: 60
  };
};

export const setOddsPulseConfig = (config: OddsPulseConfig): void => {
  try {
    localStorage.setItem('oddsPulseConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving odds pulse config:', error);
  }
};

export const processOddsData = async (oddsData: OddsPulseData): Promise<boolean> => {
  try {
    // Process each horse's odds data
    for (const horse of oddsData.odds_data) {
      const { error } = await supabase
        .from('odds_data')
        .upsert({
          track_name: oddsData.track_id,
          race_number: oddsData.race_number,
          race_date: new Date().toISOString().split('T')[0],
          horse_number: parseInt(horse.program_number),
          horse_name: horse.horse_name,
          win_odds: horse.current_odds.toString(),
          pool_data: {
            morning_line: horse.morning_line,
            current_odds: horse.current_odds,
            timestamp: oddsData.timestamp
          }
        }, {
          onConflict: 'track_name,race_number,race_date,horse_number'
        });
        
      if (error) {
        console.error('Error storing odds data:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error processing odds data:', error);
    toast.error('Failed to process odds data');
    return false;
  }
};