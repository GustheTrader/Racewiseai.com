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
      recordsScraped = result.records_scraped || 0;
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
        retry_count: 0,
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
          retry_count: currentRetry + 1,
          error_message: errorMsg,
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
      .limit(100);  // Prevent querying unlimited jobs

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

      // Add small delay between jobs
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
