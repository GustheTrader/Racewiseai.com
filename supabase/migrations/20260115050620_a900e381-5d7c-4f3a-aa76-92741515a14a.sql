-- Enable REPLICA IDENTITY FULL for realtime tables
ALTER TABLE public.odds_data REPLICA IDENTITY FULL;
ALTER TABLE public.morning_reports REPLICA IDENTITY FULL;
ALTER TABLE public.race_data REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication (only ones not already added)
DO $$
BEGIN
    -- Check and add odds_data
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'odds_data') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.odds_data;
    END IF;
    
    -- Check and add morning_reports
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'morning_reports') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.morning_reports;
    END IF;
    
    -- Check and add race_data
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'race_data') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.race_data;
    END IF;
END $$;

-- Add job_mode column to scrape_jobs if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'scrape_jobs' 
                   AND column_name = 'job_mode') THEN
        ALTER TABLE public.scrape_jobs ADD COLUMN job_mode text DEFAULT 'live';
    END IF;
END $$;

-- Add scheduled_time column for morning reports
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'scrape_jobs' 
                   AND column_name = 'scheduled_time') THEN
        ALTER TABLE public.scrape_jobs ADD COLUMN scheduled_time time DEFAULT '06:00:00';
    END IF;
END $$;

-- Add race window columns for live scraping windows
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'scrape_jobs' 
                   AND column_name = 'race_window_start') THEN
        ALTER TABLE public.scrape_jobs ADD COLUMN race_window_start time DEFAULT '11:00:00';
        ALTER TABLE public.scrape_jobs ADD COLUMN race_window_end time DEFAULT '18:00:00';
    END IF;
END $$;