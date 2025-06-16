
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
    if (!mlOdds) return 'bg-gray-700/50'; // No ML odds available
    
    const diff = liveOdds - mlOdds;
    const percentChange = (diff / mlOdds) * 100;
    
    // Higher intensity colors for bigger changes
    if (percentChange <= -20) return 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30'; // Much lower odds (better)
    if (percentChange <= -10) return 'bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg shadow-blue-400/30';
    if (percentChange <= -5) return 'bg-gradient-to-r from-blue-400 to-blue-300 shadow-lg shadow-blue-300/30';
    if (percentChange < 0) return 'bg-gradient-to-r from-blue-300 to-blue-200 shadow-lg shadow-blue-200/30';
    if (percentChange === 0) return 'bg-gradient-to-r from-gray-500 to-gray-400 shadow-lg shadow-gray-400/30';
    if (percentChange < 5) return 'bg-gradient-to-r from-red-300 to-red-200 shadow-lg shadow-red-200/30';
    if (percentChange < 10) return 'bg-gradient-to-r from-red-400 to-red-300 shadow-lg shadow-red-300/30';
    if (percentChange < 20) return 'bg-gradient-to-r from-red-500 to-red-400 shadow-lg shadow-red-400/30';
    return 'bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-500/30'; // Much higher odds (worse)
  };

  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.02] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm px-4 py-3 border-b border-purple-500/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <ChartLine className="h-5 w-5 text-purple-300" />
          </div>
          Live Streaming Odds
          <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
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
              <div key={horse.id} className="flex flex-col py-3 px-4 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 rounded-xl transition-all duration-300 group/horse border border-transparent hover:border-purple-500/20 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/horse:opacity-100 transition-opacity duration-300"></div>
                <div className="flex justify-between items-center mb-2 relative z-10">
                  <div className="flex items-center space-x-3">
                    {horse.isFavorite && (
                      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-red-400 inline-block animate-pulse shadow-lg shadow-red-500/50"></span>
                    )}
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 flex items-center justify-center border border-gray-500/50 mr-3 rounded backdrop-blur-sm shadow-lg"
                        style={{ backgroundColor: ppColor }}
                      >
                        <span className={`text-xs font-bold ${textColor}`}>{horse.pp}</span>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-2 h-full rounded-sm mr-2 ${heatmapColor}`}></div>
                        <span className="font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{horse.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{formatOdds(horse.liveOdds)}</span>
                    <span className={`text-sm ${getChangeClass(horse.difference)} px-2 py-1 rounded-lg bg-gradient-to-r ${horse.difference >= 0 ? 'from-green-500/20 to-emerald-500/20 border border-green-500/30' : 'from-red-500/20 to-pink-500/20 border border-red-500/30'}`}>
                      {formatDifference(horse.difference)}
                    </span>
                    {trending === 'down' ? 
                      <TrendingDown className="h-4 w-4 text-green-400 animate-pulse" /> : 
                      <TrendingUp className="h-4 w-4 text-red-400 animate-pulse" />
                    }
                  </div>
                </div>
                
                {/* Historical odds visualization */}
                <div className="flex flex-col mt-2 relative z-10">
                  {/* Visualization bars */}
                  <div className="flex items-end h-8 mt-1 space-x-1 bg-gradient-to-r from-gray-800/50 to-gray-900/30 rounded-lg p-2 backdrop-blur-sm border border-white/10">
                    {oddsHistory.map((odds, idx) => (
                      <div 
                        key={idx}
                        className={`h-full w-1.5 rounded-sm transition-all duration-300 hover:scale-110 ${
                          idx % 2 === 0 
                            ? 'bg-gradient-to-t from-gray-700 to-gray-600 shadow-lg' 
                            : 'bg-gradient-to-t from-gray-600 to-gray-500 shadow-lg'
                        }`}
                        style={{ 
                          height: `${Math.min(100, Math.max(30, (1 / odds) * 50))}%` 
                        }}
                        title={`${formatOdds(odds)}`}
                      />
                    ))}
                    <div 
                      className="h-full w-2 rounded-sm bg-gradient-to-t from-blue-500 to-blue-400 animate-pulse shadow-lg shadow-blue-400/50"
                      style={{ 
                        height: `${Math.min(100, Math.max(30, (1 / horse.liveOdds) * 50))}%` 
                      }}
                      title={`Current: ${formatOdds(horse.liveOdds)}`}
                    />
                  </div>
                  
                  {/* Historical odds values */}
                  <div className="flex items-center mt-2 text-xs text-gray-400 overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-1 min-w-full">
                      {oddsHistory.map((odds, idx) => (
                        <div key={idx} className="text-center min-w-4 hover:text-white transition-colors" title={`Historical odds ${idx + 1}`}>
                          {formatOdds(odds)}
                        </div>
                      ))}
                      <div className="text-center min-w-4 font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent" title="Current odds">
                        {formatOdds(horse.liveOdds)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform scale-x-0 group-hover/horse:scale-x-100 transition-transform duration-500"></div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default LiveStreamingOdds;
