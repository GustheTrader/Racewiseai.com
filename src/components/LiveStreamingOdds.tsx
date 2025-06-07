
import React from 'react';
import { Horse } from '../utils/types';
import { formatOdds, getChangeClass, formatDifference } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp, ChartLine } from 'lucide-react';
import { getRunnerColorByPosition } from './charts/constants/postPositionColors';

interface LiveStreamingOddsProps {
  horses: Horse[];
}

const LiveStreamingOdds: React.FC<LiveStreamingOddsProps> = ({ horses }) => {
  // Filter out disqualified horses to match OddsTable behavior
  const availableHorses = horses.filter(horse => !horse.isDisqualified);

  // Display a history of 10 odds data points per horse (simulated for now)
  const generateOddsHistory = (baseOdds: number) => {
    const history = [];
    for (let i = 0; i < 10; i++) {
      // Create small variations around the base odds
      const variance = (Math.random() * 0.4) - 0.2; // Between -0.2 and +0.2
      history.push(Math.max(1.1, baseOdds + variance));
    }
    return history;
  };

  // Function to determine heatmap color based on ML to current odds difference
  const getHeatmapColor = (mlOdds: number | undefined, liveOdds: number): string => {
    if (!mlOdds) return 'bg-gray-700'; // No ML odds available
    
    const diff = liveOdds - mlOdds;
    const percentChange = (diff / mlOdds) * 100;
    
    // Higher intensity colors for bigger changes
    if (percentChange <= -20) return 'bg-blue-600'; // Much lower odds (better)
    if (percentChange <= -10) return 'bg-blue-500';
    if (percentChange <= -5) return 'bg-blue-400';
    if (percentChange < 0) return 'bg-blue-300';
    if (percentChange === 0) return 'bg-gray-500';
    if (percentChange < 5) return 'bg-red-300';
    if (percentChange < 10) return 'bg-red-400';
    if (percentChange < 20) return 'bg-red-500';
    return 'bg-red-600'; // Much higher odds (worse)
  };

  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-betting-darkPurple overflow-hidden">
      <CardHeader className="bg-purple-header px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <ChartLine className="h-5 w-5" />
          Live Streaming Odds
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 space-y-1">
        {availableHorses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No odds data available for horses
          </div>
        ) : (
          availableHorses.map((horse) => {
            // Generate simulated odds history for each horse
            const oddsHistory = generateOddsHistory(horse.liveOdds);
            
            // Determine momentum trend by comparing the average of the first half vs second half
            const firstHalfAvg = oddsHistory.slice(0, 5).reduce((sum, odds) => sum + odds, 0) / 5;
            const secondHalfAvg = oddsHistory.slice(5).reduce((sum, odds) => sum + odds, 0) / 5;
            const trending = secondHalfAvg < firstHalfAvg ? 'down' : 'up';
            
            // Calculate heatmap color based on ML vs current odds
            const heatmapColor = getHeatmapColor(horse.mlOdds, horse.liveOdds);
            
            // Get proper post position color
            const ppColor = getRunnerColorByPosition(horse.pp);
            const textColor = horse.pp === 2 || horse.pp === 4 || horse.pp === 12 ? "text-black" : "text-white";
            
            return (
              <div key={horse.id} className="flex flex-col py-2 px-4 hover:bg-gray-800/30 rounded">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center space-x-2">
                    {horse.isFavorite && (
                      <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
                    )}
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 flex items-center justify-center border border-gray-500 mr-2 rounded"
                        style={{ backgroundColor: ppColor }}
                      >
                        <span className={`text-xs font-bold ${textColor}`}>{horse.pp}</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-1.5 h-full ${heatmapColor} mr-1`}></div>
                        <span className="font-semibold">{horse.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-lg">{formatOdds(horse.liveOdds)}</span>
                    <span className={`text-sm ${getChangeClass(horse.difference)}`}>
                      {formatDifference(horse.difference)}
                    </span>
                    {trending === 'down' ? 
                      <TrendingDown className="h-4 w-4 text-betting-positive" /> : 
                      <TrendingUp className="h-4 w-4 text-betting-negative" />
                    }
                  </div>
                </div>
                
                {/* Historical odds visualization */}
                <div className="flex flex-col mt-1">
                  {/* Visualization bars */}
                  <div className="flex items-end h-6 mt-1 space-x-1">
                    {oddsHistory.map((odds, idx) => (
                      <div 
                        key={idx}
                        className={`h-full w-1 rounded-sm ${
                          idx % 2 === 0 
                            ? 'bg-gray-700' 
                            : 'bg-gray-600'
                        }`}
                        style={{ 
                          height: `${Math.min(100, Math.max(30, (1 / odds) * 50))}%` 
                        }}
                        title={`${formatOdds(odds)}`}
                      />
                    ))}
                    <div 
                      className="h-full w-2 rounded-sm bg-blue-400 animate-pulse"
                      style={{ 
                        height: `${Math.min(100, Math.max(30, (1 / horse.liveOdds) * 50))}%` 
                      }}
                      title={`Current: ${formatOdds(horse.liveOdds)}`}
                    />
                  </div>
                  
                  {/* Historical odds values */}
                  <div className="flex items-center mt-1 text-xs text-gray-400 overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-1 min-w-full">
                      {oddsHistory.map((odds, idx) => (
                        <div key={idx} className="text-center min-w-4" title={`Historical odds ${idx + 1}`}>
                          {formatOdds(odds)}
                        </div>
                      ))}
                      <div className="text-center min-w-4 font-bold text-blue-400" title="Current odds">
                        {formatOdds(horse.liveOdds)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default LiveStreamingOdds;
