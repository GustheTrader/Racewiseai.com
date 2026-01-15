import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentType } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
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
Focus on finding hidden value and unconventional plays.`
    };

    const systemPrompt = systemPrompts[agentType] || systemPrompts['race-analyst'];

    // Format messages for Gemini
    const geminiContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to assist with horse racing analysis.' }] },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    console.log('Calling Gemini API for agent:', agentType);

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
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response.';

    console.log('Gemini response received successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Agent chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
