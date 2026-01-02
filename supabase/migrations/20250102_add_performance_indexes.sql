-- Supabase Migration: Add Performance Indexes
-- This migration addresses MEDIUM severity performance issues by adding missing indexes

-- ============================================================================
-- SCRAPING & RACE DATA INDEXES
-- ============================================================================

-- Optimize scrape_jobs scheduling queries (CRITICAL for background jobs)
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_schedule
ON public.scrape_jobs(is_active, next_run_at);

CREATE INDEX IF NOT EXISTS idx_scrape_jobs_track_status
ON public.scrape_jobs(track_name, status);

-- Optimize race_cards lookups
CREATE INDEX IF NOT EXISTS idx_race_cards_track_date
ON public.race_cards(track_name, race_date);

CREATE INDEX IF NOT EXISTS idx_race_cards_date
ON public.race_cards(race_date);

-- Optimize horses lookups
CREATE INDEX IF NOT EXISTS idx_horses_race_card
ON public.horses(race_card_id);

-- Optimize odds_data lookups (frequently queried for live odds)
CREATE INDEX IF NOT EXISTS idx_odds_data_track_race
ON public.odds_data(track_name, race_number, race_date);

CREATE INDEX IF NOT EXISTS idx_odds_data_date
ON public.odds_data(race_date);

-- Optimize exotic_will_pays lookups
CREATE INDEX IF NOT EXISTS idx_exotic_will_pays_track_race
ON public.exotic_will_pays(track_name, race_number, race_date);

-- Optimize race_results lookups
CREATE INDEX IF NOT EXISTS idx_race_results_track_date
ON public.race_results(track_name, race_date);

CREATE INDEX IF NOT EXISTS idx_race_results_date
ON public.race_results(race_date);

-- ============================================================================
-- USER & ACCESS CONTROL INDEXES
-- ============================================================================

-- Optimize user_roles lookups for RLS policies
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
ON public.user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_role
ON public.user_roles(user_id, role);

-- Optimize profiles lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON public.profiles(email);

-- ============================================================================
-- STATPAL INDEXES (if statpal tables exist)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_statpal_horses_user_id
ON public.statpal_horses(user_id);

CREATE INDEX IF NOT EXISTS idx_statpal_live_races_user_id
ON public.statpal_live_races(user_id);

CREATE INDEX IF NOT EXISTS idx_statpal_results_user_id
ON public.statpal_results(user_id);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Optimize filtered queries with multiple conditions
CREATE INDEX IF NOT EXISTS idx_odds_data_horse_lookup
ON public.odds_data(track_name, race_number, race_date, horse_number);

CREATE INDEX IF NOT EXISTS idx_race_cards_horse_lookup
ON public.race_cards(track_name, race_date, race_number);

-- ============================================================================
-- UNIQUE CONSTRAINTS (if not already exists)
-- ============================================================================

-- Ensure no duplicate race results
ALTER TABLE public.race_results
ADD CONSTRAINT unique_race_result UNIQUE (track_name, race_number, race_date)
ON CONFLICT DO NOTHING;

-- Ensure no duplicate race cards
ALTER TABLE public.race_cards
ADD CONSTRAINT unique_race_card UNIQUE (track_name, race_date, race_number)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ANALYZE TABLE STATS (for query planner optimization)
-- ============================================================================

ANALYZE public.scrape_jobs;
ANALYZE public.race_cards;
ANALYZE public.horses;
ANALYZE public.odds_data;
ANALYZE public.exotic_will_pays;
ANALYZE public.race_results;
ANALYZE public.user_roles;
ANALYZE public.profiles;
