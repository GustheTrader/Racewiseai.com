
import React from 'react';
import { SharpMove } from '../utils/mockData';
import { formatCurrency } from '../utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SharpMovementProps {
  movements: SharpMove[];
}

const SharpMovement: React.FC<SharpMovementProps> = ({ movements }) => {
  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.02] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm px-4 py-3 border-b border-purple-500/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <TrendingUp className="h-5 w-5 text-purple-300" />
          </div>
          Sharp Movement
          <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 space-y-2">
        {movements.map((move, index) => (
          <div key={index} className="p-3 bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-xl hover:from-gray-700/60 hover:to-gray-800/40 transition-all duration-300 border border-white/5 backdrop-blur-sm group hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center">
                <span className="font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{move.horse}</span>
                <span className="text-sm text-gray-400">{move.timestamp}</span>
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                <div className="font-mono text-sm bg-gradient-to-r from-gray-800/70 to-gray-900/70 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                  {formatCurrency(move.amount)}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">{move.oldOdds}</span>
                  <span className="text-gray-400">→</span>
                  <span 
                    className={`font-medium ${
                      move.direction === 'down' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {move.newOdds}
                  </span>
                  {move.direction === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SharpMovement;
