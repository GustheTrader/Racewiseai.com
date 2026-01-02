// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://racewiseai.com",
  "https://www.racewiseai.com",
  "https://app.racewiseai.com",
];

function getCorsHeaders(origin?: string): Record<string, string> {
  // SECURITY FIX: Use exact match instead of includes() to prevent domain confusion attacks
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

interface RaceResult {
  track_name: string;
  race_number: number;
  race_date: string;
  winning_horse?: string;
  winning_program?: number;
  winning_odds?: string;
  place_horse?: string;
  place_program?: number;
  place_odds?: string;
  show_horse?: string;
  show_program?: number;
  show_odds?: string;
  exacta_payout?: string;
  trifecta_payout?: string;
  superfecta_payout?: string;
  win_pool_total?: number;
  place_pool_total?: number;
  show_pool_total?: number;
  exacta_pool_total?: number;
  carryover?: number;
  time_of_race?: string;
  race_conditions?: string;
  distance?: string;
  surface?: string;
  field_size?: number;
}

/**
 * Fetch webpage content
 */
async function fetchWebPageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    // Remove script tags and excessive whitespace
    const cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    return cleaned.substring(0, 15000); // Limit to 15k chars for API
  } catch (error) {
    throw new Error(`Failed to fetch page: ${error.message}`);
  }
}

/**
 * Extract race results using Gemini API
 */
async function extractResultsWithGemini(
  htmlContent: string,
  trackName: string,
  geminiKey: string
): Promise<RaceResult[]> {
  const prompt = `You are an expert at extracting horse racing results from websites.

Extract all completed race results from this Off-Track Betting webpage HTML.

Focus on extracting:
- Race number
- Winning horse name and program number
- Place and show horses
- Win/Place/Show odds
- Exacta, Trifecta, Superfecta payouts
- Pool totals (Win, Place, Show, Exacta, etc)
- Time of race
- Race conditions (distance, surface)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "track_name": "${trackName}",
    "race_number": number,
    "race_date": "YYYY-MM-DD",
    "winning_horse": "string",
    "winning_program": number,
    "winning_odds": "string",
    "place_horse": "string",
    "place_program": number,
    "place_odds": "string",
    "show_horse": "string",
    "show_program": number,
    "show_odds": "string",
    "exacta_payout": "string",
    "trifecta_payout": "string",
    "superfecta_payout": "string",
    "win_pool_total": number,
    "place_pool_total": number,
    "show_pool_total": number,
    "exacta_pool_total": number,
    "carryover": number or null,
    "time_of_race": "HH:MM",
    "race_conditions": "string (e.g., 'Thoroughbred Allowance')",
    "distance": "string (e.g., '1 1/16 miles')",
    "surface": "string (e.g., 'Dirt' or 'Turf')",
    "field_size": number
  }
]

If no results found, return an empty array: []`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiKey,  // Use header instead of URL parameter (SECURITY FIX)
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              text: htmlContent,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error("No text content in Gemini response");
  }

  const results = JSON.parse(textContent);
  return Array.isArray(results) ? results : [];
}

/**
 * Save results to Supabase
 */
async function saveResults(
  supabase: any,
  results: RaceResult[],
  sourceUrl: string
): Promise<number> {
  if (results.length === 0) {
    return 0;
  }

  const now = new Date().toISOString();

  // Transform results for database
  const dbRecords = results.map((result) => ({
    track_name: result.track_name,
    race_number: result.race_number,
    race_date: result.race_date,
    results_data: JSON.stringify({
      winning_horse: result.winning_horse,
      winning_program: result.winning_program,
      winning_odds: result.winning_odds,
      place_horse: result.place_horse,
      place_program: result.place_program,
      place_odds: result.place_odds,
      show_horse: result.show_horse,
      show_program: result.show_program,
      show_odds: result.show_odds,
      exacta_payout: result.exacta_payout,
      trifecta_payout: result.trifecta_payout,
      superfecta_payout: result.superfecta_payout,
      pool_totals: {
        win: result.win_pool_total,
        place: result.place_pool_total,
        show: result.show_pool_total,
        exacta: result.exacta_pool_total,
        carryover: result.carryover,
      },
      time_of_race: result.time_of_race,
      race_conditions: result.race_conditions,
      distance: result.distance,
      surface: result.surface,
      field_size: result.field_size,
    }),
    source_url: sourceUrl,
    created_at: now,
    updated_at: now,
  }));

  // Upsert to handle duplicates
  const { data, error } = await supabase
    .from("race_results")
    .upsert(dbRecords, {
      onConflict: "track_name,race_number,race_date",
    })
    .select();

  if (error) {
    throw new Error(`Failed to save results: ${error.message}`);
  }

  return data ? data.length : 0;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const body = await req.json();
    const { url, track_name: trackName } = body;

    // SECURITY FIX: Validate input before processing
    if (!url || typeof url !== "string" || !url.startsWith("https://")) {
      return new Response(
        JSON.stringify({ error: "Valid HTTPS URL required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!trackName || typeof trackName !== "string" || trackName.length === 0 || trackName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Valid track name required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Scraping race results from ${trackName}`);

    // Fetch webpage
    const htmlContent = await fetchWebPageContent(url);

    // Extract results with Gemini
    const results = await extractResultsWithGemini(
      htmlContent,
      trackName,
      geminiApiKey
    );

    console.log(`Extracted ${results.length} race results`);

    // Save to database
    const savedCount = await saveResults(supabase, results, url);

    console.log(`Saved ${savedCount} race results to database`);

    return new Response(
      JSON.stringify({
        status: "ok",
        records_scraped: savedCount,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] ${errorMsg}`);  // Log full error server-side
    // SECURITY FIX: Don't leak internal error details to client
    return new Response(
      JSON.stringify({
        status: "error",
        error: "Failed to scrape race results. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
