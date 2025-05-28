
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Horse } from '../utils/types';
import { Plus, Minus, Ticket, Calculator, DollarSign, Target, Sparkles, TrendingUp, Star, Trophy, Crown, Key } from 'lucide-react';

interface TicketBetGeneratorProps {
  horses: Horse[];
}

interface BetSelection {
  horseId: number;
  horseName: string;
  pp: number;
  betType: 'win' | 'place' | 'show' | 'exacta' | 'trifecta' | 'superfecta' | 'daily_double' | 'pick_three';
  amount: number;
  isKeyHorse?: boolean;
  extraBox?: boolean;
}

const TicketBetGenerator: React.FC<TicketBetGeneratorProps> = ({ horses }) => {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [activeTab, setActiveTab] = useState<'win' | 'exotic' | 'multi'>('win');

  const betTypes = [
    { type: 'win' as const, label: 'Win', icon: Target, color: 'bg-green-600' },
    { type: 'place' as const, label: 'Place', icon: TrendingUp, color: 'bg-blue-600' },
    { type: 'show' as const, label: 'Show', icon: Sparkles, color: 'bg-purple-600' },
    { type: 'exacta' as const, label: 'Exacta', icon: Calculator, color: 'bg-orange-600' },
    { type: 'trifecta' as const, label: 'Trifecta', icon: DollarSign, color: 'bg-red-600' },
    { type: 'superfecta' as const, label: 'Superfecta', icon: Ticket, color: 'bg-pink-600' },
    { type: 'daily_double' as const, label: 'Daily Double', icon: Star, color: 'bg-indigo-600' },
    { type: 'pick_three' as const, label: 'Pick Three', icon: Crown, color: 'bg-emerald-600' },
  ];

  // Filter out disqualified horses
  const availableHorses = horses.filter(horse => !horse.isDisqualified);

  const addSelection = (horse: Horse, betType: BetSelection['betType']) => {
    if (horse.isDisqualified) return; // Don't add disqualified horses
    
    const newSelection: BetSelection = {
      horseId: horse.id,
      horseName: horse.name,
      pp: horse.pp,
      betType,
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
        case 'exacta': multiplier = horse.liveOdds * 2.5; break;
        case 'trifecta': multiplier = horse.liveOdds * 8; break;
        case 'superfecta': multiplier = horse.liveOdds * 25; break;
        case 'daily_double': multiplier = horse.liveOdds * 3.5; break;
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
      default: return "#3B82F6";
    }
  };

  const getSelectedHorseIds = () => {
    return new Set(selections.map(s => s.horseId));
  };

  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-2xl bg-gradient-to-br from-betting-darkPurple to-gray-900 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 px-4 py-3">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur">
            <Ticket className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent text-base">
            Ticket Bet Generator
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('win')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all text-sm ${
              activeTab === 'win' 
                ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Win/Place/Show
          </button>
          <button
            onClick={() => setActiveTab('exotic')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all text-sm ${
              activeTab === 'exotic' 
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Exotic Bets
          </button>
          <button
            onClick={() => setActiveTab('multi')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all text-sm ${
              activeTab === 'multi' 
                ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Multi-Race
          </button>
        </div>

        {/* Horse Selection Grid */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-white mb-3">Select Horses & Bet Types</h3>
          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto custom-scrollbar">
            {availableHorses.slice(0, 8).map((horse) => {
              const isSelected = getSelectedHorseIds().has(horse.id);
              return (
                <div 
                  key={horse.id} 
                  className={`bg-gray-800/60 rounded-lg p-3 border transition-all ${
                    isSelected ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-700 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 flex items-center justify-center border border-gray-500 rounded text-xs"
                        style={{ backgroundColor: getPostPositionColor(horse.pp) }}
                      >
                        <span className={`text-xs font-bold ${horse.pp === 2 || horse.pp === 4 ? 'text-black' : 'text-white'}`}>
                          {horse.pp}
                        </span>
                      </div>
                      <div>
                        <span className={`text-white font-medium text-sm ${isSelected ? 'text-yellow-300' : ''}`}>
                          {horse.name}
                        </span>
                        <div className="text-xs text-gray-400">Odds: {horse.liveOdds}/1</div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {betTypes
                        .filter(bet => {
                          if (activeTab === 'win') return ['win', 'place', 'show'].includes(bet.type);
                          if (activeTab === 'exotic') return ['exacta', 'trifecta', 'superfecta'].includes(bet.type);
                          return ['daily_double', 'pick_three'].includes(bet.type);
                        })
                        .map((bet) => {
                          const BetIcon = bet.icon;
                          return (
                            <button
                              key={bet.type}
                              onClick={() => addSelection(horse, bet.type)}
                              className={`p-1.5 rounded-md ${bet.color} hover:opacity-80 transition-all text-white`}
                              title={`Add ${bet.label} bet`}
                            >
                              <BetIcon className="h-3 w-3" />
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Selections */}
        {selections.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white">Your Ticket</h3>
            <div className="bg-gray-800/60 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {selections.map((selection, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-5 h-5 flex items-center justify-center border border-gray-500 rounded text-xs font-bold"
                      style={{ 
                        backgroundColor: getPostPositionColor(selection.pp),
                        color: selection.pp === 2 || selection.pp === 4 ? 'black' : 'white'
                      }}
                    >
                      {selection.pp}
                    </div>
                    <span className="text-white text-sm">{selection.horseName}</span>
                    <Badge variant="outline" className="capitalize border-purple-400 text-purple-300 text-xs px-1 py-0">
                      {selection.betType.replace('_', ' ')}
                    </Badge>
                    {selection.isKeyHorse && (
                      <Badge className="bg-yellow-600 text-white text-xs px-1 py-0">
                        <Key className="h-2 w-2 mr-1" />
                        Key
                      </Badge>
                    )}
                    {selection.extraBox && (
                      <Badge className="bg-blue-600 text-white text-xs px-1 py-0">
                        Extra
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleKeyHorse(index)}
                      className={`p-1 rounded transition-colors text-xs ${
                        selection.isKeyHorse ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                      title="Toggle key horse"
                    >
                      <Key className="h-2 w-2" />
                    </button>
                    <button
                      onClick={() => toggleExtraBox(index)}
                      className={`p-1 rounded transition-colors text-xs ${
                        selection.extraBox ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                      title="Toggle extra box"
                    >
                      <Plus className="h-2 w-2" />
                    </button>
                    <button
                      onClick={() => updateAmount(index, selection.amount - 1)}
                      className="p-1 bg-red-600 rounded hover:bg-red-700 transition-colors"
                    >
                      <Minus className="h-2 w-2 text-white" />
                    </button>
                    <span className="text-white font-mono min-w-[2rem] text-center text-xs">
                      ${selection.amount}
                    </span>
                    <button
                      onClick={() => updateAmount(index, selection.amount + 1)}
                      className="p-1 bg-green-600 rounded hover:bg-green-700 transition-colors"
                    >
                      <Plus className="h-2 w-2 text-white" />
                    </button>
                    <button
                      onClick={() => removeSelection(index)}
                      className="p-1 bg-gray-600 rounded hover:bg-gray-700 transition-colors ml-1"
                    >
                      <Minus className="h-2 w-2 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ticket Summary */}
        {selections.length > 0 && (
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-3 border border-green-500/30">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">${getTotalCost()}</div>
                <div className="text-xs text-gray-400">Total Cost</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">${getPotentialPayout().toFixed(2)}</div>
                <div className="text-xs text-gray-400">Potential Payout</div>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <Button 
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold text-sm py-2"
                onClick={() => console.log('Place bets:', selections)}
              >
                <Ticket className="h-3 w-3 mr-1" />
                Place Ticket
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelections([])}
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white text-sm py-2"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {selections.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <Ticket className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select horses and bet types to build your ticket</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketBetGenerator;
