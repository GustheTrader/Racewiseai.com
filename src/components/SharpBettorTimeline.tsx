
import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
const BettingTimeline = React.lazy(() => import('./charts/BettingTimeline'));
import ChartInfoPanel from './charts/ChartInfoPanel';
import RunnerLegend from './charts/RunnerLegend';
import { Horse, BettingDataPoint } from '../utils/types';
import { getRunnerColorByPosition } from './charts/constants/postPositionColors';
import { TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { useLiveOddsTimeline } from '@/hooks/useLiveOddsTimeline';
import { Badge } from '@/components/ui/badge';

interface SharpBettorTimelineProps {
  bettingData?: BettingDataPoint[];
  horses?: Horse[];
  trackName?: string;
  raceNumber?: number;
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

const SharpBettorTimeline: React.FC<SharpBettorTimelineProps> = ({ 
  bettingData: propsBettingData, 
  horses = [],
  trackName,
  raceNumber 
}) => {
  // Use live data hook
  const { 
    bettingData: liveData, 
    isLiveData, 
    isLoading,
    lastUpdate 
  } = useLiveOddsTimeline({ trackName, raceNumber });

  // Use prop data if provided, otherwise use live/mock data from hook
  const bettingData = propsBettingData && propsBettingData.length > 0 ? propsBettingData : liveData;

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
      { pp: 1, name: "Fast Lightning", odds: 6.5 },
      { pp: 2, name: "Lucky Star", odds: 4.2 },
      { pp: 3, name: "Thunder Bolt", odds: 8.1 },
      { pp: 4, name: "Silver Streak", odds: 12.0 },
      { pp: 5, name: "Golden Arrow", odds: 5.8 },
      { pp: 6, name: "Midnight Runner", odds: 3.5 },
      { pp: 7, name: "Wind Chaser", odds: 7.2 },
      { pp: 8, name: "Dark Horse", odds: 9.4 },
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
      if (!bettingData || bettingData.length === 0) return;
      
      const updatedData = bettingData.map((dataPoint, timeIndex) => {
        const enhanced: BettingDataPoint = { 
          ...dataPoint,
          // Update time to show progression
          time: timeIndex === bettingData.length - 1 ? 
            generateNextTimePoint(dataPoint.time) : dataPoint.time,
          timestamp: dataPoint.timestamp + (timeOffset * 60000) // Add offset in milliseconds
        };
        
        // Generate dynamic odds for all runners that have colors (only if not live data)
        if (!isLiveData) {
          Object.keys(runnerColors).forEach(runnerKey => {
            const runnerNumber = parseInt(runnerKey.replace('runner', ''));
            const oddsKey = `${runnerKey}Odds`;
            const baseOdds = baseOddsMap[runnerKey] || (Math.random() * 8 + 2);
            
            // Create dynamic odds that vary over time with wave offset
            enhanced[oddsKey] = parseFloat(createDynamicOdds(baseOdds, timeIndex, runnerNumber, timeOffset).toFixed(2));
          });
        }
        
        return enhanced;
      });
      
      setEnhancedData(updatedData);
    };

    updateData();
  }, [timeOffset, bettingData, isLiveData]);

  // Time progression effect - updates every 3 seconds (only for mock data)
  useEffect(() => {
    if (isLiveData) return; // Don't animate if using live data
    
    const interval = setInterval(() => {
      setTimeOffset(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveData]);

  console.log('SharpBettorTimeline - Generated runnerColors:', runnerColors);
  console.log('SharpBettorTimeline - Generated runnerNames:', runnerNames);
  console.log('SharpBettorTimeline - Base odds map:', baseOddsMap);
  console.log('SharpBettorTimeline - Enhanced betting data sample:', enhancedData[0]);

  // Calculate max values for chart scaling
  const maxVolume = Math.max(...enhancedData.map(item => item.volume), 1);
  const maxOdds = Math.max(
    ...enhancedData.flatMap(item => [
      Number(item.runner1Odds) || 0,
      Number(item.runner2Odds) || 0,
      Number(item.runner3Odds) || 0,
      Number(item.runner4Odds) || 0,
      Number(item.runner5Odds) || 0,
      Number(item.runner6Odds) || 0,
      Number(item.runner7Odds) || 0,
      Number(item.runner8Odds) || 0,
      Number(item.runner9Odds) || 0,
      Number(item.runner10Odds) || 0,
      Number(item.runner11Odds) || 0,
      Number(item.runner12Odds) || 0,
    ]),
    1
  );
  
  // Find spike points
  const spikes = enhancedData.filter(item => item.isSpike);
  const lastSpikeTimestamp = spikes.length > 0 ? spikes[spikes.length - 1].timestamp : null;

  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.01] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm px-4 py-3 border-b border-purple-500/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <TrendingUp className="h-5 w-5 text-purple-300" />
          </div>
          Sharp Bettor Timeline
          <div className="ml-auto flex items-center gap-2">
            {isLiveData ? (
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50 text-xs flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-xs flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                DEMO
              </Badge>
            )}
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 pt-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          <Suspense fallback={<div className="h-80 flex items-center justify-center text-sm text-gray-400">Loading chart…</div>}>
            <BettingTimeline
              bettingData={enhancedData}
              spikes={spikes}
              runnerNames={runnerNames}
              runnerColors={runnerColors}
              maxVolume={maxVolume}
              maxOdds={maxOdds}
              smallText={true}
            />
          </Suspense>
          
          <ChartInfoPanel 
            spikesCount={spikes.length}
            lastSpikeTimestamp={lastSpikeTimestamp}
          />
          
          <RunnerLegend 
            runnerNames={runnerNames}
            runnerColors={runnerColors}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SharpBettorTimeline;
