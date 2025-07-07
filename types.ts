// Define all type interfaces
export interface Horse {
  id: number;
  pp: number;
  name: string;
  isFavorite?: boolean;
  liveOdds: number;
  mlOdds?: number;
  modelOdds: number;
  qModelWinPct?: number;
  qModelScore?: number; // New field for QModel Score (1-100)
  difference: number;
  jockey?: string;
  trainer?: string;
  jockeyWinPct?: number;
  trainerWinPct?: number;
  fireNumber?: number;
  irregularBetting?: boolean;
  isDisqualified?: boolean;
  hFactors?: {
    speed?: boolean;
    pace?: boolean;
    form?: boolean;
    class?: boolean;
  };
  handicappingFactor?: number; // New field for HF values (15, 15a/15.5, 19, 20)
}

export interface PoolData {
  number: number;
  odds: string;
  win: number;
  place: number;
  show: number;
}

export interface ExoticPool {
  name: string;
  amount: number;
}

export interface PaceData {
  name: string;
  early: number;
  middle: number;
  late: number;
}

export interface SharpMove {
  horse: string;
  timestamp: string;
  amount: number;
  oldOdds: string;
  newOdds: string;
  direction: 'up' | 'down';
}

export interface BettingDataPoint {
  time: string;
  volume: number;
  timestamp: number;
  isSpike?: boolean;
  runner1?: number;
  runner2?: number;
  runner3?: number;
  runner4?: number;
  runner5?: number;
  runner6?: number;
  runner1Odds?: number;
  runner2Odds?: number;
  runner3Odds?: number;
  runner4Odds?: number;
  runner5Odds?: number;
  runner6Odds?: number;
}

export interface TrainingFigure {
  horse: string;
  date: string;
  figure: number;
  track: string;
  distance: string;
  improvement: number;
}

// Keeping the original interface for backward compatibility 
// and adding an alias for semantic consistency
export type WorkoutFigure = TrainingFigure;

export interface TrackStatistics {
  totalRaces: number;
  frontRunnerWin: number;
  pressersWin: number;
  midPackWin: number;
  closersWin: number;
  frontRunnerPercentage: number;
  pressersPercentage: number;
  midPackPercentage: number;
  closersPercentage: number;
}

export interface PostPosition {
  position: number;
  count: number;
  percentage: number;
}

export interface TrackTiming {
  distance: string;
  bestTime: string;
  averageTime: string;
}

export interface HorseComment {
  name: string;
  comment: string;
}

// New interfaces for paddock comments and AI-Thorian
export interface PaddockComment {
  timestamp: string;
  horse: string;
  comment: string;
}

export interface ValuePick {
  race: number;
  pp: number;
  horse: string;
  odds: string;
  value: number;
  confidence: number;
}

export interface PickCombination {
  combination: string;
  races: string;
}

// Updated type for PDF extraction data to match our database schema
export interface PDFExtractionResult {
  success: boolean;
  data?: {
    raceId?: string;
    trackName: string;
    raceNumber: number;
    raceDate?: string;
    raceConditions?: string;
    horses: Array<{
      pp: number;
      name: string;
      jockey?: string;
      trainer?: string;
      mlOdds?: number;
    }>;
  };
  error?: string;
}

// Database types that match our Supabase schema
export interface RaceData {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  race_conditions?: string;
  created_at: string;
  updated_at: string;
}

export interface RaceHorse {
  id: string;
  race_id: string;
  pp: number;
  name: string;
  jockey?: string;
  trainer?: string;
  ml_odds?: number;
  created_at: string;
  updated_at: string;
}

// Add MockData interface to explicitly define the structure of our mock data
export interface MockData {
  horses: Horse[];
  poolData: PoolData[];
  exoticPools: ExoticPool[];
  paceData: PaceData[];
  sharpMovements: SharpMove[];
  bettingTimeline: BettingDataPoint[];
  trainingFigures: WorkoutFigure[];
  trackProfile: {
    statistics: TrackStatistics;
    postPositions: PostPosition[];
    timings: TrackTiming[];
  };
  horseComments: HorseComment[];
  paddockComments: PaddockComment[];
  valuePicks: ValuePick[];
  pick3Combos: PickCombination[];
  lastUpdated: string;
  // Add the missing properties
  trackName?: string;
  raceNumber?: number;
}
