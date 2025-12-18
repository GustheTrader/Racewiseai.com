-- Race data table for storing scraped information
CREATE TABLE IF NOT EXISTS race_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  race_number INTEGER NOT NULL,
  race_time TIME,
  post_time TIME,
  race_type TEXT,
  distance TEXT,
  surface TEXT,
  conditions TEXT,
  purse TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  source_url TEXT,
  scraped_at TIMESTAMP DEFAULT now(),
  UNIQUE(track_name, race_date, race_number)
);

-- Horses table for storing horse information
CREATE TABLE IF NOT EXISTS horses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  race_card_id UUID NOT NULL REFERENCES race_cards(id) ON DELETE CASCADE,
  program_number INTEGER NOT NULL,
  horse_name TEXT NOT NULL,
  jockey_name TEXT,
  trainer_name TEXT,
  post_position INTEGER,
  morning_line TEXT,
  win_odds DECIMAL(10, 2),
  place_odds DECIMAL(10, 2),
  show_odds DECIMAL(10, 2),
  weight INTEGER,
  age INTEGER,
  recent_form TEXT,
  last_race_date DATE,
  last_race_result TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Betting pools table
CREATE TABLE IF NOT EXISTS betting_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  race_card_id UUID NOT NULL REFERENCES race_cards(id) ON DELETE CASCADE,
  pool_type TEXT NOT NULL, -- WIN, PLACE, SHOW, EXACTA, TRIFECTA, etc.
  total_pool DECIMAL(15, 2),
  pool_count INTEGER,
  updated_at TIMESTAMP DEFAULT now(),
  captured_at TIMESTAMP DEFAULT now()
);

-- Scraper job logs table
CREATE TABLE IF NOT EXISTS scraper_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  status TEXT NOT NULL, -- PENDING, RUNNING, SUCCESS, FAILED
  races_scraped INTEGER,
  horses_scraped INTEGER,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  duration_ms INTEGER
);

-- Enable RLS (Row Level Security)
ALTER TABLE race_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can read race cards"
  ON race_cards FOR SELECT
  USING (true);

CREATE POLICY "Users can read horses"
  ON horses FOR SELECT
  USING (true);

CREATE POLICY "Users can read betting pools"
  ON betting_pools FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage scraper jobs"
  ON scraper_jobs FOR ALL
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- Create indexes for better query performance
CREATE INDEX idx_race_cards_track_date ON race_cards(track_name, race_date);
CREATE INDEX idx_race_cards_scraped_at ON race_cards(scraped_at);
CREATE INDEX idx_horses_race_card_id ON horses(race_card_id);
CREATE INDEX idx_betting_pools_race_card_id ON betting_pools(race_card_id);
CREATE INDEX idx_scraper_jobs_status ON scraper_jobs(status);
