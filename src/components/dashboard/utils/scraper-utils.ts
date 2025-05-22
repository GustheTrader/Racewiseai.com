
import { TRACK_OPTIONS } from '@/types/ScraperTypes';

/**
 * Formats a URL for offtrackbetting.com based on track name and optional race number
 * @param trackName The name of the track
 * @param raceNumber Optional race number
 * @returns Formatted URL
 */
export function formatOTBUrl(trackName: string, raceNumber?: number): string {
  // Normalize track name to match the format used by OTB
  const normalizedTrackName = trackName.toLowerCase().replace(/\s+/g, '-');
  
  // Base URL for OTB's live racing section
  let url = `https://app.offtrackbetting.com/#/lobby/live-racing?programName=${normalizedTrackName}`;
  
  // Add race number if provided
  if (raceNumber) {
    url += `&raceNumber=${raceNumber}`;
  }
  
  return url;
}

/**
 * Gets a readable name for a track based on its code
 * @param trackCode The track code (e.g., "CHURCHILL DOWNS")
 * @returns The readable track name
 */
export function getTrackReadableName(trackCode: string): string {
  const track = TRACK_OPTIONS.find(t => t.value === trackCode);
  return track ? track.label : trackCode;
}

/**
 * Checks if a track is running today based on a weekly schedule
 * @param trackName The name of the track
 * @param schedule The weekly schedule for tracks
 * @returns Boolean indicating if the track is running today
 */
export function isTrackRunningToday(trackName: string, schedule: Record<string, string[]>): boolean {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const trackDays = schedule[trackName] || [];
  return trackDays.includes(today);
}

/**
 * Gets the next race day for a track
 * @param trackName The name of the track
 * @param schedule The weekly schedule for tracks
 * @returns The next day the track is running, or null if not found
 */
export function getNextRaceDay(trackName: string, schedule: Record<string, string[]>): string | null {
  const trackDays = schedule[trackName] || [];
  if (trackDays.length === 0) return null;
  
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  
  // Convert track days to day indices
  const trackDayIndices = trackDays.map(day => weekdays.indexOf(day));
  
  // Find the next day that has racing
  for (let i = 1; i <= 7; i++) {
    const checkDay = (today + i) % 7;
    if (trackDayIndices.includes(checkDay)) {
      return weekdays[checkDay];
    }
  }
  
  return trackDays[0]; // Fallback to first scheduled day
}
