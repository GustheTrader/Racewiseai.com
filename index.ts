// Create this file as: supabase/functions/statpal-sync/index.ts

// Import Deno types and utilities
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { serveStatic } from "https://deno.land/std@0.177.0/http/file_server.ts";
import { Console } from "https://deno.land/std@0.177.0/log/mod.ts";

// Initialize environment
const env = Deno.env;
const envUrl = env.get("SUPABASE_URL") || "";
const envKey = env.get("SUPABASE_ANON_KEY") || "";

// Initialize Supabase client
const supabase = createClient(envUrl, envKey);

// Initialize console
const console = new Console({ name: "statpal-sync" });

// Add signal listeners for proper shutdown
Deno.addSignalListener("SIGINT", () => Deno.exit(0));
Deno.addSignalListener("SIGTERM", () => Deno.exit(0));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Environment variables - ADD THESE TO YOUR SUPABASE PROJECT SETTINGS
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const STATPAL_API_KEY = Deno.env.get("STATPAL_API_KEY") || ""; // You need to add this

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log("=== Starting Statpal API sync ===");
    
    // Get request parameters
    const { country = 'usa', type = 'live' } = await req.json().catch(() => ({}));
    console.log(`Syncing ${type} data for country: ${country}`);
    
    // Fetch data from Statpal API
    const statpalUrl = `https://statpal.io/api/v1/horse-racing/${type}/${country}`;
    const statpalResponse = await fetch(statpalUrl, {
      headers: {
        'Authorization': `Bearer ${STATPAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!statpalResponse.ok) {
      throw new Error(`Statpal API error: ${statpalResponse.status}`);
    }
    
    const statpalData = await statpalResponse.json();
    console.log(`Received data from Statpal API`);
    
    // Process the data
    const results = await processStatpalData(statpalData, supabase, country);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${type} data for ${country}`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in Statpal sync:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

async function processStatpalData(data: any, supabase: any, country: string) {
  const results = { races: 0, horses: 0, results: 0, wagers: 0 };
  
  if (!data.scores?.tournament) {
    console.log("No tournament data found");
    return results;
  }

  for (const tournament of data.scores.tournament) {
    const trackName = tournament.name;
    const raceDate = parseStatpalDate(tournament.date);
    const going = tournament.going || '';
    
    console.log(`Processing track: ${trackName} on ${raceDate}`);
    
    for (const race of tournament.race || []) {
      // Insert or update race data
      const raceData = {
        statpal_race_id: race.id,
        track_name: trackName,
        country: country,
        race_date: raceDate,
        race_time: race.time || null,
        race_name: race.name || '',
        distance: race.distance || '',
        class: race.class || '',
        going: going,
        status: race.status || '',
        raw_data: race
      };
      
      const { error: raceError } = await supabase
        .from('statpal_live_races')
        .upsert(raceData, { onConflict: 'statpal_race_id' });
      
      if (raceError) {
        console.error(`Error inserting race ${race.id}:`, raceError);
        continue;
      }
      
      results.races++;
      
      // Process horses if they exist
      if (race.runners?.horse) {
        for (const horse of race.runners.horse) {
          const horseData = {
            statpal_horse_id: horse.id,
            statpal_race_id: race.id,
            horse_name: horse.name,
            number: parseInt(horse.number) || null,
            age: horse.age || '',
            gender: horse.gender || '',
            weight: horse.wgt || '',
            weight_lbs: parseInt(horse.wgt_lbs) || null,
            jockey_name: horse.jockey || '',
            jockey_id: horse.jockey_id || '',
            trainer_name: horse.trainer || '',
            trainer_id: horse.trainer_id || '',
            stall: horse.stall || '',
            rating: horse.rating || '',
            recent_form: horse.recent_form || null
          };
          
          const { error: horseError } = await supabase
            .from('statpal_horses')
            .upsert(horseData, { onConflict: 'statpal_horse_id,statpal_race_id' });
          
          if (!horseError) {
            results.horses++;
          }
          
          // If this horse has position data (finished race), save results
          if (horse.pos) {
            const resultData = {
              statpal_race_id: race.id,
              horse_id: horse.id,
              horse_name: horse.name,
              position: parseInt(horse.pos),
              jockey_name: horse.jockey || '',
              distance_behind: horse.distance || '',
              starting_price: parseFloat(horse.sp) || null,
              time_taken: horse.time || '',
              weight: horse.wgt || ''
            };
            
            const { error: resultError } = await supabase
              .from('statpal_results')
              .upsert(resultData);
            
            if (!resultError) {
              results.results++;
            }
          }
        }
      }
      
      // Process wagers/betting data
      if (race.wagers?.wager) {
        for (const wager of race.wagers.wager) {
          const wagerData = {
            statpal_race_id: race.id,
            wager_type: wager.type,
            numbers: wager.numbers,
            payoff: parseFloat(wager.payoff) || null,
            pool: wager.pool || ''
          };
          
          const { error: wagerError } = await supabase
            .from('statpal_wagers')
            .upsert(wagerData);
          
          if (!wagerError) {
            results.wagers++;
          }
        }
      }
    }
  }
  
  return results;
}

function parseStatpalDate(dateStr: string): string {
  // Convert "25.01.2025" to "2025-01-25"
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0]; // fallback to today
}
