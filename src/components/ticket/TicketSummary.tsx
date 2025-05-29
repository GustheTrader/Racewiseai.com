
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Ticket } from 'lucide-react';
import { BetSelection } from './types';
import { Horse } from '../../utils/types';

interface TicketSummaryProps {
  selections: BetSelection[];
  horses: Horse[];
  onUpdateAmount: (index: number, amount: number) => void;
  onRemoveSelection: (index: number) => void;
  onClearAll: () => void;
  onBuildTicket: () => void;
}

const TicketSummary: React.FC<TicketSummaryProps> = ({
  selections,
  horses,
  onUpdateAmount,
  onRemoveSelection,
  onClearAll,
  onBuildTicket
}) => {
  const availableHorses = horses.filter(horse => !horse.isDisqualified);

  const getPostPositionColor = (position: number): string => {
    switch (position) {
      case 1: return "#DC2626";
      case 2: return "#FFFFFF";
      case 3: return "#2563EB";
      case 4: return "#FACC15";
      case 5: return "#16A34A";
      case 6: return "#000000";
      case 7: return "#F97316";
      case 8: return "#EC4899";
      case 9: return "#10B981";
      case 10: return "#9333EA";
      case 11: return "#84CC16";
      case 12: return "#9CA3AF";
      default: return "#3B82F6";
    }
  };

  const getTotalCost = () => {
    return selections.reduce((total, selection) => {
      return total + selection.amount;
    }, 0);
  };

  const getPotentialPayoutRange = () => {
    let lowTotal = 0;
    let highTotal = 0;

    selections.forEach(selection => {
      const horse = availableHorses.find(h => h.id === selection.horseId);
      if (!horse) return;
      
      let lowMultiplier = 1;
      let highMultiplier = 1;
      
      switch (selection.betType) {
        case 'win': 
          lowMultiplier = horse.liveOdds * 0.8; 
          highMultiplier = horse.liveOdds * 1.2; 
          break;
        case 'place': 
          lowMultiplier = horse.liveOdds * 0.4; 
          highMultiplier = horse.liveOdds * 0.8; 
          break;
        case 'show': 
          lowMultiplier = horse.liveOdds * 0.3; 
          highMultiplier = horse.liveOdds * 0.5; 
          break;
        case 'exacta': 
          lowMultiplier = horse.liveOdds * 1.5; 
          highMultiplier = horse.liveOdds * 4; 
          break;
        case 'trifecta': 
          lowMultiplier = horse.liveOdds * 5; 
          highMultiplier = horse.liveOdds * 15; 
          break;
        case 'superfecta': 
          lowMultiplier = horse.liveOdds * 15; 
          highMultiplier = horse.liveOdds * 50; 
          break;
        default:
          lowMultiplier = horse.liveOdds * 0.6;
          highMultiplier = horse.liveOdds * 1.4;
      }
      
      let lowAmount = selection.amount * lowMultiplier;
      let highAmount = selection.amount * highMultiplier;
      
      if (selection.isBoxBet) {
        lowAmount *= 1.2;
        highAmount *= 2;
      }
      if (selection.isKeyHorse) {
        lowAmount *= 1.1;
        highAmount *= 1.5;
      }
      
      lowTotal += lowAmount;
      highTotal += highAmount;
    });

    return { low: lowTotal, high: highTotal };
  };

  if (selections.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Select bet type and use BOX, Key, or With buttons to build your ticket</p>
      </div>
    );
  }

  return (
    <>
      {/* Current Selections */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">Your Ticket</h3>
        <div className="bg-gray-800/60 rounded-lg p-2 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
          {selections.map((selection, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 flex items-center justify-center border border-gray-500 rounded font-bold text-xs"
                  style={{ 
                    backgroundColor: getPostPositionColor(selection.pp),
                    color: selection.pp === 2 || selection.pp === 4 ? 'black' : 'white'
                  }}
                >
                  {selection.pp}
                </div>
                <span className="text-white text-sm">{selection.horseName}</span>
                <Badge variant="outline" className="capitalize border-purple-400 text-purple-300 text-xs">
                  {selection.betType.replace('_', ' ')}
                </Badge>
                {selection.raceNumber && selection.raceNumber !== 7 && (
                  <Badge className="bg-cyan-600 text-white text-xs">
                    R{selection.raceNumber}
                  </Badge>
                )}
                {selection.isKeyHorse && (
                  <Badge className="bg-yellow-600 text-white text-xs">Key</Badge>
                )}
                {selection.isBoxBet && (
                  <Badge className="bg-blue-600 text-white text-xs">BOX</Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onUpdateAmount(index, selection.amount - 1)}
                  className="p-1 bg-red-600 rounded hover:bg-red-700 transition-colors"
                >
                  <Minus className="h-2 w-2 text-white" />
                </button>
                <span className="text-white font-mono min-w-[1.5rem] text-center text-xs">
                  ${selection.amount}
                </span>
                <button
                  onClick={() => onUpdateAmount(index, selection.amount + 1)}
                  className="p-1 bg-green-600 rounded hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-2 w-2 text-white" />
                </button>
                <button
                  onClick={() => onRemoveSelection(index)}
                  className="p-1 bg-gray-600 rounded hover:bg-gray-700 transition-colors ml-1"
                >
                  <Minus className="h-2 w-2 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Summary */}
      <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-3 border border-green-500/30">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">${getTotalCost()}</div>
            <div className="text-xs text-gray-400">Total Cost</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-yellow-400">
              ${getPotentialPayoutRange().low.toFixed(0)} - ${getPotentialPayoutRange().high.toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">Potential Payout Range</div>
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <Button 
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-sm"
            onClick={onBuildTicket}
          >
            <Ticket className="h-3 w-3 mr-1" />
            Build Ticket
          </Button>
          <Button 
            variant="outline" 
            onClick={onClearAll}
            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white text-sm"
          >
            Clear All
          </Button>
        </div>
      </div>
    </>
  );
};

export default TicketSummary;
