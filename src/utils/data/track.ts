
import { TrackStatistics, PostPosition, TrackTiming } from '../types';

// Generate track profile data
export const generateTrackProfile = () => {
  return {
    statistics: {
      totalRaces: 19,
      frontRunnerWin: 7,
      pressersWin: 3,
      midPackWin: 7,
      closersWin: 2,
      frontRunnerPercentage: 36.8,
      pressersPercentage: 15.8,
      midPackPercentage: 36.8,
      closersPercentage: 10.5,
    } as TrackStatistics,
    postPositions: [
      { position: 1, count: 3, percentage: 15.8 },
      { position: 2, count: 2, percentage: 10.5 },
      { position: 3, count: 1, percentage: 5.3 },
      { position: 4, count: 2, percentage: 10.5 },
      { position: 5, count: 4, percentage: 21.1 },
      { position: 6, count: 0, percentage: 0 },
      { position: 7, count: 3, percentage: 15.8 },
      { position: 8, count: 1, percentage: 5.3 },
    ] as PostPosition[],
    timings: [
      { distance: '6f', bestTime: '1:09.2', averageTime: '1:11.5' },
      { distance: '1m', bestTime: '1:35.7', averageTime: '1:37.2' },
      { distance: '1 1/8m', bestTime: '1:48.4', averageTime: '1:50.6' },
    ] as TrackTiming[],
  };
};
