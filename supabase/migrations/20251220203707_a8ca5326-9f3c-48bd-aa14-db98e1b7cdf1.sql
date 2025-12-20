-- =============================================
-- COMPREHENSIVE RLS SECURITY MIGRATION
-- =============================================

-- 1. Create app_role enum for user roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_roles table (separate from profiles for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Update is_admin function to use the new roles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 5. RLS policies for user_roles table
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- ENABLE RLS ON ALL TABLES WITHOUT IT
-- =============================================

-- Reference/lookup tables (public read, admin write)
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jockeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speed_figures ENABLE ROW LEVEL SECURITY;

-- Analysis/prediction tables (public read, admin write)
ALTER TABLE public.horse_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmic_bombs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_analyses ENABLE ROW LEVEL SECURITY;

-- Odds/betting data tables (public read, admin write)
ALTER TABLE public.odds_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odds_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betting_pools ENABLE ROW LEVEL SECURITY;

-- System tables (admin only)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OddsPulse" ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE RLS POLICIES FOR ALL TABLES
-- =============================================

-- TRACKS (public read, admin write)
CREATE POLICY "Anyone can view tracks" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Admins can manage tracks" ON public.tracks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- HORSES (public read, admin write)
CREATE POLICY "Anyone can view horses" ON public.horses FOR SELECT USING (true);
CREATE POLICY "Admins can manage horses" ON public.horses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- JOCKEYS (public read, admin write)
CREATE POLICY "Anyone can view jockeys" ON public.jockeys FOR SELECT USING (true);
CREATE POLICY "Admins can manage jockeys" ON public.jockeys FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- TRAINERS (public read, admin write)
CREATE POLICY "Anyone can view trainers" ON public.trainers FOR SELECT USING (true);
CREATE POLICY "Admins can manage trainers" ON public.trainers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RACES (public read, admin write)
CREATE POLICY "Anyone can view races" ON public.races FOR SELECT USING (true);
CREATE POLICY "Admins can manage races" ON public.races FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RACE_ENTRIES (public read, admin write)
CREATE POLICY "Anyone can view race entries" ON public.race_entries FOR SELECT USING (true);
CREATE POLICY "Admins can manage race entries" ON public.race_entries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PAST_PERFORMANCES (public read, admin write)
CREATE POLICY "Anyone can view past performances" ON public.past_performances FOR SELECT USING (true);
CREATE POLICY "Admins can manage past performances" ON public.past_performances FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- SPEED_FIGURES (public read, admin write)
CREATE POLICY "Anyone can view speed figures" ON public.speed_figures FOR SELECT USING (true);
CREATE POLICY "Admins can manage speed figures" ON public.speed_figures FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- HORSE_RATINGS (public read, admin write)
CREATE POLICY "Anyone can view horse ratings" ON public.horse_ratings FOR SELECT USING (true);
CREATE POLICY "Admins can manage horse ratings" ON public.horse_ratings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- MODEL_PREDICTIONS (public read, admin write)
CREATE POLICY "Anyone can view model predictions" ON public.model_predictions FOR SELECT USING (true);
CREATE POLICY "Admins can manage model predictions" ON public.model_predictions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- VALUE_BETS (public read, admin write)
CREATE POLICY "Anyone can view value bets" ON public.value_bets FOR SELECT USING (true);
CREATE POLICY "Admins can manage value bets" ON public.value_bets FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- COSMIC_BOMBS (public read, admin write)
CREATE POLICY "Anyone can view cosmic bombs" ON public.cosmic_bombs FOR SELECT USING (true);
CREATE POLICY "Admins can manage cosmic bombs" ON public.cosmic_bombs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- AGENT_ANALYSES (public read, admin write)
CREATE POLICY "Anyone can view agent analyses" ON public.agent_analyses FOR SELECT USING (true);
CREATE POLICY "Admins can manage agent analyses" ON public.agent_analyses FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ODDS_HISTORY (authenticated read, admin write)
CREATE POLICY "Authenticated users can view odds history" ON public.odds_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage odds history" ON public.odds_history FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ODDS_CHANGES (authenticated read, admin write)
CREATE POLICY "Authenticated users can view odds changes" ON public.odds_changes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage odds changes" ON public.odds_changes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- BETTING_POOLS (authenticated read, admin write)
CREATE POLICY "Authenticated users can view betting pools" ON public.betting_pools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage betting pools" ON public.betting_pools FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- SYSTEM_LOGS (admin only)
CREATE POLICY "Admins can view system logs" ON public.system_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage system logs" ON public.system_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- WORKFLOW_EXECUTIONS (admin only)
CREATE POLICY "Admins can view workflow executions" ON public.workflow_executions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage workflow executions" ON public.workflow_executions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RAG_DOCUMENTS (admin only)
CREATE POLICY "Admins can view rag documents" ON public.rag_documents FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage rag documents" ON public.rag_documents FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ODDSPULSE (admin only)
CREATE POLICY "Admins can view OddsPulse" ON public."OddsPulse" FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage OddsPulse" ON public."OddsPulse" FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FIX PROFILES TABLE - Add INSERT policy
-- =============================================
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- FIX STATPAL_HORSES - Add missing policies
-- =============================================
CREATE POLICY "Users can insert own horses"
  ON public.statpal_horses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own horses"
  ON public.statpal_horses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own horses"
  ON public.statpal_horses FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- UPDATE HANDLE_NEW_USER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Recreate trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FIX UPDATE_UPDATED_AT_COLUMN FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;