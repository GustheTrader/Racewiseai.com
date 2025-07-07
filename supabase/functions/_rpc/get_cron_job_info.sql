
-- Create an RPC function to get information about a specific cron job
CREATE OR REPLACE FUNCTION public.get_cron_job_info(job_name text)
RETURNS TABLE (
  jobid integer,
  jobname text,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean,
  last_run timestamp with time zone
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM cron.job WHERE jobname = job_name;
END;
$$
LANGUAGE plpgsql;
