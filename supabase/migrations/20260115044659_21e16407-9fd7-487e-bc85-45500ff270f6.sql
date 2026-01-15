-- Fix search_path for broadcast functions
CREATE OR REPLACE FUNCTION public.broadcast_odds_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  PERFORM realtime.broadcast_changes(
    'odds_changes:' || COALESCE(NEW.id, OLD.id)::text || ':changes',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.broadcast_odds_history_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  PERFORM realtime.broadcast_changes(
    'odds_history:' || COALESCE(NEW.id, OLD.id)::text || ':changes',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.broadcast_races_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  PERFORM realtime.broadcast_changes(
    'races:' || COALESCE(NEW.race_id, OLD.race_id)::text || ':changes',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.broadcast_table_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  PERFORM realtime.broadcast_changes(
    TG_TABLE_NAME || ':' || COALESCE(NEW.*::text, OLD.*::text),
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.odds_changes_broadcast_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM realtime.broadcast_changes(
      'odds_changes:' || COALESCE(NEW.race_id, OLD.race_id)::text || ':changes',
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM realtime.broadcast_changes(
      'odds_changes:' || COALESCE(NEW.race_id, OLD.race_id)::text || ':changes',
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );
  ELSE
    IF (OLD.price IS DISTINCT FROM NEW.price)
       OR (OLD.market IS DISTINCT FROM NEW.market)
       OR (OLD.updated_at IS DISTINCT FROM NEW.updated_at)
    THEN
      PERFORM realtime.broadcast_changes(
        'odds_changes:' || COALESCE(NEW.race_id, OLD.race_id)::text || ':changes',
        TG_OP,
        TG_OP,
        TG_TABLE_NAME,
        TG_TABLE_SCHEMA,
        NEW,
        OLD
      );
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.race_horses_broadcast_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM realtime.broadcast_changes(
      'race_horses:' || COALESCE(NEW.race_id, OLD.race_id)::text || ':changes',
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM realtime.broadcast_changes(
      'race_horses:' || COALESCE(NEW.race_id, OLD.race_id)::text || ':changes',
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );
  ELSE
    IF (OLD.pp IS DISTINCT FROM NEW.pp)
       OR (OLD.ml_odds IS DISTINCT FROM NEW.ml_odds)
       OR (OLD.updated_at IS DISTINCT FROM NEW.updated_at)
    THEN
      PERFORM realtime.broadcast_changes(
        'race_horses:' || COALESCE(NEW.race_id, OLD.race_id)::text || ':changes',
        TG_OP,
        TG_OP,
        TG_TABLE_NAME,
        TG_TABLE_SCHEMA,
        NEW,
        OLD
      );
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.races_broadcast_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM realtime.broadcast_changes(
      'races:' || COALESCE(NEW.race_id, OLD.race_id)::text || ':changes',
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM realtime.broadcast_changes(
      'races:' || COALESCE(NEW.race_id, OLD.race_id)::text || ':changes',
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );
  ELSE
    IF (OLD.race_status IS DISTINCT FROM NEW.race_status)
       OR (OLD.updated_at IS DISTINCT FROM NEW.updated_at)
       OR (OLD.post_time IS DISTINCT FROM NEW.post_time)
    THEN
      PERFORM realtime.broadcast_changes(
        'races:' || COALESCE(NEW.race_id, OLD.race_id)::text || ':changes',
        TG_OP,
        TG_OP,
        TG_TABLE_NAME,
        TG_TABLE_SCHEMA,
        NEW,
        OLD
      );
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix update_scrape_job_next_run to use proper search_path
CREATE OR REPLACE FUNCTION public.update_scrape_job_next_run()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.next_run_at = NOW() + (NEW.interval_seconds || ' seconds')::interval;
    RETURN NEW;
END;
$function$;

-- Fix overly permissive RLS policy on statpal_live_races
-- First drop the overly permissive policy
DROP POLICY IF EXISTS "Allow authenticated users to insert race records" ON public.statpal_live_races;

-- Create a proper policy that checks user_id
CREATE POLICY "Allow authenticated users to insert their own race records" 
ON public.statpal_live_races 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add admin check to get_cron_job_info function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_cron_job_info') THEN
    EXECUTE $exec$
      CREATE OR REPLACE FUNCTION public.get_cron_job_info(job_name text)
      RETURNS TABLE (
        jobid bigint,
        schedule text,
        command text,
        nodename text,
        nodeport integer,
        database text,
        username text,
        active boolean,
        jobname text
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $func$
      BEGIN
        -- Require admin role
        IF NOT EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid() AND role = 'admin'
        ) THEN
          RAISE EXCEPTION 'Access denied: admin role required';
        END IF;
        
        RETURN QUERY
        SELECT j.jobid, j.schedule, j.command, j.nodename, j.nodeport, 
               j.database, j.username, j.active, j.jobname
        FROM cron.job j WHERE j.jobname = job_name;
      END;
      $func$;
    $exec$;
  END IF;
END $$;