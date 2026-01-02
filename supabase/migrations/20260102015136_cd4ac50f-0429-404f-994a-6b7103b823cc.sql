-- Visual Assessments table for CV/VLM Risk Agent scores
CREATE TABLE public.visual_assessments (
  assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id VARCHAR REFERENCES horses(horse_id),
  race_id VARCHAR,
  entry_id VARCHAR,
  
  -- Core CV Scores (0-100 scale)
  lameness_risk INTEGER CHECK (lameness_risk BETWEEN 0 AND 100),
  gait_symmetry INTEGER CHECK (gait_symmetry BETWEEN 0 AND 100),
  warmup_intensity INTEGER CHECK (warmup_intensity BETWEEN 0 AND 100),
  nervousness_score INTEGER CHECK (nervousness_score BETWEEN 0 AND 100),
  eagerness_score INTEGER CHECK (eagerness_score BETWEEN 0 AND 100),
  
  -- Composite Risk Score
  overall_risk_score INTEGER CHECK (overall_risk_score BETWEEN 0 AND 100),
  risk_tier VARCHAR CHECK (risk_tier IN ('LOW', 'MODERATE', 'ELEVATED', 'HIGH')),
  
  -- Behavioral Indicators
  head_position VARCHAR,
  ear_position VARCHAR,
  stride_frequency DECIMAL,
  stride_length DECIMAL,
  
  -- Context
  assessment_type VARCHAR DEFAULT 'paddock',
  video_source_url TEXT,
  video_timestamp TIMESTAMPTZ,
  
  -- AI Analysis
  model_used VARCHAR DEFAULT 'gemini-2.5-pro',
  raw_analysis JSONB,
  confidence_score DECIMAL,
  
  -- Flags
  is_return_from_layoff BOOLEAN DEFAULT FALSE,
  is_class_drop BOOLEAN DEFAULT FALSE,
  previous_injury_flag BOOLEAN DEFAULT FALSE,
  
  -- Red flags detected
  red_flags JSONB,
  analysis_notes TEXT,
  
  -- Timestamps
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Visual Assessment History for next-out tracking
CREATE TABLE public.visual_assessment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id VARCHAR NOT NULL,
  assessments JSONB,
  trend_direction VARCHAR,
  avg_lameness_risk DECIMAL,
  avg_gait_symmetry DECIMAL,
  total_assessments INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.visual_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_assessment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visual_assessments
CREATE POLICY "Anyone can view visual assessments"
  ON public.visual_assessments
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage visual assessments"
  ON public.visual_assessments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for visual_assessment_history
CREATE POLICY "Anyone can view visual assessment history"
  ON public.visual_assessment_history
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage visual assessment history"
  ON public.visual_assessment_history
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_visual_assessments_horse ON public.visual_assessments(horse_id);
CREATE INDEX idx_visual_assessments_race ON public.visual_assessments(race_id);
CREATE INDEX idx_visual_assessments_risk ON public.visual_assessments(risk_tier);
CREATE INDEX idx_visual_assessment_history_horse ON public.visual_assessment_history(horse_id);