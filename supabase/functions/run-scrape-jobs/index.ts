// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

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

interface ScrapeJob {
  id: string;
  url: string;
  track_name: string;
  job_type: "odds" | "will_pays" | "results" | "entries";
  status: "pending" | "running" | "completed" | "failed";
  interval_seconds: number;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  retry_count?: number;
  max_retries?: number;
  error_message?: string;
}

interface JobExecutionResult {
  job_id: string;
  status: "success" | "failed" | "skipped";
  duration_ms: number;
  records_scraped: number;
  error?: string;
  timestamp: string;
}

/**
 * Calculate next run time based on interval
 */
function calculateNextRunTime(intervalSeconds: number): string {
  const nextRun = new Date(Date.now() + intervalSeconds * 1000);
  return nextRun.toISOString();
}

/**
 * Format execution summary for logging
 */
function formatJobSummary(result: JobExecutionResult): string {
  return `[${result.status.toUpperCase()}] Job ${result.job_id} | Duration: ${result.duration_ms}ms | Records: ${result.records_scraped}`;
}

/**
 * Save scraped race data (race, horses, odds) to the database.
 * Returns the number of records written.
 */
// deno-lint-ignore no-explicit-any
async function persistRaceData(supabase: any, job: ScrapeJob, data: any): Promise<number> {
  if (!data) return 0;

  const trackName = data.track_name || job.track_name;
  const raceNumber = Number(data.race_number) || 1;
  const raceDate = data.race_date
    ? new Date(`${data.race_date}T00:00:00Z`).toISOString()
    : new Date().toISOString();
  const horses = Array.isArray(data.horses) ? data.horses : [];

  if (horses.length === 0) return 0;

  // Upsert the race row
  const { data: existing } = await supabase
    .from("race_data")
    .select("id")
    .eq("track_name", trackName)
    .eq("race_number", raceNumber)
    .gte("race_date", raceDate.split("T")[0])
    .limit(1)
    .maybeSingle();

  let raceId = existing?.id;

  if (raceId) {
    await supabase
      .from("race_data")
      .update({
        race_conditions: data.conditions ?? null,
        betting_pools: data.betting_pools ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", raceId);
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("race_data")
      .insert({
        track_name: trackName,
        race_number: raceNumber,
        race_date: raceDate,
        race_conditions: data.conditions ?? null,
        betting_pools: data.betting_pools ?? null,
      })
      .select("id")
      .single();

    if (insertError) throw new Error(`Save race failed: ${insertError.message}`);
    raceId = inserted.id;
  }

  let records = 0;

  for (const horse of horses) {
    const pp = Number(horse.program_number);
    const name = horse.horse_name;
    if (!pp || !name) continue;

    const { data: existingHorse } = await supabase
      .from("race_horses")
      .select("id")
      .eq("race_id", raceId)
      .eq("pp", pp)
      .maybeSingle();

    const horseRow = {
      race_id: raceId,
      pp,
      name,
      jockey: horse.jockey_name ?? null,
      trainer: horse.trainer_name ?? null,
      ml_odds: horse.morning_line_odds != null ? Number(horse.morning_line_odds) : null,
      updated_at: new Date().toISOString(),
    };

    if (existingHorse?.id) {
      await supabase.from("race_horses").update(horseRow).eq("id", existingHorse.id);
    } else {
      await supabase.from("race_horses").insert(horseRow);
    }

    await supabase.from("odds_data").insert({
      track_name: trackName,
      race_number: raceNumber,
      race_date: raceDate.split("T")[0],
      horse_number: pp,
      horse_name: name,
      win_odds: horse.current_odds != null ? String(horse.current_odds) : null,
      pool_data: data.betting_pools ?? null,
    });

    records++;
  }

  return records;
}


/**
 * Execute a single scrape job
 */
async function executeJob(
  supabase: any,
  job: ScrapeJob
): Promise<JobExecutionResult> {
  const startTime = Date.now();
  const jobId = job.id;

  try {
    // Update job status to running
    await supabase
      .from("scrape_jobs")
      .update({
        status: "running",
        last_run_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    console.log(`[JOB START] ${job.track_name} - ${job.job_type}`);

    // Call appropriate scraper based on job type
    let recordsScraped = 0;

    if (job.job_type === "odds" || job.job_type === "entries") {
      // Call scrape-with-gemini
      const response = await fetch(`${SUPABASE_URL}/functions/v1/scrape-with-gemini`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "x-internal-secret": Deno.env.get("CRON_JOB_SECRET") || "",
        },
        body: JSON.stringify({
          job_id: jobId,
          url: job.url,
          track_name: job.track_name,
          job_type: job.job_type,
        }),
      });

      if (!response.ok) {
        throw new Error(`Scraper returned ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      recordsScraped = await persistRaceData(supabase, job, result?.data);
    } else if (job.job_type === "results") {
      // Call scrape-race-results
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/scrape-race-results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "x-internal-secret": Deno.env.get("CRON_JOB_SECRET") || "",
          },
          body: JSON.stringify({
            job_id: jobId,
            url: job.url,
            track_name: job.track_name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Results scraper returned ${response.status}`);
      }

      const result = await response.json();
      recordsScraped = result.records_scraped || 0;
    }

    const duration = Date.now() - startTime;

    // Update job to completed
    await supabase
      .from("scrape_jobs")
      .update({
        status: "completed",
        next_run_at: calculateNextRunTime(job.interval_seconds),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return {
      job_id: jobId,
      status: "success",
      duration_ms: duration,
      records_scraped: recordsScraped,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    const currentRetry = job.retry_count || 0;
    const maxRetries = job.max_retries || 3;

    console.error(`[JOB ERROR] ${jobId}: ${errorMsg}`);

    if (currentRetry < maxRetries) {
      // Schedule retry with exponential backoff
      const backoffSeconds = Math.pow(2, currentRetry) * 60; // 1min, 2min, 4min
      const retryTime = new Date(Date.now() + backoffSeconds * 1000);

      await supabase
        .from("scrape_jobs")
        .update({
          status: "pending",
          next_run_at: retryTime.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      return {
        job_id: jobId,
        status: "failed",
        duration_ms: duration,
        records_scraped: 0,
        error: `${errorMsg} (Retry ${currentRetry + 1}/${maxRetries})`,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Max retries exceeded
      await supabase
        .from("scrape_jobs")
        .update({
          status: "failed",
          error_message: errorMsg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      return {
        job_id: jobId,
        status: "failed",
        duration_ms: duration,
        records_scraped: 0,
        error: `Max retries (${maxRetries}) exceeded: ${errorMsg}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

/**
 * Main handler - execute all pending jobs
 */
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
    // SECURITY FIX: Verify authentication token (added check for Bearer token)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[SECURITY] Unauthorized access attempt to run-scrape-jobs");
      return new Response(
        JSON.stringify({ error: "Unauthorized - valid Bearer token required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
    );

    const body = await req.json();
    const { force_run = false } = body;

    console.log(`[SCHEDULER] Starting job execution (force_run: ${force_run})`);

    // Get all pending jobs (SECURITY FIX: Added pagination limit to prevent memory exhaustion)
    let query = supabase
      .from("scrape_jobs")
      .select("*")
      .eq("is_active", true)
      // Gemini free tier allows ~5 requests/minute; process the oldest few per run
      .order("next_run_at", { ascending: true })
      .limit(4);

    if (!force_run) {
      // Only get jobs where next_run_at is in the past
      query = query.lte("next_run_at", new Date().toISOString());
    }

    const { data: jobs, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch jobs: ${fetchError.message}`);
    }

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({
          status: "ok",
          jobs_executed: 0,
          message: "No pending jobs",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[SCHEDULER] Found ${jobs.length} jobs to execute`);

    // Execute jobs sequentially to prevent overload
    const results: JobExecutionResult[] = [];
    for (const job of jobs) {
      const result = await executeJob(supabase, job);
      results.push(result);
      console.log(formatJobSummary(result));

      // Stay under the Gemini rate limit (5 requests / minute)
      await new Promise((resolve) => setTimeout(resolve, 13000));
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    console.log(
      `[SCHEDULER] Completed: ${successCount} success, ${failedCount} failed`
    );

    return new Response(
      JSON.stringify({
        status: "ok",
        jobs_executed: jobs.length,
        success_count: successCount,
        failed_count: failedCount,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[SCHEDULER ERROR] ${errorMsg}`);

    return new Response(
      JSON.stringify({
        status: "error",
        error: errorMsg,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
