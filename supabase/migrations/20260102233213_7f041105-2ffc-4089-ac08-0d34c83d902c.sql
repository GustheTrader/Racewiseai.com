-- Create model_reports table to store parsed racing model data
CREATE TABLE public.model_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_type TEXT NOT NULL CHECK (model_type IN ('twinspires', 'trd', 'ord')),
  track_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  race_number INTEGER NOT NULL,
  report_data JSONB NOT NULL,
  ensemble_scores JSONB,
  track_bias JSONB,
  bris_analysis TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(model_type, track_name, race_date, race_number)
);

-- Enable RLS
ALTER TABLE public.model_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can view model reports
CREATE POLICY "Anyone can view model reports"
ON public.model_reports
FOR SELECT
USING (true);

-- Authenticated users can insert reports
CREATE POLICY "Authenticated users can insert model reports"
ON public.model_reports
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own reports
CREATE POLICY "Users can update their own reports"
ON public.model_reports
FOR UPDATE
USING (auth.uid() = created_by);

-- Admins can manage all reports
CREATE POLICY "Admins can manage all model reports"
ON public.model_reports
FOR ALL
USING (public.is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_model_reports_updated_at
BEFORE UPDATE ON public.model_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for model_reports
ALTER TABLE public.model_reports REPLICA IDENTITY FULL;

-- Add to realtime publication (create if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.model_reports;