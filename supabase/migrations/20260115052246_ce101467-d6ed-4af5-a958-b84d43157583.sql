-- First check if there are any NULL user_id records
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count FROM statpal_horses WHERE user_id IS NULL;
  IF null_count > 0 THEN
    RAISE NOTICE 'Found % records with NULL user_id - these will become inaccessible', null_count;
  END IF;
END $$;

-- Add NOT NULL constraint to user_id column in statpal_horses
-- This prevents data segregation issues and ensures all horses belong to a user
ALTER TABLE public.statpal_horses 
ALTER COLUMN user_id SET NOT NULL;