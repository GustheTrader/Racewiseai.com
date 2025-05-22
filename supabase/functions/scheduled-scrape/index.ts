import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

// Time-based scheduling constants (Eastern Time)
const START_HOUR_ET = 8; // 8 AM Eastern
const END_HOUR_ET = 24; // Midnight Eastern

// Morning entries scraping hours (8am, 9am, 10am Eastern)
const MORNING_ENTRIES_HOURS_ET = [8, 9, 10];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log("Starting scheduled scrape job");
    
    // Check if current time is within operating hours (Eastern Time)
    const currentTime = new Date();
    
    // Convert current time to Eastern Time
    const etOffset = -4; // EDT is UTC-4, EST is UTC-5 (adjust based on daylight savings)
    const utcHour = currentTime.getUTCHours();
    const etHour = (utcHour + 24 + etOffset) % 24; // Ensure positive hour
    
    console.log(`Current hour in ET: ${etHour}`);
    
    if (etHour < START_HOUR_ET || etHour >= END_HOUR_ET) {
      console.log("Outside of operating hours (8 AM - Midnight ET). Skipping execution.");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Outside of operating hours (8 AM - Midnight ET). Skipping execution." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let requestData = {};
    try {
      requestData = await req.json();
    } catch (e) {
      // If no JSON, use empty object
      console.log("No request body or invalid JSON");
    }
    
    // Get the job ID if specified
    const jobId = requestData?.jobId;
    const forceRun = requestData?.force === true;
    const jobType = requestData?.jobType;
    
    // Check if we should run morning entries scrape (8am, 9am, 10am Eastern)
    const isEntriesHour = MORNING_ENTRIES_HOURS_ET.includes(etHour);
    
    // Determine which job types to process in this run
    // For high-frequency jobs (odds, will_pays) run every minute
    // For results jobs, run every 15 minutes
    const currentMinute = currentTime.getMinutes();
    const isFullRunMinute = currentMinute % 15 === 0;
    
    console.log(`Current minute: ${currentMinute}, Is 15-minute mark: ${isFullRunMinute}, Is entries hour: ${isEntriesHour}`);
    
    // If it's one of the morning entries scraping hours, trigger entries jobs
    if (isEntriesHour && currentMinute === 0 && !jobId && !jobType) {
      console.log(`Morning entries scraping time (${etHour}:00 ET). Running entries scrape jobs.`);
      
      // Get all active tracks to scrape entries for
      const { data: activeTracks, error: tracksError } = await supabase
        .from('scrape_jobs')
        .select('track_name')
        .eq('is_active', true)
        .order('track_name')
        .distinct();
      
      if (tracksError) {
        console.error("Error fetching active tracks:", tracksError);
      } else if (activeTracks && activeTracks.length > 0) {
        console.log(`Found ${activeTracks.length} active tracks for entries scraping`);
        
        // Process each track
        const entriesResults = [];
        for (const trackObj of activeTracks) {
          const trackName = trackObj.track_name;
          console.log(`Processing entries for track: ${trackName}`);
          
          try {
            // Generate URL for this track's entries
            const trackSlug = trackName.toLowerCase().replace(/\s+/g, '-');
            const entriesUrl = `https://app.offtrackbetting.com/#/lobby/live-racing?programName=${trackSlug}&entries=true`;
            
            // Call the run-scrape-jobs function with entries scrape parameters
            const { data: scrapeResult, error: scrapeError } = await supabase.functions.invoke('run-scrape-jobs', {
              body: { 
                jobType: 'entries',
                trackName: trackName,
                url: entriesUrl,
                force: true
              }
            });
            
            if (scrapeError) {
              throw scrapeError;
            }
            
            entriesResults.push({
              track: trackName,
              success: true,
              message: `Successfully scraped entries for ${trackName}`
            });
            
          } catch (error) {
            console.error(`Error scraping entries for ${trackName}:`, error);
            entriesResults.push({
              track: trackName,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
        
        console.log(`Completed entries scraping with results:`, entriesResults);
      }
    }
    
    // Import track schedule from config
    import { TRACK_SCHEDULE, formatTrackUrl, isTrackRunningToday } from "../run-scrape-jobs/config.ts";

    // Start with base query for active jobs
    let jobsQuery = supabase.from('scrape_jobs')
      .select('*')
      .eq('is_active', true);

    // If no specific job is requested, filter by today's running tracks
    if (!jobId && !forceRun && !jobType) {
      // Get the jobs for tracks that are running today
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      // Build an array of track names that run today
      const todaysTracks = Object.entries(TRACK_SCHEDULE)
        .filter(([_, days]) => days.includes(today))
        .map(([track, _]) => track);
      
      console.log(`Tracks running today (${today}): ${todaysTracks.join(', ')}`);
      
      if (todaysTracks.length > 0) {
        jobsQuery = jobsQuery.in('track_name', todaysTracks);
      }
      
      // Then apply the usual time-based filters
      if (isFullRunMinute) {
        // At 15-minute intervals, run all job types that are due
        console.log("Running full 15-minute interval jobs including results");
        jobsQuery = jobsQuery.lte('next_run_at', currentTime.toISOString());
      } else {
        // At other minutes, only run odds and will_pays jobs
        console.log("Running high-frequency jobs (odds, will_pays) only");
        jobsQuery = jobsQuery
          .in('job_type', ['odds', 'will_pays'])
          .lte('next_run_at', currentTime.toISOString());
      }
    }
    
    // If job ID is provided, only get that specific job
    if (jobId) {
      console.log(`Processing specific job: ${jobId}`);
      jobsQuery = jobsQuery.eq('id', jobId);
    } else if (jobType) {
      // If job type is specified
      console.log(`Processing specific job type: ${jobType}`);
      jobsQuery = jobsQuery.eq('job_type', jobType);
    } else if (!forceRun) {
      // Apply different scheduling logic based on job type
      if (isFullRunMinute) {
        // At 15-minute intervals, run all job types that are due
        console.log("Running full 15-minute interval jobs including results");
        jobsQuery = jobsQuery.lte('next_run_at', currentTime.toISOString());
      } else {
        // At other minutes, only run odds and will_pays jobs
        console.log("Running high-frequency jobs (odds, will_pays) only");
        jobsQuery = jobsQuery
          .in('job_type', ['odds', 'will_pays'])
          .lte('next_run_at', currentTime.toISOString());
      }
    }
    
    // Get jobs to process
    const { data: jobs, error: jobsError } = await jobsQuery.order('next_run_at');
    
    if (jobsError) {
      throw jobsError;
    }
    
    if (!jobs || jobs.length === 0) {
      console.log("No pending scrape jobs to process");
      return new Response(
        JSON.stringify({ success: true, message: "No pending scrape jobs to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${jobs.length} scrape jobs to process`);
    
    const results = [];
    
    // Process each job
    for (const job of jobs) {
      console.log(`Processing job: ${job.id} for ${job.track_name} (${job.job_type})`);
      
      try {
        // Update job status to "running"
        await supabase
          .from('scrape_jobs')
          .update({ status: 'running' })
          .eq('id', job.id);
        
        // Generate URL if none provided
        let jobUrl = job.url;
        if (!jobUrl || jobUrl.trim() === '') {
          // Generate a default URL based on track and job type
          const trackSlug = job.track_name.toLowerCase().replace(/\s+/g, '-');
          jobUrl = `https://app.offtrackbetting.com/#/lobby/live-racing?programName=${trackSlug}`;
          if (job.race_number) {
            jobUrl += `&raceNumber=${job.race_number}`;
          }
          console.log(`Using generated URL: ${jobUrl}`);
        }
        
        // Call the run-scrape-jobs function with the job parameters
        const { data: scrapeResult, error: scrapeError } = await supabase.functions.invoke('run-scrape-jobs', {
          body: { 
            jobId: job.id,
            force: true
          }
        });
        
        if (scrapeError) {
          throw scrapeError;
        }
        
        // Set different scheduling intervals based on job type
        let intervalSeconds = job.interval_seconds;
        
        // If we're overriding the schedule, use 60 seconds for odds/will_pays and 15 minutes for results
        if (!jobId && !forceRun) {
          if (job.job_type === 'odds' || job.job_type === 'will_pays') {
            intervalSeconds = 60; // Every minute for odds and will_pays
          } else if (job.job_type === 'results') {
            intervalSeconds = 900; // Every 15 minutes for results
          }
        }
        
        // Calculate next run time
        const nextRunAt = new Date();
        nextRunAt.setSeconds(nextRunAt.getSeconds() + intervalSeconds);
        
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
          race: job.race_number || 'all',
          success: true,
          message: `Successfully scraped ${job.job_type} for ${job.track_name}`
        });
        
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        
        // Calculate next run time even for failed jobs
        const nextRunAt = new Date();
        nextRunAt.setSeconds(nextRunAt.getSeconds() + job.interval_seconds);
        
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
          race: job.race_number || 'all',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in scheduled scrape:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
