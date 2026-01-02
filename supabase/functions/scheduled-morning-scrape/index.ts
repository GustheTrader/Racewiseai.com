import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  medication: string | null;
  equipment: string | null;
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

  console.log(`Scraping morning report from: ${url}`);

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
                trackName: { type: 'string' },
                raceDate: { type: 'string' },
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
            prompt: 'Extract all horse racing information including race details and entries.'
          }
        ],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl error for ${trackName}:`, response.status);
      return null;
    }

    const data = await response.json();
    const extractedData = data.data?.json || data.json || null;

    return {
      trackName: extractedData?.trackName || trackName,
      raceDate: extractedData?.raceDate || new Date().toISOString().split('T')[0],
      races: extractedData?.races || [],
      scrapedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error scraping ${trackName}:`, error);
    return null;
  }
}

async function saveToDatabase(supabase: any, data: MorningReportData): Promise<{ races: number; horses: number; odds: number }> {
  const stats = { races: 0, horses: 0, odds: 0 };
  const raceDate = data.raceDate || new Date().toISOString().split('T')[0];

  for (const race of data.races) {
    // Insert race_data
    const { data: raceData, error: raceError } = await supabase
      .from('race_data')
      .upsert({
        track_name: data.trackName,
        race_number: race.raceNumber,
        race_date: raceDate,
        race_conditions: `${race.distance || ''} ${race.surface || ''} ${race.raceType || ''} - ${race.conditions || ''} - Purse: ${race.purse || 'N/A'}`.trim(),
      }, { onConflict: 'track_name,race_number,race_date' })
      .select()
      .maybeSingle();

    if (raceError) {
      console.error('Error inserting race:', raceError);
      continue;
    }
    stats.races++;

    if (raceData?.id && race.horses?.length) {
      for (const horse of race.horses) {
        const mlOdds = horse.morningLineOdds 
          ? parseFloat(horse.morningLineOdds.replace(/[^0-9.]/g, '')) || null
          : null;
        const horseNumber = parseInt(horse.programNumber) || 0;

        // Insert race_horses
        const { error: horseError } = await supabase
          .from('race_horses')
          .upsert({
            race_id: raceData.id,
            name: horse.horseName,
            pp: horseNumber,
            jockey: horse.jockey || null,
            trainer: horse.trainer || null,
            ml_odds: mlOdds,
          }, { onConflict: 'race_id,pp' });

        if (!horseError) stats.horses++;

        // Insert odds_data
        if (horse.horseName && horseNumber > 0) {
          const { error: oddsError } = await supabase
            .from('odds_data')
            .insert({
              track_name: data.trackName,
              race_number: race.raceNumber,
              race_date: raceDate,
              horse_number: horseNumber,
              horse_name: horse.horseName,
              win_odds: horse.morningLineOdds || null,
              pool_data: {
                type: 'morning_line',
                jockey: horse.jockey,
                trainer: horse.trainer,
                source: 'scheduled_scrape'
              }
            });

          if (!oddsError) stats.odds++;
        }
      }
    }
  }

  return stats;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('Starting scheduled morning scrape at:', new Date().toISOString());

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch enabled tracks from config
    const { data: trackConfigs, error: configError } = await supabase
      .from('scrape_schedule_config')
      .select('track_name, is_enabled')
      .eq('is_enabled', true);

    if (configError) {
      console.error('Error fetching config:', configError);
      throw new Error('Failed to fetch track configuration');
    }

    const enabledTracks = trackConfigs?.map((t: TrackConfig) => t.track_name) || [];
    console.log(`Found ${enabledTracks.length} enabled tracks to scrape`);

    const results: { track: string; success: boolean; stats?: { races: number; horses: number; odds: number }; error?: string }[] = [];

    // Scrape each track sequentially to avoid rate limits
    for (const trackName of enabledTracks) {
      console.log(`Processing ${trackName}...`);
      
      const data = await scrapeTrack(trackName, firecrawlKey);
      
      if (data && data.races.length > 0) {
        const stats = await saveToDatabase(supabase, data);
        results.push({ track: trackName, success: true, stats });
        console.log(`${trackName}: Saved ${stats.races} races, ${stats.horses} horses, ${stats.odds} odds`);
      } else {
        results.push({ track: trackName, success: false, error: 'No data returned' });
        console.log(`${trackName}: No data found`);
      }

      // Wait 2 seconds between tracks to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Log execution to system_logs
    await supabase.from('system_logs').insert({
      log_level: 'INFO',
      component: 'scheduled-morning-scrape',
      message: `Completed morning scrape for ${enabledTracks.length} tracks`,
      details: {
        results,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });

    const successCount = results.filter(r => r.success).length;
    console.log(`Morning scrape completed: ${successCount}/${enabledTracks.length} tracks successful`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${successCount}/${enabledTracks.length} tracks`,
        results,
        executionTimeMs: Date.now() - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scheduled scrape error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
