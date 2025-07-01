export interface Horse {
  id: string | number;
  name: string;
  number: number;
  pp?: number;
  jockey?: string;
  trainer?: string;
  ml_odds?: number;
  weight?: number;
  age?: number;
  sex?: string;
  color?: string;
  sire?: string;
  dam?: string;
  owner?: string;
  breeder?: string;
  earnings?: number;
  wins?: number;
  places?: number;
  shows?: number;
  starts?: number;
  // Model specific properties
  liveOdds?: number;
  modelOdds?: number;
  qModelScore?: number;
  qModelWinPct?: number;
  fireNumber?: number;
  difference?: number;
  isFavorite?: boolean;
  handicappingFactor?: number;
  irregularBetting?: boolean;
  isDisqualified?: boolean;
  hFactors?: any;
}

export interface Race {
  id: string;
  number: number;
  track_name: string;
  race_date: string;
  post_time?: string;
  distance?: string;
  surface?: 'dirt' | 'turf' | 'synthetic';
  race_type?: string;
  purse?: number;
  conditions?: string;
  horses: Horse[];
}

export interface Track {
  id: string;
  name: string;
  abbreviation?: string;
  location?: string;
  timezone?: string;
  surface_types?: string[];
  active?: boolean;
}

export interface PaceData {
  name?: string;
  fractional_times?: number[];
  final_time?: number;
  speed_figures?: number[];
  pace_rating?: number;
}

export interface BettingData {
  win_odds?: number;
  place_odds?: number;
  show_odds?: number;
  exacta_odds?: number;
  trifecta_odds?: number;
  superfecta_odds?: number;
  daily_double_odds?: number;
  pick3_odds?: number;
  pick4_odds?: number;
  pick6_odds?: number;
}

export interface BettingDataPoint {
  timestamp: number;
  odds: number;
  pool: number;
  track_name: string;
  race_number: number;
  horse_number: number;
}

export interface HorseFormData {
  recent_races?: any[];
  speed_figures?: number[];
  class_ratings?: number[];
  trainer_stats?: any;
  jockey_stats?: any;
  workout_data?: any[];
}

// Additional missing interfaces
export interface ValuePick {
  horse_number: number;
  horse_name: string;
  value_rating: number;
  confidence: number;
  ai_analysis: string;
}

export interface PickCombination {
  combination: number[];
  confidence: number;
  payout_potential: number;
  description: string;
}

export interface HorseComment {
  id: string;
  horse_name: string;
  comment: string;
  timestamp: string;
  source: string;
}

export interface SharpMove {
  timestamp: string;
  horse_number: number;
  odds_movement: number;
  volume: number;
  significance: 'low' | 'medium' | 'high';
}

export interface PaddockComment {
  id: string;
  horse_name: string;
  comment: string;
  timestamp: string;
  reporter: string;
  category: string;
}

export interface PoolData {
  pool_type: string;
  total_amount: number;
  handle: number;
  combinations_sold: number;
}

export interface ExoticPool {
  wager_type: string;
  pool_total: number;
  winning_combinations: string[];
  payout: number;
  carryover?: number;
}

export interface TrackStatistics {
  track_name: string;
  surface: string;
  distance_stats: any[];
  bias_data: any;
  weather_impact: any;
}

export interface PostPosition {
  position: number;
  win_percentage: number;
  avg_odds: number;
  surface_preference: string;
}

export interface TrackTiming {
  post_time: string;
  estimated_finish: string;
  delay_factors: string[];
}

export interface WorkoutFigure {
  date: string;
  distance: string;
  time: string;
  track: string;
  surface: string;
  rating: number;
}

export interface MockData {
  horses: Horse[];
  races: Race[];
  tracks: Track[];
}