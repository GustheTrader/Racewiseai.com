
import { formatTime } from './formatters';
import { Horse, MockData } from './types';
import { generateHorses, updateOdds } from './data/horses';
import { generatePoolData, generateExoticPools } from './data/pools';
import { generatePaceData } from './data/pace';
import { generateSharpMovements } from './data/movements';
import { generateBettingTimeline } from './data/betting';
import { generateTrainingFigures } from './data/training';
import { generateTrackProfile } from './data/track';
import { generateHorseComments } from './data/comments';
import { generatePaddockComments } from './data/paddock';
import { generateValuePicks, generatePick3Combos } from './data/ai-thorian';

// Store the mock data in memory so we can update it
let mockData: MockData = {
  horses: generateHorses(),
  poolData: generatePoolData(),
  exoticPools: generateExoticPools(),
  paceData: generatePaceData(),
  sharpMovements: generateSharpMovements(),
  bettingTimeline: generateBettingTimeline(),
  trainingFigures: generateTrainingFigures(),
  trackProfile: generateTrackProfile(),
  horseComments: generateHorseComments(),
  paddockComments: generatePaddockComments(),
  valuePicks: generateValuePicks(),
  pick3Combos: generatePick3Combos(),
  lastUpdated: new Date().toLocaleTimeString()
};

// Re-export types and functions that were previously part of mockData.ts
export * from './types';
export { updateOdds } from './data/horses';

// Get the current mock data
export const getMockData = () => {
  return mockData;
};

// Update the mock data with new values
export const updateMockData = (newData: Partial<MockData>) => {
  mockData = {
    ...mockData,
    ...newData,
    lastUpdated: new Date().toLocaleTimeString()
  };
  return mockData;
};
