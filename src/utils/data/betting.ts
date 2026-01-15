
import { BettingDataPoint } from '../types';

// Default horse names for demo
const defaultHorses = [
  { pp: 1, name: "#1 Fast Lightning", baseOdds: 6.5 },
  { pp: 2, name: "#2 Lucky Star", baseOdds: 4.2 },
  { pp: 3, name: "#3 Thunder Bolt", baseOdds: 8.1 },
  { pp: 4, name: "#4 Silver Streak", baseOdds: 12.0 },
  { pp: 5, name: "#5 Golden Arrow", baseOdds: 5.8 },
  { pp: 6, name: "#6 Midnight Runner", baseOdds: 3.5 },
  { pp: 7, name: "#7 Wind Chaser", baseOdds: 7.2 },
  { pp: 8, name: "#8 Dark Horse", baseOdds: 9.4 },
];

// Generate betting timeline data with dynamic mock stream
export const generateBettingTimeline = (): BettingDataPoint[] => {
  const now = new Date();
  const data: BettingDataPoint[] = [];
  
  // Generate data points for the last 30 minutes with 2 minute intervals
  for (let i = 0; i < 15; i++) {
    const time = new Date(now.getTime() - (30 - i * 2) * 60000);
    const timestamp = time.getTime();
    const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
    
    // Base volume with some randomness - higher base for visibility
    const volume = Math.round(8000 + Math.random() * 20000);
    
    // Generate dynamic odds for all 8 runners
    const dataPoint: BettingDataPoint = {
      time: timeStr,
      volume,
      timestamp,
      isSpike: false,
    };
    
    // Add runner positions and odds for each horse
    defaultHorses.forEach((horse) => {
      const runnerKey = `runner${horse.pp}`;
      const oddsKey = `runner${horse.pp}Odds`;
      
      // Position value (1-8) for volume chart visualization
      dataPoint[runnerKey] = Math.floor(Math.random() * 6) + 1;
      
      // Dynamic odds with wave patterns for visible chart movement
      const primaryWave = Math.sin((i + horse.pp * 0.5) * 0.4) * 1.5;
      const secondaryWave = Math.cos((i + horse.pp * 0.3) * 0.6) * 0.8;
      const randomNoise = (Math.random() - 0.5) * 0.5;
      const trendDrift = i * 0.1 * (horse.pp % 2 === 0 ? 1 : -1);
      
      dataPoint[oddsKey] = Math.max(1.5, horse.baseOdds + primaryWave + secondaryWave + randomNoise + trendDrift);
    });
    
    data.push(dataPoint);
  }
  
  // Add spikes (large bet markers) at specific points
  const spikeIndices = [3, 7, 11];
  spikeIndices.forEach(index => {
    if (data[index]) {
      // Make this a spike with significantly higher volume
      data[index].volume = Math.round(data[index].volume * (2.5 + Math.random()));
      data[index].isSpike = true;
    }
  });
  
  return data;
};
