
-- Fix 1: Drop the public profiles_public view (exposes emails)
DROP VIEW IF EXISTS public.profiles_public;

-- Fix 2: Revoke SELECT on the raw api_key column so it can never be read back to clients.
-- Writes (INSERT/UPDATE) still work; reads must go through api_connections_safe (masked).
REVOKE SELECT (api_key) ON public.api_connections FROM anon, authenticated, PUBLIC;
GRANT SELECT (id, user_id, api_url, is_test_mode, created_at, updated_at) ON public.api_connections TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.api_connections TO authenticated;
GRANT ALL ON public.api_connections TO service_role;

-- Ensure the safe view stays reachable
GRANT SELECT ON public.api_connections_safe TO authenticated;

-- Fix 3: Tighten statpal_horses SELECT policy to require an authenticated user_id match.
DROP POLICY IF EXISTS select_own_horses ON public.statpal_horses;
DROP POLICY IF EXISTS "Users can insert own horses" ON public.statpal_horses;
DROP POLICY IF EXISTS "Users can update own horses" ON public.statpal_horses;
DROP POLICY IF EXISTS "Users can delete own horses" ON public.statpal_horses;

CREATE POLICY "Users can view own horses"
  ON public.statpal_horses FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can insert own horses"
  ON public.statpal_horses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update own horses"
  ON public.statpal_horses FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete own horses"
  ON public.statpal_horses FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
