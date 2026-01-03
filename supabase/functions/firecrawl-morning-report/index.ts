import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { trackName, trackSlug, raceNumber } = await req.json();

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

    // Build the URL for offtrackbetting.com using provided slug or generate from name
    const slug = trackSlug || trackName.toLowerCase().replace(/\s+/g, '-');
    let url = `https://www.offtrackbetting.com/tracks/${slug}`;
    if (raceNumber) {
      url += `/race/${raceNumber}`;
    }

    console.log('Scraping morning report from:', url);
    console.log('Track name:', trackName, 'Slug:', slug);

    // Use Firecrawl to scrape the page with structured extraction
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: [
          'markdown',
          {
            type: 'json',
            schema: {
              type: 'object',
              properties: {
                trackName: { type: 'string', description: 'Name of the race track' },
                raceDate: { type: 'string', description: 'Date of the races' },
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
          }
        ],
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

    // Extract the structured data
    const extractedData = data.data?.json || data.json || null;
    const markdown = data.data?.markdown || data.markdown || '';

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
