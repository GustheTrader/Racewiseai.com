
import { BettingDataPoint } from '../types';

// Generate betting timeline data
export const generateBettingTimeline = (): BettingDataPoint[] => {
  const now = new Date();
  const data: BettingDataPoint[] = [];
  
  // Generate data points for the last 30 minutes with 2 minute intervals
  for (let i = 0; i < 15; i++) {
    const time = new Date(now.getTime() - (30 - i * 2) * 60000);
    const timestamp = time.getTime();
    const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
    
    // Base volume with some randomness
    const volume = Math.round(5000 + Math.random() * 15000);
    
    // Generate runner positions and odds
    const runner1 = Math.floor(Math.random() * 6) + 1;
    const runner2 = Math.floor(Math.random() * 6) + 1;
    const runner3 = Math.floor(Math.random() * 6) + 1;
    const runner4 = Math.floor(Math.random() * 6) + 1;
    const runner5 = Math.floor(Math.random() * 6) + 1;
    const runner6 = Math.floor(Math.random() * 6) + 1;
    
    // Generate odds (starting around 2.0-15.0 with small fluctuations)
    const baseOdds = {
      runner1: 8.0,
      runner2: 4.5,
      runner3: 11.0,
      runner4: 15.0,
      runner5: 9.0,
      runner6: 2.2,
    };
    
    const oddsVariation = 0.3; // Maximum variation per time period
    
    data.push({ 
      time: timeStr,
      volume,
      timestamp,
      isSpike: false,
      runner1,
      runner2,
      runner3,
      runner4,
      runner5,
      runner6,
      runner1Odds: baseOdds.runner1 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
      runner2Odds: baseOdds.runner2 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
      runner3Odds: baseOdds.runner3 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
      runner4Odds: baseOdds.runner4 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
      runner5Odds: baseOdds.runner5 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
      runner6Odds: baseOdds.runner6 + (Math.random() * oddsVariation * 2 - oddsVariation) * i,
    });
  }
  
  // Add spikes at specific points
  const spikeIndices = [4, 9, 13]; // Spikes at these positions
  spikeIndices.forEach(index => {
    if (data[index]) {
      // Make this a spike with significantly higher volume
      data[index].volume = Math.round(data[index].volume * (2 + Math.random()));
      data[index].isSpike = true;
    }
  });
  
  return data;
};
