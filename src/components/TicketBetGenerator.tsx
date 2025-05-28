
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Horse } from '../utils/types';
import { Plus, Minus, Ticket, Calculator, DollarSign, Target, Sparkles, TrendingUp, Star, Trophy, Crown, Key, ChevronDown } from 'lucide-react';

interface TicketBetGeneratorProps {
  horses: Horse[];
}

interface BetSelection {
  horseId: number;
  horseName: string;
  pp: number;
  betType: 'win' | 'place' | 'show' | 'exacta' | 'trifecta' | 'superfecta' | 'daily_double' | 'pick_three' | 'win_place_show' | 'win_place' | 'win_show' | 'place_show' | 'double' | 'pick_3';
  amount: number;
  isKeyHorse?: boolean;
  extraBox?: boolean;
}

const TicketBetGenerator: React.FC<TicketBetGeneratorProps> = ({ horses }) => {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [selectedBetType, setSelectedBetType] = useState<BetSelection['betType']>('win');

  const betTypes = [
    { type: 'win' as const, label: 'WIN', color: 'bg-green-600' },
    { type: 'place' as const, label: 'PLACE', color: 'bg-blue-600' },
    { type: 'show' as const, label: 'SHOW', color: 'bg-purple-600' },
    { type: 'win_place_show' as const, label: 'WIN/PLACE/SHOW', color: 'bg-indigo-600' },
    { type: 'win_place' as const, label: 'WIN/PLACE', color: 'bg-cyan-600' },
    { type: 'win_show' as const, label: 'WIN/SHOW', color: 'bg-teal-600' },
    { type: 'place_show' as const, label: 'PLACE/SHOW', color: 'bg-emerald-600' },
    { type: 'exacta' as const, label: 'EXACTA', color: 'bg-orange-600' },
    { type: 'trifecta' as const, label: 'TRIFECTA', color: 'bg-red-600' },
    { type: 'superfecta' as const, label: 'SUPERFECTA', color: 'bg-pink-600' },
    { type: 'double' as const, label: 'DOUBLE', color: 'bg-violet-600' },
    { type: 'daily_double' as const, label: 'DAILY DOUBLE', color: 'bg-indigo-700' },
    { type: 'pick_3' as const, label: 'PICK 3', color: 'bg-emerald-700' },
    { type: 'pick_three' as const, label: 'PICK THREE', color: 'bg-green-700' },
  ];

  // Filter out disqualified horses
  const availableHorses = horses.filter(horse => !horse.isDisqualified);

  const addHorseToTicket = (horse: Horse) => {
    if (horse.isDisqualified) return;
    
    const newSelection: BetSelection = {
      horseId: horse.id,
      horseName: horse.name,
      pp: horse.pp,
      betType: selectedBetType,
      amount: 2,
      isKeyHorse: false,
      extraBox: false
    };
    setSelections([...selections, newSelection]);
  };

  const removeSelection = (index: number) => {
    setSelections(selections.filter((_, i) => i !== index));
  };

  const updateAmount = (index: number, amount: number) => {
    const updated = [...selections];
    updated[index].amount = Math.max(1, amount);
    setSelections(updated);
  };

  const toggleKeyHorse = (index: number) => {
    const updated = [...selections];
    updated[index].isKeyHorse = !updated[index].isKeyHorse;
    setSelections(updated);
  };

  const toggleExtraBox = (index: number) => {
    const updated = [...selections];
    updated[index].extraBox = !updated[index].extraBox;
    setSelections(updated);
  };

  // Remove disqualified horses from existing selections
  React.useEffect(() => {
    const disqualifiedHorseIds = horses.filter(h => h.isDisqualified).map(h => h.id);
    if (disqualifiedHorseIds.length > 0) {
      setSelections(prev => prev.filter(selection => !disqualifiedHorseIds.includes(selection.horseId)));
    }
  }, [horses]);

  const getTotalCost = () => {
    return selections.reduce((total, selection) => {
      let baseCost = selection.amount;
      if (selection.extraBox) baseCost *= 2;
      return total + baseCost;
    }, 0);
  };

  const getPotentialPayout = () => {
    return selections.reduce((total, selection) => {
      const horse = availableHorses.find(h => h.id === selection.horseId);
      if (!horse) return total;
      
      let multiplier = 1;
      switch (selection.betType) {
        case 'win': multiplier = horse.liveOdds; break;
        case 'place': multiplier = horse.liveOdds * 0.6; break;
        case 'show': multiplier = horse.liveOdds * 0.4; break;
        case 'win_place_show': multiplier = horse.liveOdds * 1.8; break;
        case 'win_place': multiplier = horse.liveOdds * 1.4; break;
        case 'win_show': multiplier = horse.liveOdds * 1.2; break;
        case 'place_show': multiplier = horse.liveOdds * 0.8; break;
        case 'exacta': multiplier = horse.liveOdds * 2.5; break;
        case 'trifecta': multiplier = horse.liveOdds * 8; break;
        case 'superfecta': multiplier = horse.liveOdds * 25; break;
        case 'double': multiplier = horse.liveOdds * 2.8; break;
        case 'daily_double': multiplier = horse.liveOdds * 3.5; break;
        case 'pick_3': multiplier = horse.liveOdds * 10; break;
        case 'pick_three': multiplier = horse.liveOdds * 12; break;
      }
      
      let amount = selection.amount * multiplier;
      if (selection.extraBox) amount *= 1.5;
      if (selection.isKeyHorse) amount *= 1.2;
      
      return total + amount;
    }, 0);
  };

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

  const getSelectedHorseIds = () => {
    return new Set(selections.map(s => s.horseId));
  };

  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-gradient-to-br from-betting-darkPurple to-gray-900 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-700 via-blue-700 to-indigo-700 px-6 py-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
            <Ticket className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            BET TICKET GENERATOR
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Bet Type Dropdown Wheel */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Select Bet Type</h3>
          <Select value={selectedBetType} onValueChange={(value) => setSelectedBetType(value as BetSelection['betType'])}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${betTypes.find(b => b.type === selectedBetType)?.color}`}></div>
                  <span>{betTypes.find(b => b.type === selectedBetType)?.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 z-50">
              {betTypes.map((bet) => (
                <SelectItem key={bet.type} value={bet.type} className="text-white hover:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${bet.color}`}></div>
                    <span>{bet.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Horse Selection Grid */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Click Horses to Add to Ticket</h3>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
            {availableHorses.slice(0, 10).map((horse) => {
              const isSelected = getSelectedHorseIds().has(horse.id);
              return (
                <div 
                  key={horse.id} 
                  onClick={() => addHorseToTicket(horse)}
                  className={`bg-gray-800/60 rounded-lg p-3 border transition-all cursor-pointer hover:bg-gray-700/60 ${
                    isSelected ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-700 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-6 h-6 flex items-center justify-center border border-gray-500 rounded"
                        style={{ backgroundColor: getPostPositionColor(horse.pp) }}
                      >
                        <span className={`font-bold ${horse.pp === 2 || horse.pp === 4 ? 'text-black' : 'text-white'}`}>
                          {horse.pp}
                        </span>
                      </div>
                      <div>
                        <span className={`text-white font-medium ${isSelected ? 'text-yellow-300' : ''}`}>
                          {horse.name}
                        </span>
                        <div className="text-sm text-gray-400">Odds: {horse.liveOdds}/1</div>
                      </div>
                    </div>
                    <div className="text-sm text-green-400 font-bold">
                      Click to Add
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Selections */}
        {selections.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Your Ticket</h3>
            <div className="bg-gray-800/60 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {selections.map((selection, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-2">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-5 h-5 flex items-center justify-center border border-gray-500 rounded font-bold"
                      style={{ 
                        backgroundColor: getPostPositionColor(selection.pp),
                        color: selection.pp === 2 || selection.pp === 4 ? 'black' : 'white'
                      }}
                    >
                      {selection.pp}
                    </div>
                    <span className="text-white">{selection.horseName}</span>
                    <Badge variant="outline" className="capitalize border-purple-400 text-purple-300">
                      {selection.betType.replace('_', ' ')}
                    </Badge>
                    {selection.isKeyHorse && (
                      <Badge className="bg-yellow-600 text-white">
                        <Key className="h-3 w-3 mr-1" />
                        Key
                      </Badge>
                    )}
                    {selection.extraBox && (
                      <Badge className="bg-blue-600 text-white">
                        Extra
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleKeyHorse(index)}
                      className={`p-1 rounded transition-colors ${
                        selection.isKeyHorse ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                      title="Toggle key horse"
                    >
                      <Key className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => toggleExtraBox(index)}
                      className={`p-1 rounded transition-colors ${
                        selection.extraBox ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                      title="Toggle extra box"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => updateAmount(index, selection.amount - 1)}
                      className="p-1 bg-red-600 rounded hover:bg-red-700 transition-colors"
                    >
                      <Minus className="h-3 w-3 text-white" />
                    </button>
                    <span className="text-white font-mono min-w-[2rem] text-center">
                      ${selection.amount}
                    </span>
                    <button
                      onClick={() => updateAmount(index, selection.amount + 1)}
                      className="p-1 bg-green-600 rounded hover:bg-green-700 transition-colors"
                    >
                      <Plus className="h-3 w-3 text-white" />
                    </button>
                    <button
                      onClick={() => removeSelection(index)}
                      className="p-1 bg-gray-600 rounded hover:bg-gray-700 transition-colors ml-2"
                    >
                      <Minus className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ticket Summary */}
        {selections.length > 0 && (
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-4 border border-green-500/30">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">${getTotalCost()}</div>
                <div className="text-sm text-gray-400">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">${getPotentialPayout().toFixed(2)}</div>
                <div className="text-sm text-gray-400">Potential Payout</div>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <Button 
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold"
                onClick={() => console.log('Place bets:', selections)}
              >
                <Ticket className="h-4 w-4 mr-2" />
                Place Ticket
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelections([])}
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {selections.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select bet type and click horses to build your ticket</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketBetGenerator;
