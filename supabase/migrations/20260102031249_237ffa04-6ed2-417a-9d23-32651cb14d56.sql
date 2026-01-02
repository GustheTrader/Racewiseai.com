-- Create table to store scrape schedule configuration
CREATE TABLE public.scrape_schedule_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_name text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  schedule_hour integer NOT NULL DEFAULT 6,
  schedule_minute integer NOT NULL DEFAULT 0,
  timezone text NOT NULL DEFAULT 'America/New_York',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(track_name)
);

-- Enable RLS
ALTER TABLE public.scrape_schedule_config ENABLE ROW LEVEL SECURITY;

-- Policies - admins can manage, everyone can view
CREATE POLICY "Admins can manage scrape config"
ON public.scrape_schedule_config
FOR ALL
USING (public.is_admin());

CREATE POLICY "Anyone can view scrape config"
ON public.scrape_schedule_config
FOR SELECT
USING (true);

-- Insert default tracks
INSERT INTO public.scrape_schedule_config (track_name, is_enabled) VALUES
  ('Santa Anita Park', true),
  ('Gulfstream Park', true),
  ('Churchill Downs', true),
  ('Aqueduct', true),
  ('Del Mar', true),
  ('Oaklawn Park', true),
  ('Saratoga', false),
  ('Belmont Park', false),
  ('Keeneland', false),
  ('Los Alamitos', false);

-- Add trigger for updated_at
CREATE TRIGGER update_scrape_schedule_config_updated_at
BEFORE UPDATE ON public.scrape_schedule_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();