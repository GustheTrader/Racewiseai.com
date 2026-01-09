import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://racewiseai.com',
  'https://www.racewiseai.com',
  'https://app.racewiseai.com',
  'https://bqvavkzgmznjfirgfyhd.lovableproject.com'
];

function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
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

interface Horse {
  programNumber: string;
  horseName: string;
  jockey: string;
  trainer: string;
  morningLineOdds: string;
  weight: number | null;
  medication: string | null;
  equipment: string | null;
}

interface RaceData {
  raceNumber: number;
  trackName: string;
  postTime: string;
  distance: string;
  surface: string;
  raceType: string;
  purse: string;
  conditions: string;
  horses: Horse[];
}

interface MorningReportData {
  trackName: string;
  raceDate: string;
  races: RaceData[];
  scrapedAt: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY FIX: Verify authentication
    const auth = await verifyAuth(req);
    if (!auth) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { trackName, trackCode, trackPage, raceNumber } = await req.json();

    if (!trackName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Track name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try both secret names (connector uses FIRECRAWL_API_KEY_1)
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY_1') || Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured. Please connect Firecrawl in project settings.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the URL for offtrackbetting.com using code and page name
    // Format: https://www.offtrackbetting.com/racetracks/{CODE}/{page_name}.html
    let url: string;
    if (trackCode && trackPage) {
      url = `https://www.offtrackbetting.com/racetracks/${trackCode}/${trackPage}.html`;
    } else {
      // Fallback to old format
      const slug = trackName.toLowerCase().replace(/\s+/g, '-');
      url = `https://www.offtrackbetting.com/tracks/${slug}`;
    }
    
    if (raceNumber) {
      url += `?race=${raceNumber}`;
    }

    console.log('Scraping morning report from:', url, 'for user:', auth.userId);
    console.log('Track:', trackName, 'Code:', trackCode, 'Page:', trackPage);

    // Use Firecrawl to scrape the page with structured extraction
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'extract'],
        extract: {
          schema: {
            type: 'object',
            properties: {
              trackName: { type: 'string', description: 'Name of the race track' },
              raceDate: { type: 'string', description: 'Date of the races in YYYY-MM-DD format' },
              races: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    raceNumber: { type: 'number' },
                    postTime: { type: 'string' },
                    distance: { type: 'string' },
                    surface: { type: 'string' },
                    raceType: { type: 'string' },
                    purse: { type: 'string' },
                    conditions: { type: 'string' },
                    horses: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          programNumber: { type: 'string' },
                          horseName: { type: 'string' },
                          jockey: { type: 'string' },
                          trainer: { type: 'string' },
                          morningLineOdds: { type: 'string' },
                          weight: { type: 'number' },
                          medication: { type: 'string' },
                          equipment: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          prompt: 'Extract all horse racing information including race details and entries. For each race, get the race number, post time, distance, surface type, race conditions, purse amount, and all horse entries with their program numbers, names, jockeys, trainers, morning line odds, weight carried, medication, and equipment.'
        },
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Firecrawl request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Firecrawl scrape successful');
    console.log('Response data keys:', Object.keys(data.data || data));

    // Extract the structured data from the extract format
    const extractedData = data.data?.extract || data.extract || null;
    const markdown = data.data?.markdown || data.markdown || '';

    console.log('Extracted data:', JSON.stringify(extractedData).substring(0, 500));

    const result: MorningReportData = {
      trackName: extractedData?.trackName || trackName,
      raceDate: extractedData?.raceDate || new Date().toISOString().split('T')[0],
      races: extractedData?.races || [],
      scrapedAt: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        markdown,
        metadata: data.data?.metadata || data.metadata
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping morning report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape morning report';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
