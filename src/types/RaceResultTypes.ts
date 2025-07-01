export interface RaceResult {
  position: number;
  horse_name: string;
  jockey_name?: string;
  trainer_name?: string;
  starting_price?: number;
  distance_behind?: string;
  time_taken?: string;
}

export interface ExoticResult {
  wager_type: string;
  combination: string;
  payout: number;
  pool_total?: number;
}

export interface RaceResultData {
  race_number: number;
  track_name: string;
  race_date: string;
  race_time?: string;
  distance?: string;
  race_class?: string;
  surface?: string;
  weather?: string;
  track_condition?: string;
  winners: RaceResult[];
  exotic_payouts?: ExoticResult[];
  scratches?: string[];
  late_changes?: string[];
}

export interface ProcessedRaceResult {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  results_data: RaceResultData;
  source_url?: string;
  created_at: string;
}