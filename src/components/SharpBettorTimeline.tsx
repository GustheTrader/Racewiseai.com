
import React, { useState, useEffect } from 'react';
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

// Enhanced function to create more complex dynamic odds variations with multiple wave patterns
const createDynamicOdds = (baseOdds: number, timeIndex: number, runnerNumber: number, waveOffset: number = 0): number => {
  // Create unique seed for each runner to ensure consistent but different patterns
  const runnerSeed = runnerNumber * 0.15;
  const timeSeed = (timeIndex + waveOffset) * 0.08;
  
  // Primary sine wave for main oscillation
  const primaryWave = Math.sin((timeIndex + waveOffset + runnerSeed) * 0.4) * 0.25;
  
  // Secondary cosine wave for complexity
  const secondaryWave = Math.cos((timeIndex + waveOffset + runnerSeed) * 0.6) * 0.15;
  
  // Tertiary wave for micro-fluctuations
  const tertiaryWave = Math.sin((timeIndex + waveOffset + runnerSeed) * 1.2) * 0.08;
  
  // Random walk behavior with less volatility
  const randomWalk = (Math.random() - 0.5) * 0.12;
  
  // Market pressure simulation (occasional drift)
  const marketPressure = Math.sin((timeIndex + waveOffset) * 0.1) * 0.1;
  
  // Combine all variations
  const totalVariation = primaryWave + secondaryWave + tertiaryWave + randomWalk + marketPressure + (timeSeed * (Math.random() - 0.5) * 0.08);
  
  // Ensure minimum odds of 1.1 and add some trending behavior
  return Math.max(1.1, baseOdds + totalVariation);
};

// Function to generate new time point
const generateNextTimePoint = (currentTime: string): string => {
  const [hours, minutes] = currentTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + 1; // Advance by 1 minute
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

const SharpBettorTimeline: React.FC<SharpBettorTimelineProps> = ({ bettingData, horses = [] }) => {
  const [timeOffset, setTimeOffset] = useState(0);
  const [enhancedData, setEnhancedData] = useState<BettingDataPoint[]>([]);
  
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

  // Update enhanced data with time progression and wave animations
  useEffect(() => {
    const updateData = () => {
      const updatedData = bettingData.map((dataPoint, timeIndex) => {
        const enhanced: BettingDataPoint = { 
          ...dataPoint,
          // Update time to show progression
          time: timeIndex === bettingData.length - 1 ? 
            generateNextTimePoint(dataPoint.time) : dataPoint.time,
          timestamp: dataPoint.timestamp + (timeOffset * 60000) // Add offset in milliseconds
        };
        
        // Generate dynamic odds for all runners that have colors
        Object.keys(runnerColors).forEach(runnerKey => {
          const runnerNumber = parseInt(runnerKey.replace('runner', ''));
          const oddsKey = `${runnerKey}Odds`;
          const baseOdds = baseOddsMap[runnerKey] || (Math.random() * 8 + 2);
          
          // Create dynamic odds that vary over time with wave offset
          enhanced[oddsKey] = parseFloat(createDynamicOdds(baseOdds, timeIndex, runnerNumber, timeOffset).toFixed(2));
        });
        
        return enhanced;
      });
      
      setEnhancedData(updatedData);
    };

    updateData();
  }, [timeOffset, bettingData, runnerColors, baseOddsMap]);

  // Time progression effect - updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOffset(prev => prev + 1);
    }, 3000); // Update every 3 seconds for slow movement

    return () => clearInterval(interval);
  }, []);

  console.log('SharpBettorTimeline - Generated runnerColors:', runnerColors);
  console.log('SharpBettorTimeline - Generated runnerNames:', runnerNames);
  console.log('SharpBettorTimeline - Base odds map:', baseOddsMap);
  console.log('SharpBettorTimeline - Enhanced betting data sample:', enhancedData[0]);

  // Calculate max values for chart scaling
  const maxVolume = Math.max(...enhancedData.map(item => item.volume));
  const maxOdds = Math.max(
    ...enhancedData.flatMap(item => [
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
  const spikes = enhancedData.filter(item => item.isSpike);
  const lastSpikeTimestamp = spikes.length > 0 ? spikes[spikes.length - 1].timestamp : null;

  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-betting-darkPurple overflow-hidden">
      <CardHeader className="bg-purple-header px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Sharp Bettor Timeline</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 pt-4">
        <BettingTimeline
          bettingData={enhancedData}
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
