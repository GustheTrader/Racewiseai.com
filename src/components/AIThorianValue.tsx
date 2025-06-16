
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, Target } from 'lucide-react';

interface PickCombination {
  combination: string;
  races: string;
}

interface ValuePick {
  race: number;
  pp: number;
  horse: string;
  odds: string;
  value: number;
  confidence: number;
}

interface AIThorianValueProps {
  valuePicks: ValuePick[];
  pick3Combos: PickCombination[];
}

const AIThorianValue: React.FC<AIThorianValueProps> = ({ valuePicks, pick3Combos }) => {
  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.02] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-amber-700/80 to-orange-600/80 backdrop-blur-sm px-4 py-3 border-b border-amber-600/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <Target className="h-5 w-5 text-amber-300" />
          </div>
          AI Bets - RollingPick 3 and Live EV Longshots
          <div className="ml-auto w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-6">
          <h3 className="text-md font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Live EV Longshots
          </h3>
          <div className="grid grid-cols-6 text-xs font-semibold text-gray-400 mb-1 px-2 bg-gradient-to-r from-gray-800/50 to-gray-900/30 rounded-lg py-2 backdrop-blur-sm">
            <div>Race</div>
            <div>PP</div>
            <div>Horse</div>
            <div>Odds</div>
            <div>Value %</div>
            <div>Confidence</div>
          </div>
          <div className="space-y-2">
            {valuePicks.map((pick, index) => (
              <div key={index} className="grid grid-cols-6 bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-3 rounded-xl text-sm border border-white/5 backdrop-blur-sm hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group/pick relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/pick:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 font-medium">{pick.race}</div>
                <div className="relative z-10 font-medium">{pick.pp}</div>
                <div className="relative z-10 font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{pick.horse}</div>
                <div className="relative z-10 font-mono">{pick.odds}</div>
                <div className={`relative z-10 px-2 py-1 rounded-lg ${pick.value > 15 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30' : pick.value > 5 ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-200 border border-gray-500/30'}`}>
                  +{pick.value}%
                </div>
                <div className="relative z-10">
                  <div className="w-full bg-gray-700/50 rounded-full h-2 backdrop-blur-sm border border-white/10">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full shadow-lg shadow-cyan-500/30 transition-all duration-300" 
                      style={{ width: `${pick.confidence}%` }}
                    ></div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent transform scale-x-0 group-hover/pick:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            Pick 3 Rolling Combinations
          </h3>
          <div className="grid grid-cols-2 text-xs font-semibold text-gray-400 mb-1 px-2 bg-gradient-to-r from-gray-800/50 to-gray-900/30 rounded-lg py-2 backdrop-blur-sm">
            <div>Races</div>
            <div>Combination</div>
          </div>
          <div className="space-y-2">
            {pick3Combos.map((combo, index) => (
              <div key={index} className="grid grid-cols-2 bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-3 rounded-xl text-sm border border-white/5 backdrop-blur-sm hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group/combo relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/combo:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 font-mono">{combo.races}</div>
                <div className="relative z-10 font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{combo.combination}</div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent transform scale-x-0 group-hover/combo:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIThorianValue;
