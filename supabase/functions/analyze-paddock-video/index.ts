import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYSIS_PROMPT = `You are an expert equine biomechanics analyst specializing in pre-race assessment for horse racing.

Analyze this paddock/warm-up video or image and provide structured scores for the horse's physical condition:

1. LAMENESS RISK (0-100): 
   - 0-20: No visible issues, sound movement
   - 21-40: Minor asymmetry, worth monitoring
   - 41-60: Noticeable gait irregularity  
   - 61-80: Clear lameness indicators
   - 81-100: Severe lameness, likely DNF risk

2. GAIT SYMMETRY (0-100):
   - Stride length consistency
   - Head bob pattern analysis
   - Hip/shoulder alignment
   - Landing pattern uniformity

3. WARMUP INTENSITY (0-100):
   - Energy level and eagerness
   - Muscle engagement visible
   - Responsiveness to handler

4. NERVOUSNESS SCORE (0-100):
   - Excessive sweating indicators
   - Erratic or jerky movement
   - Ear pinning frequency
   - Tail swishing frequency

5. EAGERNESS SCORE (0-100):
   - Pull against handler
   - Forward momentum
   - Alert demeanor and focus

Also assess:
- Head position: normal, high, low, or favoring one side
- Ear position: alert, pinned, or relaxed
- Estimated stride frequency if visible
- Any red flags: bandage changes, heavy sweating, reluctant loading, favoring a leg

Provide your analysis in a structured format for integration into a racing handicapping model.`;

const analysisTools = [{
  type: "function",
  function: {
    name: "record_visual_assessment",
    description: "Record the visual assessment scores for a horse based on paddock/warm-up analysis",
    parameters: {
      type: "object",
      properties: {
        lameness_risk: { 
          type: "integer", 
          description: "Lameness risk score from 0-100, where 0 is no risk and 100 is severe lameness" 
        },
        gait_symmetry: { 
          type: "integer", 
          description: "Gait symmetry score from 0-100, where 100 is perfect symmetry" 
        },
        warmup_intensity: { 
          type: "integer", 
          description: "Warmup intensity score from 0-100, measuring energy and engagement" 
        },
        nervousness_score: { 
          type: "integer", 
          description: "Nervousness score from 0-100, where 0 is calm and 100 is very nervous" 
        },
        eagerness_score: { 
          type: "integer", 
          description: "Eagerness score from 0-100, measuring desire to run" 
        },
        head_position: { 
          type: "string", 
          enum: ["normal", "high", "low", "favoring"],
          description: "Observed head position during movement"
        },
        ear_position: { 
          type: "string", 
          enum: ["alert", "pinned", "relaxed"],
          description: "Ear position indicating mood and focus"
        },
        stride_frequency: { 
          type: "number",
          description: "Estimated stride frequency per second if visible"
        },
        stride_length: { 
          type: "number",
          description: "Relative stride length assessment (0-1 scale)"
        },
        red_flags: { 
          type: "array", 
          items: { type: "string" },
          description: "List of any concerning observations"
        },
        analysis_notes: { 
          type: "string",
          description: "Detailed notes on the assessment"
        },
        confidence: { 
          type: "number",
          description: "Confidence in the assessment from 0-1"
        }
      },
      required: ["lameness_risk", "gait_symmetry", "warmup_intensity", "nervousness_score", "eagerness_score", "confidence"]
    }
  }
}];

function calculateRiskTier(scores: any): string {
  const { lameness_risk, gait_symmetry, nervousness_score } = scores;
  
  // High risk if lameness is elevated or multiple concerning factors
  if (lameness_risk > 60 || (lameness_risk > 40 && gait_symmetry < 50)) {
    return 'HIGH';
  }
  if (lameness_risk > 40 || gait_symmetry < 60 || nervousness_score > 70) {
    return 'ELEVATED';
  }
  if (lameness_risk > 20 || gait_symmetry < 75) {
    return 'MODERATE';
  }
  return 'LOW';
}

function calculateOverallRisk(scores: any): number {
  const { lameness_risk, gait_symmetry, nervousness_score, warmup_intensity, eagerness_score } = scores;
  
  // Weighted formula: lameness is most important, then gait
  const lamenessWeight = 0.35;
  const gaitWeight = 0.25;
  const nervousnessWeight = 0.15;
  const warmupWeight = 0.15;
  const eagernessWeight = 0.10;
  
  // Invert gait_symmetry and warmup_intensity since higher is better
  // Invert eagerness since higher is better
  const risk = 
    (lameness_risk * lamenessWeight) +
    ((100 - gait_symmetry) * gaitWeight) +
    (nervousness_score * nervousnessWeight) +
    ((100 - warmup_intensity) * warmupWeight) +
    ((100 - eagerness_score) * eagernessWeight);
    
  return Math.round(Math.min(100, Math.max(0, risk)));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { 
      video_url, 
      image_base64, 
      horse_id, 
      race_id, 
      entry_id,
      assessment_type = 'paddock',
      is_return_from_layoff = false,
      is_class_drop = false,
      previous_injury_flag = false
    } = await req.json();

    if (!video_url && !image_base64) {
      throw new Error('Either video_url or image_base64 must be provided');
    }

    console.log(`Analyzing ${assessment_type} for horse: ${horse_id || 'unknown'}`);

    // Build the content for Gemini Vision
    const content: any[] = [{ type: "text", text: ANALYSIS_PROMPT }];

    if (image_base64) {
      content.push({
        type: "image_url",
        image_url: {
          url: image_base64.startsWith('data:') ? image_base64 : `data:image/jpeg;base64,${image_base64}`
        }
      });
    } else if (video_url) {
      // For video URLs, we'll need to fetch frames or use a video-capable model
      // For MVP, we'll treat it as an image URL if it's a direct link
      content.push({
        type: "image_url",
        image_url: { url: video_url }
      });
    }

    // Call Gemini with vision capabilities and tool calling
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: content.map(c => {
            if (c.type === 'text') return { text: c.text };
            if (c.type === 'image_url') {
              if (c.image_url.url.startsWith('data:')) {
                const [mimeMatch, data] = c.image_url.url.split(',');
                const mimeType = mimeMatch?.match(/:(.*?);/)?.[1] || 'image/jpeg';
                return { inlineData: { mimeType, data } };
              }
              return { fileData: { fileUri: c.image_url.url } };
            }
            return c;
          })
        }],
        tools: [{
          functionDeclarations: analysisTools.map(t => t.function)
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: "ANY",
            allowedFunctionNames: ["record_visual_assessment"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiResult = await response.json();
    console.log('Gemini response received');

    // Extract the function call from the response
    let assessmentData: any = null;
    const candidates = geminiResult.candidates || [];
    
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.functionCall?.name === 'record_visual_assessment') {
          assessmentData = part.functionCall.args;
          break;
        }
      }
    }

    // If no function call, try to parse text response
    if (!assessmentData) {
      console.log('No function call found, using defaults with text analysis');
      const textContent = candidates[0]?.content?.parts?.[0]?.text || '';
      
      // Default scores if parsing fails
      assessmentData = {
        lameness_risk: 30,
        gait_symmetry: 70,
        warmup_intensity: 60,
        nervousness_score: 40,
        eagerness_score: 60,
        head_position: 'normal',
        ear_position: 'alert',
        red_flags: [],
        analysis_notes: textContent.substring(0, 500),
        confidence: 0.5
      };
    }

    // Calculate composite scores
    const overallRisk = calculateOverallRisk(assessmentData);
    const riskTier = calculateRiskTier(assessmentData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store the assessment
    const { data: insertedAssessment, error: insertError } = await supabase
      .from('visual_assessments')
      .insert({
        horse_id,
        race_id,
        entry_id,
        lameness_risk: assessmentData.lameness_risk,
        gait_symmetry: assessmentData.gait_symmetry,
        warmup_intensity: assessmentData.warmup_intensity,
        nervousness_score: assessmentData.nervousness_score,
        eagerness_score: assessmentData.eagerness_score,
        overall_risk_score: overallRisk,
        risk_tier: riskTier,
        head_position: assessmentData.head_position,
        ear_position: assessmentData.ear_position,
        stride_frequency: assessmentData.stride_frequency,
        stride_length: assessmentData.stride_length,
        assessment_type,
        video_source_url: video_url,
        model_used: 'gemini-2.0-flash',
        raw_analysis: assessmentData,
        confidence_score: assessmentData.confidence,
        is_return_from_layoff,
        is_class_drop,
        previous_injury_flag,
        red_flags: assessmentData.red_flags || [],
        analysis_notes: assessmentData.analysis_notes
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Continue even if insert fails - still return the analysis
    }

    // Update horse history if horse_id provided
    if (horse_id) {
      const { data: history } = await supabase
        .from('visual_assessment_history')
        .select('*')
        .eq('horse_id', horse_id)
        .single();

      if (history) {
        const assessments = history.assessments || [];
        assessments.push({
          date: new Date().toISOString(),
          lameness_risk: assessmentData.lameness_risk,
          gait_symmetry: assessmentData.gait_symmetry,
          overall_risk: overallRisk
        });

        // Keep only last 10 assessments
        const recentAssessments = assessments.slice(-10);
        
        // Calculate trend
        let trendDirection = 'stable';
        if (recentAssessments.length >= 3) {
          const recent = recentAssessments.slice(-3);
          const avgRecent = recent.reduce((a: number, b: any) => a + b.lameness_risk, 0) / 3;
          const older = recentAssessments.slice(-6, -3);
          if (older.length >= 3) {
            const avgOlder = older.reduce((a: number, b: any) => a + b.lameness_risk, 0) / 3;
            if (avgRecent > avgOlder + 10) trendDirection = 'worsening';
            else if (avgRecent < avgOlder - 10) trendDirection = 'improving';
          }
        }

        await supabase
          .from('visual_assessment_history')
          .update({
            assessments: recentAssessments,
            trend_direction: trendDirection,
            avg_lameness_risk: recentAssessments.reduce((a: number, b: any) => a + b.lameness_risk, 0) / recentAssessments.length,
            avg_gait_symmetry: recentAssessments.reduce((a: number, b: any) => a + b.gait_symmetry, 0) / recentAssessments.length,
            total_assessments: history.total_assessments + 1,
            last_updated: new Date().toISOString()
          })
          .eq('horse_id', horse_id);
      } else {
        // Create new history entry
        await supabase
          .from('visual_assessment_history')
          .insert({
            horse_id,
            assessments: [{
              date: new Date().toISOString(),
              lameness_risk: assessmentData.lameness_risk,
              gait_symmetry: assessmentData.gait_symmetry,
              overall_risk: overallRisk
            }],
            trend_direction: 'stable',
            avg_lameness_risk: assessmentData.lameness_risk,
            avg_gait_symmetry: assessmentData.gait_symmetry,
            total_assessments: 1
          });
      }
    }

    // Build the response
    const result = {
      success: true,
      assessment_id: insertedAssessment?.assessment_id,
      scores: {
        lameness_risk: assessmentData.lameness_risk,
        gait_symmetry: assessmentData.gait_symmetry,
        warmup_intensity: assessmentData.warmup_intensity,
        nervousness_score: assessmentData.nervousness_score,
        eagerness_score: assessmentData.eagerness_score
      },
      overall_risk_score: overallRisk,
      risk_tier: riskTier,
      behavioral: {
        head_position: assessmentData.head_position,
        ear_position: assessmentData.ear_position,
        stride_frequency: assessmentData.stride_frequency,
        stride_length: assessmentData.stride_length
      },
      red_flags: assessmentData.red_flags || [],
      analysis_notes: assessmentData.analysis_notes,
      confidence: assessmentData.confidence,
      model_adjustment_suggestion: calculateModelAdjustment(assessmentData, overallRisk, is_class_drop, is_return_from_layoff)
    };

    console.log('Analysis complete:', { riskTier, overallRisk, confidence: assessmentData.confidence });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in analyze-paddock-video:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateModelAdjustment(
  scores: any, 
  overallRisk: number, 
  isClassDrop: boolean, 
  isReturnFromLayoff: boolean
): { adjustment: number; reason: string } {
  let adjustment = 0;
  const reasons: string[] = [];

  // Lameness risk penalty
  if (scores.lameness_risk > 60) {
    adjustment -= 0.15;
    reasons.push('High lameness risk (-15%)');
  } else if (scores.lameness_risk > 40) {
    adjustment -= 0.08;
    reasons.push('Elevated lameness risk (-8%)');
  } else if (scores.lameness_risk > 20) {
    adjustment -= 0.03;
    reasons.push('Minor lameness concern (-3%)');
  }

  // Gait symmetry bonus/penalty
  if (scores.gait_symmetry > 85) {
    adjustment += 0.05;
    reasons.push('Excellent gait symmetry (+5%)');
  } else if (scores.gait_symmetry < 50) {
    adjustment -= 0.07;
    reasons.push('Poor gait symmetry (-7%)');
  }

  // Context multipliers
  if (isReturnFromLayoff && scores.lameness_risk > 30) {
    adjustment *= 1.5;
    reasons.push('Amplified concern (return from layoff)');
  }

  if (isClassDrop && scores.gait_symmetry > 75 && scores.warmup_intensity > 70) {
    adjustment += 0.08;
    reasons.push('Positive class drop with strong visual (+8%)');
  }

  // Nervousness/Eagerness balance
  if (scores.nervousness_score > 70) {
    adjustment -= 0.05;
    reasons.push('High nervousness (-5%)');
  }
  if (scores.eagerness_score > 80 && scores.nervousness_score < 40) {
    adjustment += 0.03;
    reasons.push('Ready to run (+3%)');
  }

  // Cap adjustment
  adjustment = Math.max(-0.30, Math.min(0.15, adjustment));

  return {
    adjustment: Math.round(adjustment * 100) / 100,
    reason: reasons.join('; ') || 'No significant adjustment'
  };
}
