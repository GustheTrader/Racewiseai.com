
// CORS headers for cross-origin requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Environment variables
export const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
export const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

// OTB site credentials
export const OTB_USERNAME = Deno.env.get("OTB_USERNAME") || "jeffgus@gmail.com";
export const OTB_PASSWORD = Deno.env.get("OTB_PASSWORD") || "Gusboys1!";

// Track mappings for URL formatting
export const TRACK_SLUGS: Record<string, string> = {
  "CHURCHILL DOWNS": "churchill-downs",
  "BELMONT PARK": "belmont-park",
  "AQUEDUCT": "aqueduct",
  "GULFSTREAM": "gulfstream-park",
  "DEL MAR": "del-mar",
  "KEENELAND": "keeneland",
  "KENTUCKY DOWNS": "kentucky-downs",
  "OAKLAWN PARK": "oaklawn-park",
  "PIMLICO": "pimlico",
  "LOS ALAMITOS-DAY": "los-alamitos-race-course",
  "LOS ALAMITOS-NIGHT": "los-alamitos-race-course-night",
  "SARATOGA": "saratoga",
  "SANTA ANITA": "santa-anita"
};

// Weekly schedule for each track
export const TRACK_SCHEDULE: Record<string, string[]> = {
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
  "SANTA ANITA": ["Friday", "Saturday", "Sunday"]
};

// Function to format URL based on track name
export function formatTrackUrl(trackName: string, raceNumber?: number): string {
  const slug = TRACK_SLUGS[trackName] || trackName.toLowerCase().replace(/\s+/g, '-');
  let url = `https://app.offtrackbetting.com/#/lobby/live-racing?programName=${slug}`;
  
  if (raceNumber) {
    url += `&raceNumber=${raceNumber}`;
  }
  
  return url;
}

// Check if a track is running today
export function isTrackRunningToday(trackName: string): boolean {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const trackDays = TRACK_SCHEDULE[trackName] || [];
  return trackDays.includes(today);
}
