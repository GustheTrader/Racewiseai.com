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
      // Insert race card
      const { data: raceCard, error: raceError } = await supabase
        .from('race_cards')
        .insert({
          track_name: raceData.track_name,
          race_date: raceData.race_date,
          race_number: raceData.race_number,
          race_time: raceData.race_time,
          post_time: raceData.post_time,
          race_type: raceData.race_type,
          distance: raceData.distance,
          surface: raceData.surface,
          conditions: raceData.conditions,
          purse: raceData.purse,
          source_url: sourceUrl,
          scraped_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (raceError) {
        console.error('Race card insert error:', raceError);
        throw new Error(`Failed to insert race card: ${raceError.message}`);
      }

      if (!raceCard) {
        throw new Error('No race card returned from insert');
      }

      racesInserted = 1;

      // Insert horses
      if (raceData.horses && Array.isArray(raceData.horses) && raceData.horses.length > 0) {
        const horsesToInsert = raceData.horses.map((horse: any) => ({
          race_card_id: raceCard.id,
          program_number: horse.program_number,
          horse_name: horse.horse_name,
          jockey_name: horse.jockey_name,
          trainer_name: horse.trainer_name,
          post_position: horse.post_position,
          morning_line: horse.morning_line,
          weight: horse.weight,
          age: horse.age,
          recent_form: horse.recent_form,
        }));

        const { data: horses, error: horsesError } = await supabase
          .from('horses')
          .insert(horsesToInsert)
          .select();

        if (horsesError) {
          console.error('Horses insert error:', horsesError);
          throw new Error(`Failed to insert horses: ${horsesError.message}`);
        }

        horsesInserted = horses?.length || 0;
      }

      // Insert betting pools
      if (raceData.betting_pools && Array.isArray(raceData.betting_pools)) {
        const poolsToInsert = raceData.betting_pools.map((pool: any) => ({
          race_card_id: raceCard.id,
          pool_type: pool.pool_type,
          total_pool: pool.total_pool,
          pool_count: pool.pool_count,
          captured_at: new Date().toISOString(),
        }));

        if (poolsToInsert.length > 0) {
          const { error: poolsError } = await supabase
            .from('betting_pools')
            .insert(poolsToInsert);

          if (poolsError) {
            console.warn('Betting pools insert warning:', poolsError);
            // Don't fail if pools insertion fails
          }
        }
      }

      // Log successful scrape job
      await supabase.from('scraper_jobs').insert({
        track_name: raceData.track_name,
        race_date: raceData.race_date,
        status: 'SUCCESS',
        races_scraped: racesInserted,
        horses_scraped: horsesInserted,
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
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
          race_card_id: raceCard.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error: any) {
      // Log failed scrape job
      await supabase.from('scraper_jobs').insert({
        track_name: raceData.track_name,
        race_date: raceData.race_date,
        status: 'FAILED',
        races_scraped: racesInserted,
        horses_scraped: horsesInserted,
        error_message: error.message,
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
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
