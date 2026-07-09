
-- =========================================================
-- 1. profiles: privilege escalation + weak email policy
-- =========================================================
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Trigger blocks non-admins from touching is_admin
CREATE OR REPLACE FUNCTION public.prevent_is_admin_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can change is_admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_is_admin_self_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_is_admin_self_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_is_admin_self_escalation();

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =========================================================
-- 2. user_bets: remove anon bypass
-- =========================================================
DROP POLICY IF EXISTS "Users can view own bets" ON public.user_bets;
DROP POLICY IF EXISTS "Users can insert own bets" ON public.user_bets;

CREATE POLICY "Users can view own bets"
ON public.user_bets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bets"
ON public.user_bets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bets"
ON public.user_bets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bets"
ON public.user_bets FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

REVOKE ALL ON public.user_bets FROM anon;

-- =========================================================
-- 3. user_profiles: remove anon bypass
-- =========================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.user_profiles FROM anon;

-- =========================================================
-- 4. user_watchlists: remove anon bypass
-- =========================================================
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.user_watchlists;

CREATE POLICY "Users can manage own watchlist"
ON public.user_watchlists FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

REVOKE ALL ON public.user_watchlists FROM anon;

-- =========================================================
-- 5. scrape_jobs: restrict SELECT to owner/admin, INSERT to admin
-- =========================================================
DROP POLICY IF EXISTS "Allow authenticated users to read scrape jobs" ON public.scrape_jobs;
DROP POLICY IF EXISTS "Allow authenticated users to insert scrape jobs" ON public.scrape_jobs;

CREATE POLICY "Owners and admins can view scrape jobs"
ON public.scrape_jobs FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert scrape jobs"
ON public.scrape_jobs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = created_by);

REVOKE ALL ON public.scrape_jobs FROM anon;

-- =========================================================
-- 6. storage.objects — restrict private 'TRD' bucket to admins
-- =========================================================
DROP POLICY IF EXISTS "TRD bucket admin read" ON storage.objects;
DROP POLICY IF EXISTS "TRD bucket admin insert" ON storage.objects;
DROP POLICY IF EXISTS "TRD bucket admin update" ON storage.objects;
DROP POLICY IF EXISTS "TRD bucket admin delete" ON storage.objects;

CREATE POLICY "TRD bucket admin read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'TRD' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "TRD bucket admin insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'TRD' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "TRD bucket admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'TRD' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'TRD' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "TRD bucket admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'TRD' AND public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 7. Overly permissive "always true" policies
-- =========================================================
-- admin_reports: only admins/service_role may insert
DROP POLICY IF EXISTS "system_insert_reports" ON public.admin_reports;
CREATE POLICY "Admins can insert reports"
ON public.admin_reports FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- exotic_will_pays: authenticated role required
DROP POLICY IF EXISTS "Authenticated users can insert exotic payouts" ON public.exotic_will_pays;
CREATE POLICY "Authenticated users can insert exotic payouts"
ON public.exotic_will_pays FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- payoff_results: authenticated role required
DROP POLICY IF EXISTS "Authenticated users can manage payoff results" ON public.payoff_results;
CREATE POLICY "Authenticated users can manage payoff results"
ON public.payoff_results FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- race_data: service_role only
DROP POLICY IF EXISTS "Allow insert for service role only" ON public.race_data;
DROP POLICY IF EXISTS "Allow update for service role only" ON public.race_data;
CREATE POLICY "Allow insert for service role only"
ON public.race_data FOR INSERT
TO service_role
WITH CHECK (true);
CREATE POLICY "Allow update for service role only"
ON public.race_data FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- race_results: authenticated role required
DROP POLICY IF EXISTS "Authenticated users can insert race results" ON public.race_results;
DROP POLICY IF EXISTS "Authenticated users can update race results" ON public.race_results;
CREATE POLICY "Authenticated users can insert race results"
ON public.race_results FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update race results"
ON public.race_results FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- =========================================================
-- 8. Function search_path + SECURITY DEFINER execute privileges
-- =========================================================
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Revoke public/anon execute on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.broadcast_odds_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.broadcast_odds_history_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.broadcast_races_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.broadcast_table_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.odds_changes_broadcast_trigger() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.race_horses_broadcast_trigger() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.races_broadcast_trigger() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_scrape_job_next_run() FROM PUBLIC, anon, authenticated;

-- has_role / is_admin remain callable by authenticated (needed by app), but not by anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
