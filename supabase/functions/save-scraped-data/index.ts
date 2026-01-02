// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://racewiseai.com',
  'https://www.racewiseai.com',
  'https://app.racewiseai.com',
  'https://bqvavkzgmznjfirgfyhd.lovableproject.com',
];

function getCorsHeaders(origin?: string): Record<string, string> {
  // SECURITY FIX: Use exact match instead of includes() to prevent domain confusion attacks
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : "",
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { raceData, sourceUrl } = await req.json();

    if (!raceData) {
      return new Response(JSON.stringify({ error: 'Race data is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Start transaction
    const startTime = Date.now();
    let racesInserted = 0;
    let horsesInserted = 0;

    try {
      // Insert into race_data table (exists in schema)
      const { data: raceRecord, error: raceError } = await supabase
        .from('race_data')
        .upsert({
          track_name: raceData.track_name,
          race_date: raceData.race_date || new Date().toISOString().split('T')[0],
          race_number: raceData.race_number || 1,
          race_conditions: `${raceData.distance || ''} ${raceData.surface || ''} - ${raceData.conditions || ''} - Purse: ${raceData.purse || 'N/A'}`.trim(),
        }, { onConflict: 'track_name,race_number,race_date' })
        .select()
        .single();

      if (raceError) {
        console.error('Race data insert error:', raceError);
        throw new Error(`Failed to insert race data: ${raceError.message}`);
      }

      racesInserted = 1;
      console.log('Inserted race:', raceRecord?.id);

      // Insert horses into race_horses table
      if (raceRecord?.id && raceData.horses && Array.isArray(raceData.horses) && raceData.horses.length > 0) {
        for (const horse of raceData.horses) {
          const horseNumber = parseInt(horse.program_number) || 0;
          if (horseNumber <= 0 || !horse.horse_name) continue;

          const { error: horseError } = await supabase
            .from('race_horses')
            .upsert({
              race_id: raceRecord.id,
              name: horse.horse_name,
              pp: horseNumber,
              jockey: horse.jockey_name || null,
              trainer: horse.trainer_name || null,
              ml_odds: horse.morning_line ? parseFloat(horse.morning_line.replace(/[^0-9.]/g, '')) || null : null,
            }, { onConflict: 'race_id,pp' });

          if (!horseError) {
            horsesInserted++;
          } else {
            console.warn('Horse insert warning:', horseError.message);
          }

          // Also insert into odds_data for tracking
          const { error: oddsError } = await supabase
            .from('odds_data')
            .insert({
              track_name: raceData.track_name,
              race_number: raceData.race_number || 1,
              race_date: raceData.race_date || new Date().toISOString().split('T')[0],
              horse_number: horseNumber,
              horse_name: horse.horse_name,
              win_odds: horse.morning_line || null,
              pool_data: {
                type: 'scraped',
                jockey: horse.jockey_name,
                trainer: horse.trainer_name,
                weight: horse.weight,
                source: sourceUrl
              }
            });

          if (oddsError) {
            console.warn('Odds insert warning:', oddsError.message);
          }
        }
      }

      // Log to system_logs
      await supabase.from('system_logs').insert({
        component: 'scraper',
        log_level: 'INFO',
        message: `Scraped ${raceData.track_name} R${raceData.race_number}: ${horsesInserted} horses`,
        details: {
          track: raceData.track_name,
          race_number: raceData.race_number,
          horses_count: horsesInserted,
          duration_ms: Date.now() - startTime,
          source_url: sourceUrl
        }
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Race data saved successfully',
          stats: {
            races_inserted: racesInserted,
            horses_inserted: horsesInserted,
            duration_ms: Date.now() - startTime,
          },
          race_id: raceRecord?.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error: any) {
      // Log error
      await supabase.from('system_logs').insert({
        component: 'scraper',
        log_level: 'ERROR',
        message: `Scrape failed: ${error.message}`,
        details: {
          track: raceData.track_name,
          error: error.message,
          duration_ms: Date.now() - startTime
        }
      });

      throw error;
    }
  } catch (error: any) {
    console.error('Save data error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to save race data',
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
