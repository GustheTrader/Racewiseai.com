
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatTrainingFigure } from '../utils/formatters';
import { Activity } from 'lucide-react';

interface TrainingFigure {
  horse: string;
  date: string;
  figure: number;
  track: string;
  distance: string;
  improvement: number;
}

interface TrainingFiguresProps {
  figures: TrainingFigure[];
}

const TrainingFigures: React.FC<TrainingFiguresProps> = ({ figures }) => {
  // Sort by figure value (highest first)
  const sortedFigures = [...figures].sort((a, b) => b.figure - a.figure);
  
  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.02] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm px-4 py-3 border-b border-purple-500/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <Activity className="h-5 w-5 text-purple-300" />
          </div>
          Best Recent Workout Figures
          <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-800/80 to-gray-900/60 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-gray-300 font-medium">Horse</th>
                <th className="px-4 py-2 text-left text-xs text-gray-300 font-medium">Date</th>
                <th className="px-4 py-2 text-center text-xs text-gray-300 font-medium">Figure</th>
                <th className="px-4 py-2 text-left text-xs text-gray-300 font-medium">Track</th>
                <th className="px-4 py-2 text-right text-xs text-gray-300 font-medium">Δ</th>
              </tr>
            </thead>
            <tbody>
              {sortedFigures.map((item, index) => (
                <tr 
                  key={index}
                  className="border-t border-gray-800/30 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300 group/row"
                >
                  <td className="px-4 py-2 font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{item.horse}</td>
                  <td className="px-4 py-2 text-gray-400">{item.date}</td>
                  <td className="px-4 py-2 text-center font-mono">
                    <span className={`px-2 py-1 rounded-lg ${item.figure >= 90 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30' : 
                      item.figure >= 80 ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-200 border border-gray-500/30'}`}>
                      {formatTrainingFigure(item.figure)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-400">{item.track} ({item.distance})</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`px-2 py-1 rounded-lg ${item.improvement > 0 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30' : 
                      item.improvement < 0 ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/30' : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border border-gray-500/30'}`}>
                      {item.improvement > 0 ? `+${item.improvement}` : item.improvement}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingFigures;
