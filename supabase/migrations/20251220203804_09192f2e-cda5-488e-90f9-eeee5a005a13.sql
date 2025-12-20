-- Add missing RLS policies for statpal_results
-- This table contains race result data - should be readable by authenticated users who own the race
CREATE POLICY "Users can view results for their races"
  ON public.statpal_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.statpal_live_races 
      WHERE statpal_race_id = statpal_results.statpal_race_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all results"
  ON public.statpal_results FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));