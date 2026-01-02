-- Create admin_reports table for morning report logging
-- Used by the morning-report edge function to store daily reports

CREATE TABLE IF NOT EXISTS public.admin_reports (
  id BIGSERIAL PRIMARY KEY,
  report_type VARCHAR(50) NOT NULL DEFAULT 'morning_report',
  report_date DATE NOT NULL,
  content TEXT NOT NULL,
  tracks_running TEXT[] DEFAULT ARRAY[]::TEXT[],
  jobs_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for quick lookups by date and type
CREATE INDEX IF NOT EXISTS idx_admin_reports_date_type
ON public.admin_reports(report_date DESC, report_type);

-- Enable RLS
ALTER TABLE public.admin_reports ENABLE ROW LEVEL SECURITY;

-- Create policy: Admin users can view all reports
CREATE POLICY "admin_view_reports" ON public.admin_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create policy: System can insert reports
CREATE POLICY "system_insert_reports" ON public.admin_reports
  FOR INSERT
  WITH CHECK (true);  -- Allow system/edge function to insert

-- Grant permissions
GRANT SELECT ON public.admin_reports TO authenticated;
GRANT INSERT ON public.admin_reports TO authenticated;
