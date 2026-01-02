-- Schedule morning scrape to run at 6 AM UTC daily
SELECT cron.schedule(
  'morning-scrape-6am',
  '0 6 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://bqvavkzgmznjfirgfyhd.supabase.co/functions/v1/scheduled-morning-scrape',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmF2a3pnbXpuamZpcmdmeWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE0NjMsImV4cCI6MjA2MTk1NzQ2M30.s6ZPJNjQpcNC6_CRUKA4g2yFJUEbxikQbApx1o_lLCs'
        ),
        body:='{"source": "cron", "scheduledTime": "6am"}'::jsonb
    ) as request_id;
  $$
);