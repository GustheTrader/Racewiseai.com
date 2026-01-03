import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VisualAssessmentResult } from '@/types/VisualAssessmentTypes';
import { toast } from 'sonner';

interface AnalyzeOptions {
  horse_id?: string;
  race_id?: string;
  entry_id?: string;
  assessment_type?: 'paddock' | 'warmup' | 'post_parade';
  is_return_from_layoff?: boolean;
  is_class_drop?: boolean;
  previous_injury_flag?: boolean;
}

export function useVisualAssessment() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisualAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeFromUrl = async (videoUrl: string, options: AnalyzeOptions = {}) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-paddock-video', {
        body: {
          video_url: videoUrl,
          ...options
        }
      });

      if (fnError) throw fnError;
      
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      toast.success(`Analysis complete: ${data.risk_tier} risk`);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze video';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeFromBase64 = async (imageBase64: string, options: AnalyzeOptions = {}) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-paddock-video', {
        body: {
          image_base64: imageBase64,
          ...options
        }
      });

      if (fnError) throw fnError;
      
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      toast.success(`Analysis complete: ${data.risk_tier} risk`);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeFromFile = async (file: File, options: AnalyzeOptions = {}) => {
    return new Promise<VisualAssessmentResult | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const result = await analyzeFromBase64(base64, options);
        resolve(result);
      };
      reader.onerror = () => {
        setError('Failed to read file');
        toast.error('Failed to read file');
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    isAnalyzing,
    result,
    error,
    analyzeFromUrl,
    analyzeFromBase64,
    analyzeFromFile,
    clearResult
  };
}
