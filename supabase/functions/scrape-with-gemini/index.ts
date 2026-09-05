import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// CORS headers - restricted to specific origins
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://racewiseai.com',
  'https://www.racewiseai.com',
  'https://app.racewiseai.com',
  'https://bqvavkzgmznjfirgfyhd.lovableproject.com',
];

function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : "",
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Gemini API configuration
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface ScrapedRaceData {
  track_name: string;
  race_date: string;
  race_number: number;
  race_time?: string;
  post_time?: string;
  race_type?: string;
  distance?: string;
  surface?: string;
  conditions?: string;
  purse?: string;
  horses: Horse[];
  betting_pools?: BettingPool[];
}

interface Horse {
  program_number: number;
  horse_name: string;
  jockey_name?: string;
  trainer_name?: string;
  post_position?: number;
  morning_line?: string;
  weight?: number;
  age?: number;
  recent_form?: string;
}

interface BettingPool {
  pool_type: string;
  total_pool: number;
  pool_count?: number;
}

/**
 * Verify JWT token using Supabase auth
 */
async function verifyAuth(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }

  return { userId: data.user.id };
}

// Fetch webpage content
async function fetchWebPageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    // Remove script tags and excessive whitespace
    const cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned.substring(0, 10000); // Limit to 10k chars for API
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to fetch page: ${message}`);
  }
}

// Use Gemini to extract race data from HTML
async function extractRaceDataWithGemini(htmlContent: string, url: string): Promise<ScrapedRaceData> {
  const prompt = `You are an expert at extracting horse racing data from websites.

Extract all race and horse information from this Off-Track Betting webpage HTML.

Return the data as JSON with this exact structure:
{
  "track_name": "string",
  "race_date": "YYYY-MM-DD",
  "race_number": number,
  "race_time": "HH:MM",
  "post_time": "HH:MM",
  "race_type": "string (e.g., Thoroughbred, Harness)",
  "distance": "string (e.g., 1 mile)",
  "surface": "string (e.g., Dirt, Turf)",
  "conditions": "string (e.g., Fast, Muddy)",
  "purse": "string (e.g., $50,000)",
  "horses": [
    {
      "program_number": number,
      "horse_name": "string",
      "jockey_name": "string",
      "trainer_name": "string",
      "post_position": number,
      "morning_line": "string (e.g., 5-2)",
      "weight": number,
      "age": number,
      "recent_form": "string"
    }
  ],
  "betting_pools": [
    {
      "pool_type": "WIN|PLACE|SHOW|EXACTA|TRIFECTA|SUPERFECTA",
      "total_pool": number,
      "pool_count": number
    }
  ]
}

HTML Content to extract from:
${htmlContent}

IMPORTANT:
- Extract all visible data, but only return data that is actually present
- Use null for missing fields, not empty strings
- Race numbers, pool amounts, and positions must be numbers
- Dates must be in YYYY-MM-DD format
- Only return valid JSON`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2, // Low temperature for consistent data extraction
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini response structure:', JSON.stringify(Object.keys(data)));
    
    // FIXED: Correct path for Gemini API response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!content) {
      console.error('Empty Gemini response:', JSON.stringify(data));
      throw new Error('Empty response from Gemini API');
    }

    // Extract JSON from response (Gemini might wrap it in markdown code blocks)
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    
    if (!jsonStr) {
      console.error('No JSON found in response:', content.substring(0, 500));
      throw new Error('No JSON found in Gemini response');
    }

    const extractedData = JSON.parse(jsonStr.trim());

    // Validate and normalize the data
    return {
      track_name: extractedData.track_name || 'Unknown',
      race_date: extractedData.race_date || new Date().toISOString().split('T')[0],
      race_number: extractedData.race_number || 1,
      race_time: extractedData.race_time,
      post_time: extractedData.post_time,
      race_type: extractedData.race_type,
      distance: extractedData.distance,
      surface: extractedData.surface,
      conditions: extractedData.conditions,
      purse: extractedData.purse,
      horses: Array.isArray(extractedData.horses) ? extractedData.horses : [],
      betting_pools: Array.isArray(extractedData.betting_pools) ? extractedData.betting_pools : [],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Gemini extraction failed: ${message}`);
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY FIX: Verify authentication
    const internalSecret = req.headers.get('x-internal-secret');
    const expectedInternal = Deno.env.get('CRON_JOB_SECRET');
    const isInternalCall = !!expectedInternal && internalSecret === expectedInternal;

    const auth = isInternalCall ? { userId: 'system' } : await verifyAuth(req);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate Gemini API key
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { url, track_name } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL is from allowed domain
    try {
      const urlObj = new URL(url);
      // SECURITY: Use whitelist matching to prevent domain bypass
      const allowedDomains = ['offtrackbetting.com', 'www.offtrackbetting.com', 'app.offtrackbetting.com'];
      if (!allowedDomains.includes(urlObj.hostname)) {
        throw new Error('Only offtrackbetting.com URLs are allowed');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid URL format';
      return new Response(
        JSON.stringify({ error: `Invalid URL: ${message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Scraping ${url} with Gemini for user ${auth.userId}...`);

    // Fetch the webpage
    const htmlContent = await fetchWebPageContent(url);

    // Extract data using Gemini
    const raceData = await extractRaceDataWithGemini(htmlContent, url);

    // Enrich with track name if provided
    if (track_name) {
      raceData.track_name = track_name;
    }

    return new Response(JSON.stringify({
      success: true,
      data: raceData,
      scraped_at: new Date().toISOString(),
      method: 'gemini-2.0-flash',
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Scraping error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
