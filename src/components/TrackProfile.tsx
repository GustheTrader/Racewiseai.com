
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { BarChart3, MapPin } from 'lucide-react';

interface FinishPosition {
  position: number;
  count: number;
  percentage: number;
}

interface TrackStatistics {
  totalRaces: number;
  frontRunnerWin: number;
  pressersWin: number;
  midPackWin: number;
  closersWin: number;
  frontRunnerPercentage: number;
  pressersPercentage: number;
  midPackPercentage: number;
  closersPercentage: number;
}

interface TrackTiming {
  distance: string;
  bestTime: string;
  averageTime: string;
}

interface TrackProfileProps {
  statistics: TrackStatistics;
  postPositions: FinishPosition[];
  timings: TrackTiming[];
}

const TrackProfile: React.FC<TrackProfileProps> = ({ statistics, postPositions, timings }) => {
  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.02] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm px-4 py-3 border-b border-purple-500/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <MapPin className="h-5 w-5 text-purple-300" />
          </div>
          Track Profile & Bias
          <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="text-white mb-4">
          <div className="text-center font-semibold bg-gradient-to-r from-gray-800/80 to-gray-900/60 p-3 rounded-t-xl backdrop-blur-sm border border-white/10">
            <h3 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Track Statistics: {statistics.totalRaces} Races
            </h3>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 p-4 rounded-b-xl backdrop-blur-sm border border-white/10 border-t-0">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 p-3 rounded-xl border border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300 group/stat">
                <div className="font-medium text-gray-300 group-hover/stat:text-white transition-colors">Front-Runners</div>
                <div className="text-2xl bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent font-bold">{statistics.frontRunnerPercentage}%</div>
                <div className="text-xs text-gray-400">{statistics.frontRunnerWin}/{statistics.totalRaces}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3 rounded-xl border border-green-500/30 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300 group/stat">
                <div className="font-medium text-gray-300 group-hover/stat:text-white transition-colors">Pressers</div>
                <div className="text-2xl bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-bold">{statistics.pressersPercentage}%</div>
                <div className="text-xs text-gray-400">{statistics.pressersWin}/{statistics.totalRaces}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 rounded-xl border border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300 group/stat">
                <div className="font-medium text-gray-300 group-hover/stat:text-white transition-colors">Mid-Pack</div>
                <div className="text-2xl bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent font-bold">{statistics.midPackPercentage}%</div>
                <div className="text-xs text-gray-400">{statistics.midPackWin}/{statistics.totalRaces}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 p-3 rounded-xl border border-purple-500/30 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 group/stat">
                <div className="font-medium text-gray-300 group-hover/stat:text-white transition-colors">Closers</div>
                <div className="text-2xl bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent font-bold">{statistics.closersPercentage}%</div>
                <div className="text-xs text-gray-400">{statistics.closersWin}/{statistics.totalRaces}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/60 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-300 group/table">
            <h3 className="text-sm font-medium text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Post Position Analysis</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-900/90 to-gray-800/70 backdrop-blur-sm border-gray-700/50">
                    <TableHead className="text-xs text-gray-300">PP</TableHead>
                    <TableHead className="text-xs text-gray-300">Wins</TableHead>
                    <TableHead className="text-xs text-gray-300">Win %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postPositions.map((position) => (
                    <TableRow key={position.position} className="text-white border-b border-gray-700/50 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300">
                      <TableCell className="py-1 text-xs">{position.position}</TableCell>
                      <TableCell className="py-1 text-xs">{position.count}</TableCell>
                      <TableCell className={`py-1 text-xs font-bold px-2 py-1 rounded-lg ${
                        position.percentage > 20 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30' : 
                        position.percentage > 15 ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30' : 'text-white'
                      }`}>
                        {position.percentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/60 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-300 group/table">
            <h3 className="text-sm font-medium text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Track Times</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-900/90 to-gray-800/70 backdrop-blur-sm border-gray-700/50">
                    <TableHead className="text-xs text-gray-300">Distance</TableHead>
                    <TableHead className="text-xs text-gray-300">Best Time</TableHead>
                    <TableHead className="text-xs text-gray-300">Avg Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timings.map((timing) => (
                    <TableRow key={timing.distance} className="text-white border-b border-gray-700/50 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300">
                      <TableCell className="py-1 text-xs">{timing.distance}</TableCell>
                      <TableCell className="py-1 text-xs bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-medium">{timing.bestTime}</TableCell>
                      <TableCell className="py-1 text-xs">{timing.averageTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gradient-to-br from-gray-800/80 to-gray-900/60 p-3 rounded-xl text-center text-xs text-gray-300 backdrop-blur-sm border border-white/10 hover:border-green-500/30 transition-all duration-300 group/info">
          <p className="group-hover/info:text-white transition-colors">Track is playing fair with slight advantage to mid-pack closers today</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackProfile;
