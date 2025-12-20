export interface ScraperConfig {
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseKey: string;
  adminEmails: string[];
  serverPort: number;
  morningScrapTime: string; // HH:MM format
  racingScrapStartTime: string; // HH:MM format
  racingScrapEndTime: string; // HH:MM format
  racingScrapInterval: number; // seconds
}

export interface Horse {
  number: number;
  name: string;
  odds?: string;
  morningLine?: string;
  postPosition?: number;
  jockey?: string;
  trainer?: string;
}

export interface WillPay {
  wagerType: string; // Win, Place, Show, Exacta, Trifecta, etc.
  combination: string;
  payout: number;
  isCarryover?: boolean;
  carryoverAmount?: number;
}

export interface RaceData {
  trackName: string;
  raceNumber: number;
  raceTime: string;
  conditions: string;
  distance: string;
  purse?: string;
  horses: Horse[];
  willPays: WillPay[];
  poolData?: any;
  scraped_at: string;
}

export interface ScraperResult {
  success: boolean;
  data?: RaceData;
  error?: string;
  timestamp: string;
}

export interface CronJobConfig {
  jobId: string;
  trackName: string;
  jobType: "morning" | "racing";
  schedule: string; // cron expression
  isActive: boolean;
}
