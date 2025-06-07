
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
}

interface SharpBettorTimelineProps {
  bettingData: BettingDataPoint[];
  horses?: Horse[];
}

const SharpBettorTimeline: React.FC<SharpBettorTimelineProps> = ({ bettingData, horses = [] }) => {
  // Generate runner colors and names based on actual horses data
  const runnerColors: Record<string, string> = {};
  const runnerNames: Record<string, string> = {};

  // Use actual horse data if available, otherwise fall back to default
  if (horses.length > 0) {
    horses.forEach((horse) => {
      const runnerKey = `runner${horse.pp}`;
      runnerColors[runnerKey] = getRunnerColorByPosition(horse.pp);
      runnerNames[runnerKey] = horse.name;
    });
  } else {
    // Fallback to default horse names for demo purposes
    const defaultHorses = [
      { pp: 1, name: "Gold Search" },
      { pp: 2, name: "Rivalry" },
      { pp: 3, name: "Beer With Ice" },
      { pp: 4, name: "Quebrancho" },
      { pp: 5, name: "Dancing Noah" },
      { pp: 6, name: "More Than Five" },
    ];
    
    defaultHorses.forEach((horse) => {
      const runnerKey = `runner${horse.pp}`;
      runnerColors[runnerKey] = getRunnerColorByPosition(horse.pp);
      runnerNames[runnerKey] = horse.name;
    });
  }

  // Calculate max values for chart scaling
  const maxVolume = Math.max(...bettingData.map(item => item.volume));
  const maxOdds = Math.max(
    ...bettingData.flatMap(item => [
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
  const spikes = bettingData.filter(item => item.isSpike);
  const lastSpikeTimestamp = spikes.length > 0 ? spikes[spikes.length - 1].timestamp : null;

  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-betting-darkPurple overflow-hidden">
      <CardHeader className="bg-purple-header px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Sharp Bettor Timeline</CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 pt-4">
        <BettingTimeline
          bettingData={bettingData}
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
