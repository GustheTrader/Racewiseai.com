export interface ScrapeJob {
  id: string;
  url: string;
  track_name: string;
  job_type: "odds" | "will_pays" | "results" | "entries";
  status: "pending" | "running" | "completed" | "failed";
  last_run_at: string | null;
  next_run_at: string;
  interval_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface OddsData {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  horse_number: number;
  horse_name: string;
  win_odds: string;
  pool_data: any;
  scraped_at: string;
}

export interface ExoticWillPay {
  id: string;
  track_name: string;
  race_number: number;
  race_date: string;
  wager_type: string;
  combination: string;
  payout: number | null;
  is_carryover: boolean;
  carryover_amount: number | null;
  scraped_at: string;
}

export interface ScraperStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  oddsRecords: number;
  willPaysRecords: number;
  resultsRecords: number;
  lastExecutionTime: string | null;
}

export interface TrackOption {
  value: string;
  label: string;
}

export const JOB_TYPE_OPTIONS = [
  { value: "odds", label: "Race Odds" },
  { value: "will_pays", label: "Exotic Will Pays" },
  { value: "results", label: "Race Results" },
  { value: "entries", label: "Morning Entries" }
];

export const INTERVAL_OPTIONS = [
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" }
];

export const TRACK_OPTIONS: TrackOption[] = [
  { value: "AQUEDUCT", label: "Aqueduct" },
  { value: "BELMONT PARK", label: "Belmont Park" },
  { value: "CHURCHILL DOWNS", label: "Churchill Downs" },
  { value: "DEL MAR", label: "Del Mar" },
  { value: "GULFSTREAM", label: "Gulfstream Park" },
  { value: "KEENELAND", label: "Keeneland" },
  { value: "KENTUCKY DOWNS", label: "Kentucky Downs" },
  { value: "LOS ALAMITOS-DAY", label: "Los Alamitos (Day)" },
  { value: "LOS ALAMITOS-NIGHT", label: "Los Alamitos (Night)" },
  { value: "NZ-HAWERA", label: "NZ-Hawera (TB)" },
  { value: "OAKLAWN PARK", label: "Oaklawn Park" },
  { value: "PIMLICO", label: "Pimlico" },
  { value: "SANTA ANITA", label: "Santa Anita" },
  { value: "SARATOGA", label: "Saratoga" }
];

// Status color configuration
export const STATUS_COLORS = {
  pending: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500",
    dot: "bg-yellow-500"
  },
  running: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500",
    dot: "bg-blue-500"
  },
  completed: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500",
    dot: "bg-green-500"
  },
  failed: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500",
    dot: "bg-red-500"
  },
  inactive: {
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    border: "border-gray-500",
    dot: "bg-gray-500"
  }
};
