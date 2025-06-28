
-- Fix search path issues in database functions

-- Update the is_admin function to set search_path explicitly
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$function$;

-- Update the handle_new_user function to set search_path explicitly
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$function$;

-- Update the update_scrape_job_next_run function to set search_path explicitly
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
