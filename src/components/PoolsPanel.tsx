
import React, { useState } from 'react';
import { PoolData, ExoticPool, Horse } from '../utils/types';
import { formatCurrency } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getRunnerColorByPosition } from './charts/constants/postPositionColors';
import { Coins } from 'lucide-react';

interface PoolsPanelProps {
  poolData: PoolData[];
  exoticPools: ExoticPool[];
  horses?: Horse[];
}

const PoolsPanel: React.FC<PoolsPanelProps> = ({ poolData, exoticPools, horses = [] }) => {
  const [activeTab, setActiveTab] = useState<'POOLS' | 'PROBABLES' | 'WILL PAYS' | 'TOTALS'>('TOTALS');
  
  // Create a map of horse numbers to horse data
  const horseMap = horses.reduce((map, horse) => {
    map[horse.pp] = horse;
    return map;
  }, {} as Record<number, Horse>);

  const renderTotals = () => (
    <div className="mt-4">
      <div className="grid grid-cols-6 gap-2 px-3 py-2 bg-gradient-to-r from-gray-800/80 to-gray-900/60 backdrop-blur-sm rounded-lg text-gray-300 text-sm border border-white/10">
        <div className="font-medium">#</div>
        <div className="font-medium">Horse</div>
        <div className="text-center font-medium">ODDS</div>
        <div className="text-center font-medium">WIN</div>
        <div className="text-center font-medium">PLACE</div>
        <div className="text-center font-medium">SHOW</div>
      </div>
      
      <div className="space-y-1 mt-2">
        {poolData.map((pool) => {
          const horse = horseMap[pool.number];
          const ppColor = getRunnerColorByPosition(pool.number);
          const textColor = pool.number === 2 || pool.number === 4 || pool.number === 12 ? "text-black" : "text-white";
          
          return (
            <div key={pool.number} className="grid grid-cols-6 gap-2 px-3 py-2 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 rounded-xl transition-all duration-300 group border border-transparent hover:border-purple-500/20 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center relative z-10">
                <div 
                  className="w-6 h-6 flex items-center justify-center border border-gray-500/50 rounded mr-2 backdrop-blur-sm shadow-lg"
                  style={{ backgroundColor: ppColor }}
                >
                  <span className={`text-xs font-bold ${textColor}`}>{pool.number}</span>
                </div>
              </div>
              <div className="text-sm relative z-10 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-medium">
                {horse ? horse.name : `Horse ${pool.number}`}
              </div>
              <div className="text-center relative z-10 font-mono">{pool.odds}</div>
              <div className="text-center relative z-10 font-mono">{formatCurrency(pool.win)}</div>
              <div className="text-center relative z-10 font-mono">{formatCurrency(pool.place)}</div>
              <div className="text-center relative z-10 font-mono">{formatCurrency(pool.show)}</div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 space-y-1">
        {exoticPools.map((exotic) => (
          <div key={exotic.name} className="flex justify-between px-3 py-2 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 rounded-xl transition-all duration-300 group border border-transparent hover:border-purple-500/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="text-blue-400 relative z-10 font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{exotic.name}</div>
            <div className="relative z-10 font-mono">{formatCurrency(exotic.amount)}</div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlaceholder = (tabName: string) => (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">{tabName} data will appear here</p>
    </div>
  );
  
  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.02] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm px-4 py-3 border-b border-purple-500/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <Coins className="h-5 w-5 text-purple-300" />
          </div>
          Pool Data
          <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex border-b border-gray-800/50">
          {(['POOLS', 'PROBABLES', 'WILL PAYS', 'TOTALS'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 px-4 py-3 text-center transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white font-medium backdrop-blur-sm shadow-lg border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-900/30 hover:text-white backdrop-blur-sm'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-2">
          {activeTab === 'TOTALS' && renderTotals()}
          {activeTab === 'POOLS' && renderPlaceholder('Pools')}
          {activeTab === 'PROBABLES' && renderPlaceholder('Probables')}
          {activeTab === 'WILL PAYS' && renderPlaceholder('Will Pays')}
        </div>
      </CardContent>
    </Card>
  );
};

export default PoolsPanel;
