
import React, { useState } from 'react';
import { PoolData, ExoticPool, Horse } from '../utils/types';
import { formatCurrency } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getRunnerColorByPosition } from './charts/constants/postPositionColors';

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
      <div className="grid grid-cols-6 gap-2 px-3 py-2 bg-gray-800/50 rounded text-gray-300 text-sm">
        <div>#</div>
        <div>Horse</div>
        <div className="text-center">ODDS</div>
        <div className="text-center">WIN</div>
        <div className="text-center">PLACE</div>
        <div className="text-center">SHOW</div>
      </div>
      
      <div className="space-y-1 mt-2">
        {poolData.map((pool) => {
          const horse = horseMap[pool.number];
          const ppColor = getRunnerColorByPosition(pool.number);
          const textColor = pool.number === 2 || pool.number === 4 || pool.number === 12 ? "text-black" : "text-white";
          
          return (
            <div key={pool.number} className="grid grid-cols-6 gap-2 px-3 py-2 hover:bg-gray-800/30 rounded">
              <div className="flex items-center">
                <div 
                  className="w-5 h-5 flex items-center justify-center border border-gray-500 rounded mr-2"
                  style={{ backgroundColor: ppColor }}
                >
                  <span className={`text-xs font-bold ${textColor}`}>{pool.number}</span>
                </div>
              </div>
              <div className="text-sm">
                {horse ? horse.name : `Horse ${pool.number}`}
              </div>
              <div className="text-center">{pool.odds}</div>
              <div className="text-center">{formatCurrency(pool.win)}</div>
              <div className="text-center">{formatCurrency(pool.place)}</div>
              <div className="text-center">{formatCurrency(pool.show)}</div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 space-y-1">
        {exoticPools.map((exotic) => (
          <div key={exotic.name} className="flex justify-between px-3 py-2 hover:bg-gray-800/30 rounded">
            <div className="text-blue-400">{exotic.name}</div>
            <div>{formatCurrency(exotic.amount)}</div>
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
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-betting-darkPurple overflow-hidden">
      <CardHeader className="bg-purple-header px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Pool Data</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex border-b border-gray-800">
          {(['POOLS', 'PROBABLES', 'WILL PAYS', 'TOTALS'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 px-4 py-3 text-center ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'text-gray-400 hover:bg-gray-800/50'
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
