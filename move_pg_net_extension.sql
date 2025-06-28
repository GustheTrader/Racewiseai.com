
-- Create a dedicated schema for extensions if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on the extensions schema to public
GRANT USAGE ON SCHEMA extensions TO public;

-- Check if pg_net is installed in public schema and move it if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'pg_net'
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER EXTENSION pg_net SET SCHEMA extensions;
    RAISE NOTICE 'Moved pg_net extension to extensions schema';
  END IF;
END
$$;

-- Ensure public can use the pg_net functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO public;
