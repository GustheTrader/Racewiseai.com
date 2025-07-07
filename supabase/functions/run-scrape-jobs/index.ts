
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { corsHeaders, SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.ts";
import { scrapeOdds } from "./scrape-odds.ts";
import { scrapeWillPays } from "./scrape-will-pays.ts";
import { scrapeResults } from "./scrape-results.ts";
import { scrapeEntries } from "./scrape-entries.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log("=== Starting scrape job runner ===");
    console.log("Checking for pending scrape jobs...");
    
    // Get request data
    const requestData = await req.json().catch(() => ({}));
    
    // Extract job specific details
    const jobId = requestData?.jobId;
    const jobType = requestData?.jobType;
    const trackName = requestData?.trackName;
    const url = requestData?.url;
    const forcedRun = requestData?.force === true;
    
    console.log(`Request data: ${JSON.stringify(requestData)}`);
    
    // Special case for entries scraping
    if (jobType === 'entries' && trackName && url) {
      console.log(`Manual entries scraping for ${trackName} from ${url}`);
      try {
        const entriesResult = await scrapeEntries(url, trackName, supabase);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully scraped entries for ${trackName}`,
            data: entriesResult
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error(`Error scraping entries for ${trackName}:`, error);
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
    }
    
    // If jobId is provided, only get that specific job
    let jobsQuery = supabase
      .from('scrape_jobs')
      .select('*')
      .eq('is_active', true);
    
    if (jobId) {
      console.log(`Processing specific job: ${jobId}`);
      jobsQuery = jobsQuery.eq('id', jobId);
    } else if (!forcedRun) {
      // Get jobs that are due to run (next_run_at <= current time)
      jobsQuery = jobsQuery.lte('next_run_at', new Date().toISOString());
    }
    
    // Order by next_run_at to prioritize most overdue jobs
    const { data: jobs, error: jobsError } = await jobsQuery.order('next_run_at');
    
    if (jobsError) {
      console.error("Error fetching scrape jobs:", jobsError);
      throw jobsError;
    }
    
    if (!jobs || jobs.length === 0) {
      console.log("No pending scrape jobs found.");
      return new Response(
        JSON.stringify({ success: true, message: "No pending scrape jobs" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${jobs.length} jobs to process: ${jobs.map(j => j.id).join(', ')}`);
    
    const results = [];
    
    // Process each job
    for (const job of jobs) {
      console.log(`Processing job: ${job.id} (${job.job_type}) for ${job.track_name}`);
      console.log(`URL: "${job.url || 'No URL provided'}"`);
      
      try {
        // Generate default URL if none provided
        let jobUrl = job.url;
        if (!jobUrl || jobUrl.trim() === '') {
          // Generate a default URL based on track and job type
          const trackSlug = job.track_name.toLowerCase().replace(/\s+/g, '-');
          jobUrl = `https://www.offtrackbetting.com/tracks/${trackSlug}`;
          console.log(`No URL provided, using default: ${jobUrl}`);
        }
        
        // Update job status to "running"
        await supabase
          .from('scrape_jobs')
          .update({ status: 'running' })
          .eq('id', job.id);
        
        let jobResult;
        
        // Execute the job based on its type
        switch (job.job_type) {
          case 'odds':
            console.log(`Scraping odds for ${job.track_name}`);
            jobResult = await scrapeOdds(jobUrl, job.track_name, supabase);
            break;
          case 'will_pays':
            console.log(`Scraping will-pays for ${job.track_name}`);
            jobResult = await scrapeWillPays(jobUrl, job.track_name, supabase);
            break;
          case 'results':
            console.log(`Scraping results for ${job.track_name}`);
            jobResult = await scrapeResults(jobUrl, job.track_name, supabase);
            break;
          case 'entries':
            console.log(`Scraping entries for ${job.track_name}`);
            jobResult = await scrapeEntries(jobUrl, job.track_name, supabase);
            break;
          default:
            throw new Error(`Unknown job type: ${job.job_type}`);
        }
        
        // Calculate next run time
        const nextRunAt = new Date();
        nextRunAt.setSeconds(nextRunAt.getSeconds() + job.interval_seconds);
        
        console.log(`Job ${job.id} completed successfully. Next run at: ${nextRunAt.toISOString()}`);
        
        // Update job status to "completed" and set next_run_at
        await supabase
          .from('scrape_jobs')
          .update({ 
            status: 'completed', 
            last_run_at: new Date().toISOString(),
            next_run_at: nextRunAt.toISOString()
          })
          .eq('id', job.id);
        
        results.push({ 
          id: job.id, 
          type: job.job_type, 
          track: job.track_name,
          success: true, 
          data: jobResult,
          message: `Successfully scraped ${job.job_type} data for ${job.track_name}`
        });
        
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        
        // Calculate next run time even for failed jobs
        const nextRunAt = new Date();
        nextRunAt.setSeconds(nextRunAt.getSeconds() + job.interval_seconds);
        
        console.log(`Job ${job.id} failed. Next run at: ${nextRunAt.toISOString()}`);
        
        // Update job status to "failed"
        await supabase
          .from('scrape_jobs')
          .update({ 
            status: 'failed', 
            last_run_at: new Date().toISOString(),
            next_run_at: nextRunAt.toISOString()
          })
          .eq('id', job.id);
        
        results.push({ 
          id: job.id, 
          type: job.job_type, 
          track: job.track_name,
          success: false, 
          error: error.message,
          message: `Failed to scrape ${job.job_type} data for ${job.track_name}: ${error.message}`
        });
      }
    }
    
    console.log(`Job processing complete. Results: ${JSON.stringify(results)}`);
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in scrape job runner:", error);
    
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
