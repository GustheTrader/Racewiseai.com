import { Horse, Race, Track } from './types';

export interface MockData {
  horses: Horse[];
  races: Race[];
  tracks: Track[];
}

// This creates a compatible interface with the old getMockData function
export const createMockDataStructure = (horses: Horse[], races: Race[], tracks: Track[]): MockData => {
  return {
    horses,
    races,
    tracks
  };
};

// Helper to get current race data
export const getCurrentRaceData = (races: Race[], trackName: string, raceNumber: number) => {
  return races.find(race => 
    race.track_name === trackName && race.number === raceNumber
  );
};

// Helper to get horses for a specific race
export const getHorsesForRace = (races: Race[], trackName: string, raceNumber: number): Horse[] => {
  const race = getCurrentRaceData(races, trackName, raceNumber);
  return race?.horses || [];
};

// Helper to get available tracks
export const getAvailableTracks = (tracks: Track[]): string[] => {
  return tracks.map(track => track.name);
};

// Helper to get race numbers for a track
export const getRaceNumbersForTrack = (races: Race[], trackName: string): number[] => {
  return races
    .filter(race => race.track_name === trackName)
    .map(race => race.number)
    .sort((a, b) => a - b);
};