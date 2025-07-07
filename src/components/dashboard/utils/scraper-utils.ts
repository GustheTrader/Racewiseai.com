// Utility functions for scraper operations

/**
 * Formats an Off Track Betting URL for a specific track and race number
 */
export const formatOTBUrl = (trackName: string, raceNumber: number): string => {
  // Convert track name to format expected by OTB
  const formattedTrack = trackName.toUpperCase().replace(/\s+/g, '-');
  
  // Base OTB URL structure - this is a placeholder that might need adjustment
  // based on the actual OTB URL structure
  const baseUrl = 'https://app.offtrackbetting.com';
  
  // Format the URL with track and race parameters
  return `${baseUrl}/#/lobby/live-racing/${formattedTrack}/race/${raceNumber}`;
};

/**
 * Validates if a URL is a valid OTB results URL
 */
export const isValidOTBUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('offtrackbetting.com');
  } catch {
    return false;
  }
};

/**
 * Extracts track name and race number from an OTB URL if possible
 */
export const parseOTBUrl = (url: string): { trackName?: string; raceNumber?: number } => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.hash.split('/');
    
    // Try to extract track and race info from URL structure
    const trackIndex = pathParts.findIndex(part => part === 'live-racing');
    if (trackIndex >= 0 && pathParts.length > trackIndex + 2) {
      const trackName = pathParts[trackIndex + 1]?.replace(/-/g, ' ');
      const raceIndex = pathParts.findIndex(part => part === 'race');
      const raceNumber = raceIndex >= 0 ? parseInt(pathParts[raceIndex + 1]) : undefined;
      
      return {
        trackName: trackName ? trackName.toUpperCase() : undefined,
        raceNumber: !isNaN(raceNumber!) ? raceNumber : undefined
      };
    }
  } catch {
    // Invalid URL
  }
  
  return {};
};