// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://racewiseai.com",
  "https://www.racewiseai.com",
  "https://app.racewiseai.com",
];

function getCorsHeaders(origin?: string): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
}

interface TrackSchedule {
  [track: string]: string[];
}

// Define which tracks run on which days
const TRACK_SCHEDULE: TrackSchedule = {
  "CHURCHILL DOWNS": ["Thursday", "Friday", "Saturday", "Sunday"],
  "BELMONT PARK": ["Thursday", "Friday", "Saturday", "Sunday"],
  "AQUEDUCT": ["Friday", "Saturday", "Sunday"],
  "GULFSTREAM": ["Thursday", "Friday", "Saturday", "Sunday"],
  "DEL MAR": ["Friday", "Saturday", "Sunday"],
  "KEENELAND": ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "KENTUCKY DOWNS": ["Saturday", "Sunday"],
  "OAKLAWN PARK": ["Friday", "Saturday", "Sunday"],
  "PIMLICO": ["Friday", "Saturday", "Sunday"],
  "LOS ALAMITOS-DAY": ["Saturday", "Sunday"],
  "LOS ALAMITOS-NIGHT": ["Friday", "Saturday"],
  "SARATOGA": ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "SANTA ANITA": ["Friday", "Saturday", "Sunday"],
};

/**
 * Generate morning report for racing activities
 * - Triggered at 8 AM PST daily via cron job
 * - Identifies which tracks are running today
 * - Creates morning data scraping jobs
 * - Sends report to admin users
 */
async function generateMorningReport(
  supabase: any
): Promise<{ tracksRunning: string[]; jobsCreated: number; report: string }> {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const tracksRunning: string[] = [];

  // Find all tracks running today
  for (const [track, days] of Object.entries(TRACK_SCHEDULE)) {
    if (days.includes(today)) {
      tracksRunning.push(track);
    }
  }

  console.log(`[MORNING REPORT] Today is ${today}`);
  console.log(`[MORNING REPORT] Running tracks: ${tracksRunning.join(", ")}`);

  let jobsCreated = 0;

  // Create morning scraping jobs for each running track
  for (const track of tracksRunning) {
    try {
      // Check if a morning entries job already exists for today
      const { data: existingJob, error: checkError } = await supabase
        .from("scrape_jobs")
        .select("id")
        .eq("track_name", track)
        .eq("job_type", "entries")
        .eq("is_active", true)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking existing job for ${track}:`, checkError);
        continue;
      }

      // Create job if it doesn't exist
      if (!existingJob) {
        const { error: insertError } = await supabase
          .from("scrape_jobs")
          .insert({
            url: `https://app.offtrackbetting.com/#/lobby/live-racing?programName=${track
              .toLowerCase()
              .replace(/\s+/g, "-")}`,
            track_name: track,
            job_type: "entries",
            status: "pending",
            interval_seconds: 3600,  // Run every hour
            is_active: true,
            next_run_at: new Date().toISOString(),
            retry_count: 0,
            max_retries: 3,
            created_by: "system",
          });

        if (insertError) {
          console.error(`Error creating job for ${track}:`, insertError);
        } else {
          jobsCreated++;
          console.log(`[MORNING REPORT] Created job for ${track}`);
        }
      }
    } catch (error) {
      console.error(`Failed to create job for ${track}:`, error);
    }
  }

  const reportMessage = `
🏇 MORNING REPORT - ${new Date().toISOString().split("T")[0]}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Today: ${today}

🏁 Racing Tracks Running Today: ${tracksRunning.length}
${tracksRunning.map((t) => `   ✓ ${t}`).join("\n")}

📊 Jobs Created: ${jobsCreated}
${jobsCreated > 0 ? `   ✓ ${jobsCreated} morning scraping jobs scheduled` : "   ✗ No new jobs needed"}

⏰ Report Generated: ${new Date().toISOString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  console.log(reportMessage);

  // Store report in database
  try {
    await supabase.from("admin_reports").insert({
      report_type: "morning_report",
      report_date: new Date().toISOString().split("T")[0],
      content: reportMessage,
      tracks_running: tracksRunning,
      jobs_created: jobsCreated,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to store report:", error);
  }

  return {
    tracksRunning,
    jobsCreated,
    report: reportMessage,
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET and POST
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Verify Bearer token for POST requests
    if (req.method === "POST") {
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Unauthorized - Bearer token required" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Check if this is a cron job request (has specific header)
    const isCronJob = req.headers.get("x-cron-job") === "true";

    // Verify cron job signature if provided
    if (isCronJob) {
      const cronSignature = req.headers.get("x-cron-signature");
      const expectedSignature = Deno.env.get("CRON_JOB_SECRET");

      if (!expectedSignature || cronSignature !== expectedSignature) {
        console.warn("[SECURITY] Invalid cron signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Verify it's exactly 8 AM PST (or within 1 hour)
    const now = new Date();
    const pstTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );
    const hourPST = pstTime.getHours();

    console.log(`[MORNING REPORT] Current PST time: ${pstTime.toISOString()}`);
    console.log(`[MORNING REPORT] Hour: ${hourPST}`);

    // Allow execution between 8 AM and 9 AM PST
    if (hourPST < 8 || hourPST >= 9) {
      return new Response(
        JSON.stringify({
          status: "skipped",
          reason: "Outside of 8 AM PST execution window",
          currentHourPST: hourPST,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate morning report
    const result = await generateMorningReport(supabase);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[ERROR]", errorMsg);

    return new Response(
      JSON.stringify({
        status: "error",
        error: "Failed to generate morning report. Please try again later.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
