
CREATE TABLE public.trained_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  epochs INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'idle',
  accuracy NUMERIC,
  log_loss NUMERIC,
  training_samples INTEGER,
  weights JSONB,
  notes TEXT,
  error TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trained_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trained_models TO authenticated;
GRANT ALL ON public.trained_models TO service_role;

ALTER TABLE public.trained_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all trained models"
  ON public.trained_models
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own trained models"
  ON public.trained_models
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users insert own trained models"
  ON public.trained_models
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users update own trained models"
  ON public.trained_models
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users delete own trained models"
  ON public.trained_models
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE TRIGGER trained_models_set_updated_at
  BEFORE UPDATE ON public.trained_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX trained_models_created_by_idx ON public.trained_models(created_by);
CREATE INDEX trained_models_status_idx ON public.trained_models(status);
