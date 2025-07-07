
export interface RaceResult {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  results_data: {
    [key: string]: any;
    odds_pulse?: OddsPulseData;
  };
  source_url?: string;
  created_at: string;
}

// New types for Odds Pulse API integration
export interface OddsPulseData {
  timestamp: string;
  source: string;
  track_id: string;
  race_number: number;
  odds_data: HorseOdds[];
  [key: string]: any; // Add index signature to make compatible with Json type
}

export interface HorseOdds {
  horse_id: string;
  horse_name: string;
  program_number: string;
  morning_line?: number;
  current_odds: number;
  odds_history?: OddsHistoryEntry[];
  [key: string]: any; // Add index signature to make compatible with Json type
}

export interface OddsHistoryEntry {
  timestamp: string;
  odds: number;
  [key: string]: any; // Add index signature to make compatible with Json type
}
