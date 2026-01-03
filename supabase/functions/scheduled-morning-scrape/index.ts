// @ts-expect-error - Deno imports are not typed
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error - Supabase JS library typing issues
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://racewiseai.com',
  'https://www.racewiseai.com',
  'https://app.racewiseai.com',
];

function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

interface TrackConfig {
  track_name: string;
  is_enabled: boolean;
  schedule_hour: number;
  schedule_minute: number;
}

interface Horse {
  programNumber: string;
  horseName: string;
  jockey: string;
  trainer: string;
  morningLineOdds: string;
  weight: number | null;
}

interface RaceData {
  raceNumber: number;
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

async function scrapeTrack(trackName: string, apiKey: string): Promise<MorningReportData | null> {
  const trackCode = trackName.toLowerCase().replace(/\s+/g, '-');
  const url = `https://www.offtrackbetting.com/tracks/${trackCode}`;

  console.log(`[Firecrawl] Scraping morning report from: ${url}`);

  try {
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
                raceDate: { type: 'string', description: 'Date of the races (YYYY-MM-DD)' },
                races: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      raceNumber: { type: 'number', description: 'Race number' },
                      postTime: { type: 'string', description: 'Post time' },
                      distance: { type: 'string', description: 'Race distance' },
                      surface: { type: 'string', description: 'Track surface (dirt, turf, etc)' },
                      raceType: { type: 'string', description: 'Type of race' },
                      purse: { type: 'string', description: 'Purse amount' },
                      conditions: { type: 'string', description: 'Race conditions' },
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
                            weight: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            prompt: 'Extract all horse racing information from the page. For each race, extract: race number, post time, distance, surface, race type, purse, conditions, and all horse entries with program number, name, jockey, trainer, morning line odds, and weight.'
          }
        ],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`[Firecrawl] Error for ${trackName}: status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const extractedData = data.data?.json || data.json || null;

    if (!extractedData || !extractedData.races) {
      console.warn(`[Firecrawl] No races found for ${trackName}`);
      return null;
    }

    console.log(`[Firecrawl] ${trackName}: Found ${extractedData.races.length} races`);

    return {
      trackName: extractedData.trackName || trackName,
      raceDate: extractedData.raceDate || new Date().toISOString().split('T')[0],
      races: extractedData.races || [],
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Firecrawl] Error scraping ${trackName}:`, error);
    return null;
  }
}

async function saveMorningReport(supabase: any, data: MorningReportData): Promise<{ races: number; horses: number; success: boolean }> {
  const stats = { races: 0, horses: 0, success: false };

  try {
    // Save to morning_reports table
    const { error: reportError } = await supabase
      .from('morning_reports')
      .upsert({
        track_name: data.trackName,
        race_date: data.raceDate,
        races_found: data.races.length,
        horses_found: data.races.reduce((sum: number, race) => sum + (race.horses?.length || 0), 0),
        raw_data: data,
        status: 'success',
        scraped_at: new Date().toISOString()
      }, {
        onConflict: 'track_name,race_date'
      });

    if (reportError) {
      console.error(`[DB] Error saving morning report:`, reportError);
      return stats;
    }

    stats.races = data.races.length;
    stats.horses = data.races.reduce((sum: number, race) => sum + (race.horses?.length || 0), 0);
    stats.success = true;

    console.log(`[DB] Saved morning report for ${data.trackName}: ${stats.races} races, ${stats.horses} horses`);

    return stats;
  } catch (error) {
    console.error(`[DB] Error processing ${data.trackName}:`, error);
    return stats;
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[Morning Report] Starting scheduled morning scrape at:', new Date().toISOString());

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch enabled tracks from track_config table
    const { data: trackConfigs, error: configError } = await supabase
      .from('track_config')
      .select('track_name, is_enabled')
      .eq('is_enabled', true);

    if (configError) {
      console.error('[Morning Report] Error fetching config:', configError);
      throw new Error('Failed to fetch track configuration');
    }

    const enabledTracks = (trackConfigs as TrackConfig[])?.map((t) => t.track_name) || [];
    console.log(`[Morning Report] Found ${enabledTracks.length} enabled tracks to scrape`);

    const results: { track: string; success: boolean; stats?: { races: number; horses: number }; error?: string }[] = [];

    // Scrape each track
    for (const trackName of enabledTracks) {
      console.log(`[Morning Report] Processing ${trackName}...`);

      const data = await scrapeTrack(trackName, firecrawlKey);

      if (data && data.races.length > 0) {
        const stats = await saveMorningReport(supabase, data);
        if (stats.success) {
          results.push({ track: trackName, success: true, stats: { races: stats.races, horses: stats.horses } });
          console.log(`[Morning Report] ✓ ${trackName}: ${stats.races} races, ${stats.horses} horses`);
        } else {
          results.push({ track: trackName, success: false, error: 'Failed to save to database' });
        }
      } else {
        results.push({ track: trackName, success: false, error: 'No data returned from Firecrawl' });
        console.log(`[Morning Report] ✗ ${trackName}: No data found`);
      }

      // Wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter((r) => r.success).length;
    const executionTimeMs = Date.now() - startTime;

    console.log(`[Morning Report] Completed: ${successCount}/${enabledTracks.length} successful (${executionTimeMs}ms)`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${successCount}/${enabledTracks.length} tracks successfully`,
        results,
        executionTimeMs,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const executionTimeMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[Morning Report] Error:', errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        executionTimeMs,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
