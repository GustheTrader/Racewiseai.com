
import { supabase } from "@/integrations/supabase/client";
import { OddsPulseData, HorseOdds } from "@/types/RaceResultTypes";
import { toast } from "@/components/ui/use-toast";

/**
 * Validates incoming odds data from the Odds Pulse API
 */
export const validateOddsData = (data: any): boolean => {
  // Check required fields
  const requiredFields = ["timestamp", "source", "track_id", "race_number", "odds_data"];
  for (const field of requiredFields) {
    if (!(field in data)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Check if odds_data is an array with at least one entry
  if (!Array.isArray(data.odds_data) || data.odds_data.length === 0) {
    console.error('odds_data must be a non-empty array');
    return false;
  }

  // Validate each horse entry
  const horseRequiredFields = ["horse_id", "horse_name", "program_number", "current_odds"];
  for (const horse of data.odds_data) {
    for (const field of horseRequiredFields) {
      if (!(field in horse)) {
        console.error(`Missing required field in horse data: ${field}`);
        return false;
      }
    }
  }

  return true;
};

/**
 * Process odds data and store it in the database
 */
export const processOddsData = async (data: OddsPulseData): Promise<boolean> => {
  try {
    if (!validateOddsData(data)) {
      return false;
    }

    const { track_id, race_number } = data;
    
    // Try to find existing race result to update with odds data
    const { data: raceResults, error } = await supabase
      .from('race_results')
      .select('id, results_data')
      .eq('track_name', track_id)
      .eq('race_number', race_number)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching race results:', error);
      return false;
    }

    // If race found, update it with odds data
    if (raceResults && raceResults.length > 0) {
      const raceResult = raceResults[0];
      let currentResultsData: Record<string, any> = {};
      
      // Safely handle results_data which could be a string, object, or null
      if (raceResult.results_data) {
        if (typeof raceResult.results_data === 'string') {
          try {
            currentResultsData = JSON.parse(raceResult.results_data);
          } catch (e) {
            console.error('Error parsing results_data string:', e);
            currentResultsData = {};
          }
        } else if (typeof raceResult.results_data === 'object') {
          currentResultsData = raceResult.results_data as Record<string, any>;
        }
      }
      
      // Process the OddsPulseData into a plain object compatible with Json type
      const mergedOddsData = mergeOddsData(
        (currentResultsData.odds_pulse as OddsPulseData | null) || null, 
        data
      );
      
      // Ensure we're storing a plain JSON object, not a TypeScript class instance
      const plainOddsData = JSON.parse(JSON.stringify(mergedOddsData));
      
      // Create the updated results data with the plain JSON object
      const updatedResultsData = { 
        ...currentResultsData,
        odds_pulse: plainOddsData
      };
      
      const { error: updateError } = await supabase
        .from('race_results')
        .update({ results_data: updatedResultsData })
        .eq('id', raceResult.id);

      if (updateError) {
        console.error('Error updating odds data:', updateError);
        return false;
      }

      console.log(`Odds data updated for ${track_id} race ${race_number}`);
      return true;
    } else {
      // If no race found, store data in dead-letter queue for later reconciliation
      await storeInDeadLetterQueue(data);
      return false;
    }
  } catch (error) {
    console.error('Error processing odds data:', error);
    return false;
  }
};

/**
 * Merge existing odds data with new data to maintain history
 */
const mergeOddsData = (existingData: OddsPulseData | null, newData: OddsPulseData): OddsPulseData => {
  if (!existingData) return newData;
  
  const merged = { ...newData };
  
  // Merge odds history for each horse
  merged.odds_data = merged.odds_data.map(newHorseOdds => {
    const existingHorse = existingData.odds_data.find(h => h.horse_id === newHorseOdds.horse_id);
    
    if (existingHorse && existingHorse.odds_history) {
      // Create new history entry from current odds
      const newHistoryEntry = {
        timestamp: newData.timestamp,
        odds: newHorseOdds.current_odds
      };
      
      // Merge histories and limit to most recent 20 entries to prevent unbounded growth
      newHorseOdds.odds_history = [
        newHistoryEntry,
        ...(existingHorse.odds_history || [])
      ].slice(0, 20);
    } else {
      // If no existing history, create new one with current odds
      newHorseOdds.odds_history = [{
        timestamp: newData.timestamp,
        odds: newHorseOdds.current_odds
      }];
    }
    
    return newHorseOdds;
  });
  
  return merged;
};

/**
 * Store failed or unmatched odds data for later reconciliation
 */
const storeInDeadLetterQueue = async (data: OddsPulseData): Promise<void> => {
  try {
    // Store in local storage for now as a fallback mechanism
    // In a real implementation, this would go to a database dead-letter table
    const deadLetterQueue = JSON.parse(localStorage.getItem('oddsPulseDeadLetterQueue') || '[]');
    deadLetterQueue.push({
      timestamp: new Date().toISOString(),
      data,
      reason: 'No matching race found'
    });
    localStorage.setItem('oddsPulseDeadLetterQueue', JSON.stringify(deadLetterQueue));
    
    console.log('Odds data stored in dead-letter queue');
  } catch (error) {
    console.error('Failed to store in dead-letter queue:', error);
  }
};

/**
 * Configure Odds Pulse integration
 */
export const getOddsPulseConfig = () => {
  const config = {
    enabled: localStorage.getItem('ODDS_PULSE_ENABLED') === 'true',
    pollingInterval: Number(localStorage.getItem('ODDS_PULSE_POLLING_INTERVAL')) || 60,
    retryAttempts: 3,
    retryDelay: 5, // seconds
    maxRacesPerTrack: 20,
    logLevel: "INFO"
  };

  return config;
};

/**
 * Set Odds Pulse configuration
 */
export const setOddsPulseConfig = (config: {
  enabled?: boolean;
  pollingInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
  maxRacesPerTrack?: number;
  logLevel?: string;
}) => {
  const currentConfig = getOddsPulseConfig();
  const newConfig = { ...currentConfig, ...config };
  
  localStorage.setItem('ODDS_PULSE_ENABLED', newConfig.enabled.toString());
  localStorage.setItem('ODDS_PULSE_POLLING_INTERVAL', newConfig.pollingInterval.toString());
  
  toast({
    title: "Configuration Updated",
    description: `Odds Pulse API is now ${newConfig.enabled ? 'enabled' : 'disabled'}`,
    duration: 3000,
  });
  
  return newConfig;
};
