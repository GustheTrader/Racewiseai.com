
// CORS headers - restricted to specific origins for security
// In production, only allow your domain
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // local development
  'http://localhost:3000',  // alternative local port
  'https://racewiseai.com',
  'https://www.racewiseai.com',
  'https://app.racewiseai.com',
];

export function getCorsHeaders(origin?: string): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.some(allowed =>
    allowed === origin || (origin.includes('localhost') && allowed.includes('localhost'))
  );

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}

// Environment variables
export const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
export const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

// OTB site credentials - MUST be set in environment variables
export const OTB_USERNAME = Deno.env.get("OTB_USERNAME") || "";
export const OTB_PASSWORD = Deno.env.get("OTB_PASSWORD") || "";

// Validate that credentials are configured
if (!OTB_USERNAME || !OTB_PASSWORD) {
  throw new Error("OTB_USERNAME and OTB_PASSWORD environment variables must be configured");
}

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
