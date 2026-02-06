-- Fix 1: Create a secure view for profiles that hides is_admin
-- The is_admin column is redundant since we have user_roles table

-- First, create a view that excludes is_admin
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT id, email, full_name, avatar_url, created_at, updated_at
  FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_public TO authenticated;

-- Fix 2: Create a secure view for api_connections that hides api_key
-- Users should only see that a connection exists, not the actual key
CREATE OR REPLACE VIEW public.api_connections_safe
WITH (security_invoker=on) AS
  SELECT id, user_id, api_url, is_test_mode, created_at, updated_at,
         CASE WHEN api_key IS NOT NULL THEN '***' ELSE NULL END as api_key_masked
  FROM public.api_connections;

-- Grant access to the view
GRANT SELECT ON public.api_connections_safe TO authenticated;