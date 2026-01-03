-- Track configuration table for morning scraping
CREATE TABLE IF NOT EXISTS track_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  schedule_hour INTEGER DEFAULT 8,  -- 8 AM
  schedule_minute INTEGER DEFAULT 0,
  timezone TEXT DEFAULT 'America/Los_Angeles',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Morning report storage
CREATE TABLE IF NOT EXISTS morning_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  races_found INTEGER DEFAULT 0,
  horses_found INTEGER DEFAULT 0,
  raw_data JSONB,
  markdown_content TEXT,
  status TEXT DEFAULT 'success',  -- success, failed, partial
  error_message TEXT,
  firecrawl_request_id TEXT,
  scraped_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(track_name, race_date)
);

-- Firecrawl job tracking
CREATE TABLE IF NOT EXISTS firecrawl_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT UNIQUE,
  track_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  status TEXT,  -- queued, running, completed, failed
  result JSONB,
  error TEXT,
  requested_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE track_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE morning_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE firecrawl_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read track config"
  ON track_config FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read morning reports"
  ON morning_reports FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage track config"
  ON track_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage morning reports"
  ON morning_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage firecrawl jobs"
  ON firecrawl_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_morning_reports_track_date ON morning_reports(track_name, race_date);
CREATE INDEX idx_morning_reports_scraped_at ON morning_reports(scraped_at DESC);
CREATE INDEX idx_firecrawl_jobs_status ON firecrawl_jobs(status);
CREATE INDEX idx_firecrawl_jobs_track_date ON firecrawl_jobs(track_name, race_date);

-- Populate default track configurations
INSERT INTO track_config (track_name, is_enabled, schedule_hour, schedule_minute, timezone) VALUES
  ('churchill-downs', true, 8, 0, 'America/Chicago'),
  ('belmont-park', true, 8, 0, 'America/New_York'),
  ('aqueduct', true, 8, 0, 'America/New_York'),
  ('gulfstream', true, 8, 0, 'America/New_York'),
  ('del-mar', true, 8, 0, 'America/Los_Angeles'),
  ('keeneland', true, 8, 0, 'America/Kentucky'),
  ('kentucky-downs', true, 8, 0, 'America/Kentucky'),
  ('oaklawn-park', true, 8, 0, 'America/Chicago'),
  ('pimlico', true, 8, 0, 'America/New_York'),
  ('los-alamitos-day', true, 8, 0, 'America/Los_Angeles'),
  ('los-alamitos-night', true, 8, 0, 'America/Los_Angeles'),
  ('saratoga', true, 8, 0, 'America/New_York'),
  ('santa-anita', true, 8, 0, 'America/Los_Angeles')
ON CONFLICT (track_name) DO NOTHING;
