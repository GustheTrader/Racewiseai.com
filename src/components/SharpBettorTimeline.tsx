
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import BettingTimeline from './charts/BettingTimeline';
import ChartInfoPanel from './charts/ChartInfoPanel';
import RunnerLegend from './charts/RunnerLegend';
import { Horse } from '../utils/types';
import { getRunnerColorByPosition } from './charts/constants/postPositionColors';

interface BettingDataPoint {
  time: string;
  volume: number;
  timestamp: number;
  isSpike?: boolean;
  runner1?: number;
  runner2?: number;
  runner3?: number;
  runner4?: number;
  runner5?: number;
  runner6?: number;
  runner7?: number;
  runner8?: number;
  runner9?: number;
  runner10?: number;
  runner11?: number;
  runner12?: number;
  runner1Odds?: number;
  runner2Odds?: number;
  runner3Odds?: number;
  runner4Odds?: number;
  runner5Odds?: number;
  runner6Odds?: number;
  runner7Odds?: number;
  runner8Odds?: number;
  runner9Odds?: number;
  runner10Odds?: number;
  runner11Odds?: number;
  runner12Odds?: number;
  [key: string]: any; // Allow dynamic properties
}

interface SharpBettorTimelineProps {
  bettingData: BettingDataPoint[];
  horses?: Horse[];
}

// Function to create dynamic odds variations
const createDynamicOdds = (baseOdds: number, timeIndex: number, runnerNumber: number): number => {
  // Create unique seed for each runner to ensure consistent but different patterns
  const runnerSeed = runnerNumber * 0.1;
  const timeSeed = timeIndex * 0.05;
  
  // Use sine wave for smooth oscillations with random amplitude
  const oscillation = Math.sin((timeIndex + runnerSeed) * 0.3) * 0.2;
  
  // Add some random walk behavior
  const randomWalk = (Math.random() - 0.5) * 0.15;
  
  // Combine base odds with variations, ensuring minimum odds of 1.1
  const variation = oscillation + randomWalk + (timeSeed * (Math.random() - 0.5) * 0.1);
  return Math.max(1.1, baseOdds + variation);
};

const SharpBettorTimeline: React.FC<SharpBettorTimelineProps> = ({ bettingData, horses = [] }) => {
  // Generate runner colors and names based on actual horses data
  const runnerColors: Record<string, string> = {};
  const runnerNames: Record<string, string> = {};

  // Base odds for each runner - these will be used as starting points for dynamic variations
  const baseOddsMap: Record<string, number> = {};

  // Use actual horse data if available, otherwise fall back to default
  if (horses.length > 0) {
    horses.forEach((horse) => {
      const runnerKey = `runner${horse.pp}`;
      runnerColors[runnerKey] = getRunnerColorByPosition(horse.pp);
      runnerNames[runnerKey] = horse.name;
      // Use live odds as base if available, otherwise use a reasonable default
      baseOddsMap[runnerKey] = horse.liveOdds || (Math.random() * 8 + 2);
    });
  } else {
    // Fallback to default horse names for demo purposes
    const defaultHorses = [
      { pp: 1, name: "Gold Search", odds: 6.5 },
      { pp: 2, name: "Rivalry", odds: 4.2 },
      { pp: 3, name: "Beer With Ice", odds: 8.1 },
      { pp: 4, name: "Quebrancho", odds: 12.0 },
      { pp: 5, name: "Dancing Noah", odds: 5.8 },
      { pp: 6, name: "More Than Five", odds: 3.5 },
      { pp: 7, name: "Speed Demon", odds: 7.2 },
      { pp: 8, name: "Pink Lightning", odds: 9.4 },
    ];
    
    defaultHorses.forEach((horse) => {
      const runnerKey = `runner${horse.pp}`;
      runnerColors[runnerKey] = getRunnerColorByPosition(horse.pp);
      runnerNames[runnerKey] = horse.name;
      baseOddsMap[runnerKey] = horse.odds;
    });
  }

  console.log('SharpBettorTimeline - Generated runnerColors:', runnerColors);
  console.log('SharpBettorTimeline - Generated runnerNames:', runnerNames);
  console.log('SharpBettorTimeline - Base odds map:', baseOddsMap);

  // Enhance betting data with dynamic odds variations
  const enhancedBettingData = bettingData.map((dataPoint, timeIndex) => {
    const enhanced: BettingDataPoint = { ...dataPoint };
    
    // Generate dynamic odds for all runners that have colors
    Object.keys(runnerColors).forEach(runnerKey => {
      const runnerNumber = parseInt(runnerKey.replace('runner', ''));
      const oddsKey = `${runnerKey}Odds`;
      const baseOdds = baseOddsMap[runnerKey] || (Math.random() * 8 + 2);
      
      // Create dynamic odds that vary over time
      enhanced[oddsKey] = parseFloat(createDynamicOdds(baseOdds, timeIndex, runnerNumber).toFixed(2));
    });
    
    return enhanced;
  });

  console.log('SharpBettorTimeline - Enhanced betting data sample:', enhancedBettingData[0]);

  // Calculate max values for chart scaling
  const maxVolume = Math.max(...enhancedBettingData.map(item => item.volume));
  const maxOdds = Math.max(
    ...enhancedBettingData.flatMap(item => [
      item.runner1Odds || 0,
      item.runner2Odds || 0,
      item.runner3Odds || 0,
      item.runner4Odds || 0,
      item.runner5Odds || 0,
      item.runner6Odds || 0,
      item.runner7Odds || 0,
      item.runner8Odds || 0,
      item.runner9Odds || 0,
      item.runner10Odds || 0,
      item.runner11Odds || 0,
      item.runner12Odds || 0,
    ])
  );
  
  // Find spike points
  const spikes = enhancedBettingData.filter(item => item.isSpike);
  const lastSpikeTimestamp = spikes.length > 0 ? spikes[spikes.length - 1].timestamp : null;

  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-betting-darkPurple overflow-hidden">
      <CardHeader className="bg-purple-header px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Sharp Bettor Timeline</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 pt-4">
        <BettingTimeline
          bettingData={enhancedBettingData}
          spikes={spikes}
          runnerNames={runnerNames}
          runnerColors={runnerColors}
          maxVolume={maxVolume}
          maxOdds={maxOdds}
          smallText={true}
        />
        
        <ChartInfoPanel 
          spikesCount={spikes.length}
          lastSpikeTimestamp={lastSpikeTimestamp}
        />
        
        <RunnerLegend 
          runnerNames={runnerNames}
          runnerColors={runnerColors}
        />
      </CardContent>
    </Card>
  );
};

export default SharpBettorTimeline;
