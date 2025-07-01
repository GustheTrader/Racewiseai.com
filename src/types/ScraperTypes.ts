export interface ScraperJob {
  id: string;
  track_name: string;
  job_type: 'odds' | 'will_pays' | 'results' | 'entries';
  url: string;
  interval_seconds: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  is_active: boolean;
  last_run_at?: string;
  next_run_at: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ScraperStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  lastUpdate?: string;
}