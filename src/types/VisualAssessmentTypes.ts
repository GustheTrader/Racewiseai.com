export interface VisualAssessmentScores {
  lameness_risk: number;
  gait_symmetry: number;
  warmup_intensity: number;
  nervousness_score: number;
  eagerness_score: number;
}

export interface VisualAssessmentBehavioral {
  head_position: 'normal' | 'high' | 'low' | 'favoring' | null;
  ear_position: 'alert' | 'pinned' | 'relaxed' | null;
  stride_frequency: number | null;
  stride_length: number | null;
}

export interface ModelAdjustmentSuggestion {
  adjustment: number;
  reason: string;
}

export interface VisualAssessmentResult {
  success: boolean;
  assessment_id?: string;
  scores: VisualAssessmentScores;
  overall_risk_score: number;
  risk_tier: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  behavioral: VisualAssessmentBehavioral;
  red_flags: string[];
  analysis_notes: string;
  confidence: number;
  model_adjustment_suggestion: ModelAdjustmentSuggestion;
}

export interface VisualAssessment {
  assessment_id: string;
  horse_id: string | null;
  race_id: string | null;
  entry_id: string | null;
  lameness_risk: number | null;
  gait_symmetry: number | null;
  warmup_intensity: number | null;
  nervousness_score: number | null;
  eagerness_score: number | null;
  overall_risk_score: number | null;
  risk_tier: string | null;
  head_position: string | null;
  ear_position: string | null;
  stride_frequency: number | null;
  stride_length: number | null;
  assessment_type: string;
  video_source_url: string | null;
  model_used: string;
  raw_analysis: any;
  confidence_score: number | null;
  is_return_from_layoff: boolean;
  is_class_drop: boolean;
  previous_injury_flag: boolean;
  red_flags: string[];
  analysis_notes: string | null;
  analyzed_at: string;
  created_at: string;
}

export interface VisualAssessmentHistory {
  id: string;
  horse_id: string;
  assessments: Array<{
    date: string;
    lameness_risk: number;
    gait_symmetry: number;
    overall_risk: number;
  }>;
  trend_direction: 'improving' | 'stable' | 'worsening' | null;
  avg_lameness_risk: number | null;
  avg_gait_symmetry: number | null;
  total_assessments: number;
  last_updated: string;
}

export type RiskTier = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';

export const riskTierColors: Record<RiskTier, string> = {
  LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
  MODERATE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ELEVATED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  HIGH: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export const riskTierLabels: Record<RiskTier, string> = {
  LOW: 'Low Risk',
  MODERATE: 'Moderate Risk',
  ELEVATED: 'Elevated Risk',
  HIGH: 'High Risk'
};
