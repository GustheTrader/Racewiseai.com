import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LiveOdds {
  programNumber: string;
  horseName: string;
  currentOdds: string;
  winPool?: number;
  placePool?: number;
  showPool?: number;
}

interface LiveOddsData {
  trackName: string;
  raceNumber: number;
  raceDate: string;
  postTime?: string;
  mtp?: string; // Minutes to post
  totalPool?: number;
  horses: LiveOdds[];
  scrapedAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trackName, trackCode, trackPage, raceNumber } = await req.json();

    if (!trackName || !raceNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Track name and race number are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY_1') || Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build URL for live odds page - OTB shows live odds on the same page
    let url: string;
    if (trackCode && trackPage) {
      url = `https://www.offtrackbetting.com/racetracks/${trackCode}/${trackPage}.html`;
    } else {
      const slug = trackName.toLowerCase().replace(/\s+/g, '-');
      url = `https://www.offtrackbetting.com/tracks/${slug}`;
    }

    console.log('Scraping live odds from:', url);
    console.log('Track:', trackName, 'Race:', raceNumber);

    // Scrape with focus on live odds extraction
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['extract'],
        extract: {
          schema: {
            type: 'object',
            properties: {
              trackName: { type: 'string' },
              races: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    raceNumber: { type: 'number' },
                    postTime: { type: 'string' },
                    mtp: { type: 'string', description: 'Minutes to post or status like "OFF" or "CLOSED"' },
                    totalPool: { type: 'number', description: 'Total win pool amount' },
                    horses: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          programNumber: { type: 'string' },
                          horseName: { type: 'string' },
                          currentOdds: { type: 'string', description: 'Current live odds or tote odds shown' },
                          winPool: { type: 'number' },
                          placePool: { type: 'number' },
                          showPool: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          prompt: `Extract the CURRENT LIVE ODDS (tote board odds) for all horses in race ${raceNumber}. Look for the current odds display, win pools, place pools, show pools. The current odds are different from morning line odds - they are the live betting odds shown on the tote board. Get program number, horse name, and current live odds for each horse.`
        },
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || 'Failed to fetch live odds' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Live odds scrape successful');
    
    const extractedData = data.data?.extract || data.extract || {};
    const races = extractedData.races || [];
    
    // Find the specific race requested
    const targetRace = races.find((r: any) => r.raceNumber === raceNumber) || races[0];

    const result: LiveOddsData = {
      trackName: extractedData.trackName || trackName,
      raceNumber: raceNumber,
      raceDate: new Date().toISOString().split('T')[0],
      postTime: targetRace?.postTime,
      mtp: targetRace?.mtp,
      totalPool: targetRace?.totalPool,
      horses: targetRace?.horses || [],
      scrapedAt: new Date().toISOString(),
    };

    console.log(`Found ${result.horses.length} horses with live odds for race ${raceNumber}`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping live odds:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape live odds';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
