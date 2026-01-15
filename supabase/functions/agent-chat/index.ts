import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://racewiseai.com',
  'https://www.racewiseai.com',
  'https://app.racewiseai.com',
  'https://bqvavkzgmznjfirgfyhd.lovableproject.com',
  'https://id-preview--a07bce7a-713d-446c-8c0f-8ea801d1fd15.lovable.app',
  'https://racewiseai.lovable.app',
];

function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Agent chat: Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log('Agent chat: Invalid token', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Agent chat: Authenticated user', userId);

    const { messages, agentType } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      console.error('Agent chat: GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Define agent-specific system prompts
    const systemPrompts: Record<string, string> = {
      'race-analyst': `You are Agent RW Race Analyst, an expert AI assistant for horse racing analysis. You specialize in:
- Comprehensive race analysis and handicapping strategies
- Performance insights and speed figure analysis
- Track conditions and bias evaluation
- Jockey/trainer statistics and patterns
- Pace analysis and trip handicapping
Keep responses concise but informative. Use racing terminology appropriately.`,
      
      'cosmic-bombs': `You are Agent RW Cosmic Bombs, an AI specialist for identifying explosive betting opportunities. You specialize in:
- High-value longshot detection
- Overlay and value betting identification
- Live odds movement analysis
- Pattern recognition for upset potential
- Risk/reward optimization
Focus on finding hidden value and unconventional plays.`,

      'risk-analysis': `You are Agent RW Risk Analysis, an expert AI advisor for betting strategy and bankroll management. You specialize in:

**Kelly Criterion & Bet Sizing:**
- Calculate optimal bet sizes using the Kelly formula: f* = (bp - q) / b where b=odds, p=win probability, q=loss probability
- Recommend fractional Kelly (typically 1/4 to 1/2 Kelly) for more conservative bankroll preservation
- Explain when to use flat betting vs. proportional betting

**Bankroll Management:**
- Set proper bankroll allocation (typically 1-5% per bet maximum)
- Create unit-based betting systems for consistent sizing
- Establish stop-loss limits and session bankroll strategies
- Track ROI and expected value calculations

**Risk Assessment:**
- Evaluate risk/reward ratios for different bet types (win, place, show, exotics)
- Analyze variance and standard deviation in betting results
- Identify when to increase or decrease exposure based on edge

**Long-term Sustainability:**
- Emphasize that betting is a marathon, not a sprint
- Encourage discipline and emotional control
- Provide realistic expectation setting
- Warn against chasing losses and tilting

Always provide specific, actionable advice with numbers when possible. Help bettors stay in the game long-term by protecting their bankroll.`
    };

    const systemPrompt = systemPrompts[agentType] || systemPrompts['race-analyst'];

    // Format messages for Gemini
    const geminiContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to assist with horse racing analysis.' }] },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(msg.content || '').substring(0, 10000) }] // Limit content length
      }))
    ];

    console.log('Agent chat: Calling Gemini API for agent:', agentType);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agent chat: Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response.';

    console.log('Agent chat: Gemini response received successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Agent chat error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
