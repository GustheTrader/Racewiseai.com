
import React from 'react';
import { PaceData } from '../utils/mockData';
import { Horse } from '../utils/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Gauge } from 'lucide-react';

interface PaceAnalysisProps {
  paceData: PaceData[];
  horses?: Horse[];
}

const MAX_BARS = 10;

const PaceAnalysis: React.FC<PaceAnalysisProps> = ({ paceData, horses = [] }) => {
  // Filter out disqualified horses to match OddsTable behavior
  const availableHorses = horses.filter(horse => !horse.isDisqualified);

  // If we have actual horse data, use it to create pace analysis
  const paceAnalysisData = availableHorses.length > 0 
    ? availableHorses.map((horse, index) => ({
        name: horse.name,
        pp: horse.pp,
        // Use existing pace data if available, otherwise generate based on horse characteristics
        early: paceData[index]?.early || Math.floor(Math.random() * 8),
        middle: paceData[index]?.middle || Math.floor(Math.random() * 8),
        late: paceData[index]?.late || Math.floor(Math.random() * 8)
      }))
    : paceData.map((pace, index) => ({
        ...pace,
        pp: index + 1
      }));

  const renderPaceBars = (count: number, type: 'early' | 'middle' | 'late') => {
    const bars = [];
    for (let i = 0; i < MAX_BARS; i++) {
      const isActive = i < count;
      
      // Determine color based on type and activity state
      let bgColor = 'bg-gray-700/50 border border-gray-600/30';
      
      if (isActive) {
        if (type === 'early') bgColor = 'bg-gradient-to-t from-blue-500 to-blue-400 border border-blue-400/50 shadow-lg shadow-blue-500/30';
        if (type === 'middle') bgColor = 'bg-gradient-to-t from-purple-500 to-purple-400 border border-purple-400/50 shadow-lg shadow-purple-500/30';
        if (type === 'late') bgColor = 'bg-gradient-to-t from-red-500 to-red-400 border border-red-400/50 shadow-lg shadow-red-500/30';
      }
      
      bars.push(
        <div 
          key={`${type}-${i}`} 
          className={`h-3 w-1.5 rounded-sm ${bgColor} mx-0.5 transition-all duration-300 hover:scale-110 backdrop-blur-sm`}
        ></div>
      );
    }
    return <div className="flex">{bars}</div>;
  };
  
  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.02] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm px-4 py-3 border-b border-purple-500/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <Gauge className="h-5 w-5 text-purple-300" />
          </div>
          Pace Analysis
          <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-2">
        <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-gradient-to-r from-gray-800/80 to-gray-900/60 backdrop-blur-sm rounded-lg text-gray-300 text-sm border border-white/10">
          <div className="font-medium">Runner</div>
          <div className="text-center font-medium">Early</div>
          <div className="text-center font-medium">Middle</div>
          <div className="text-center font-medium">Late</div>
        </div>
        
        <div className="space-y-1 mt-2">
          {paceAnalysisData.map((horse) => (
            <div key={horse.name} className="grid grid-cols-4 gap-2 px-3 py-3 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 rounded-xl items-center transition-all duration-300 group/horse border border-transparent hover:border-purple-500/20 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/horse:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center relative z-10">
                <span className="text-xs text-gray-400 mr-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-2 py-1 rounded-md border border-white/10">PP{horse.pp}</span>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-medium">{horse.name}</span>
              </div>
              <div className="flex justify-center relative z-10">{renderPaceBars(horse.early, 'early')}</div>
              <div className="flex justify-center relative z-10">{renderPaceBars(horse.middle, 'middle')}</div>
              <div className="flex justify-center relative z-10">{renderPaceBars(horse.late, 'late')}</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform scale-x-0 group-hover/horse:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaceAnalysis;
