import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Horse } from '../utils/types';
import { Plus, Minus, Ticket, Calculator, DollarSign, Target, Sparkles, TrendingUp, Star, Trophy, Crown, Key, ChevronDown, Box } from 'lucide-react';

interface TicketBetGeneratorProps {
  horses: Horse[];
}

interface BetSelection {
  horseId: number;
  horseName: string;
  pp: number;
  betType: 'win' | 'place' | 'show' | 'exacta' | 'trifecta' | 'superfecta' | 'daily_double' | 'pick_three' | 'win_place_show' | 'win_place' | 'win_show' | 'place_show';
  amount: number;
  isKeyHorse?: boolean;
  isBoxBet?: boolean;
  withPosition?: number;
  raceNumber?: number;
}

interface TicketConstruction {
  betType: BetSelection['betType'];
  boxHorses: number[];
  keyHorses: number[];
  withHorses: number[];
  withPosition1: number[];
  withPosition2: number[];
  withPosition3: number[];
  withPosition4: number[];
  amount: number;
  raceNumber?: number;
  isBoxMode: boolean;
  isKeyMode: boolean;
  isWithMode: boolean;
}

const TicketBetGenerator: React.FC<TicketBetGeneratorProps> = ({ horses }) => {
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [selectedBetType, setSelectedBetType] = useState<BetSelection['betType']>('win');
  const [selectedRaceForDD, setSelectedRaceForDD] = useState<number>(8);
  const [selectedRaceForP3, setSelectedRaceForP3] = useState<number>(8);
  const [ticketConstruction, setTicketConstruction] = useState<TicketConstruction>({
    betType: 'win',
    boxHorses: [],
    keyHorses: [],
    withHorses: [],
    withPosition1: [],
    withPosition2: [],
    withPosition3: [],
    withPosition4: [],
    amount: 2,
    isBoxMode: false,
    isKeyMode: false,
    isWithMode: false
  });

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
    { type: 'daily_double' as const, label: 'DAILY DOUBLE', color: 'bg-indigo-700' },
    { type: 'pick_three' as const, label: 'PICK THREE', color: 'bg-green-700' },
  ];

  const availableHorses = horses.filter(horse => !horse.isDisqualified);

  const activateBoxMode = () => {
    setTicketConstruction(prev => ({
      ...prev,
      betType: selectedBetType,
      boxHorses: [],
      isBoxMode: true,
      isKeyMode: false,
      isWithMode: false
    }));
  };

  const activateKeyMode = () => {
    setTicketConstruction(prev => ({
      ...prev,
      betType: selectedBetType,
      keyHorses: [],
      isBoxMode: false,
      isKeyMode: true,
      isWithMode: false
    }));
  };

  const activateWithMode = () => {
    setTicketConstruction(prev => ({
      ...prev,
      betType: selectedBetType,
      withHorses: [],
      isBoxMode: false,
      isKeyMode: false,
      isWithMode: true
    }));
  };

  const addHorseToBox = (horse: Horse) => {
    if (horse.isDisqualified) return;
    setTicketConstruction(prev => ({
      ...prev,
      betType: selectedBetType,
      boxHorses: prev.boxHorses.includes(horse.pp) 
        ? prev.boxHorses.filter(pp => pp !== horse.pp)
        : [...prev.boxHorses, horse.pp].sort((a, b) => a - b)
    }));
  };

  const addHorseToKey = (horse: Horse) => {
    if (horse.isDisqualified) return;
    setTicketConstruction(prev => ({
      ...prev,
      betType: selectedBetType,
      keyHorses: prev.keyHorses.includes(horse.pp) 
        ? prev.keyHorses.filter(pp => pp !== horse.pp)
        : [...prev.keyHorses, horse.pp].sort((a, b) => a - b)
    }));
  };

  const addHorseToWith = (horse: Horse) => {
    if (horse.isDisqualified) return;
    setTicketConstruction(prev => ({
      ...prev,
      betType: selectedBetType,
      withHorses: prev.withHorses.includes(horse.pp) 
        ? prev.withHorses.filter(pp => pp !== horse.pp)
        : [...prev.withHorses, horse.pp].sort((a, b) => a - b)
    }));
  };

  const addHorseToWithPosition = (horse: Horse, position: number) => {
    if (horse.isDisqualified) return;
    const positionKey = `withPosition${position}` as keyof TicketConstruction;
    setTicketConstruction(prev => ({
      ...prev,
      betType: selectedBetType,
      [positionKey]: (prev[positionKey] as number[]).includes(horse.pp) 
        ? (prev[positionKey] as number[]).filter(pp => pp !== horse.pp)
        : [...(prev[positionKey] as number[]), horse.pp].sort((a, b) => a - b)
    }));
  };

  // New function to add horse to selection for win/place/show
  const addHorseToSelection = (horse: Horse) => {
    if (horse.isDisqualified) return;
    
    const newSelection: BetSelection = {
      horseId: horse.id,
      horseName: horse.name,
      pp: horse.pp,
      betType: selectedBetType,
      amount: 2,
      raceNumber: selectedBetType === 'daily_double' ? selectedRaceForDD : 
                 selectedBetType === 'pick_three' ? selectedRaceForP3 : 7
    };

    setSelections(prev => [...prev, newSelection]);
  };

  const calculateBoxCost = (numHorses: number, betType: string) => {
    if (numHorses < 2) return 0;
    
    switch (betType) {
      case 'exacta':
        return numHorses * (numHorses - 1) * ticketConstruction.amount;
      case 'trifecta':
        return numHorses * (numHorses - 1) * (numHorses - 2) * ticketConstruction.amount;
      case 'superfecta':
        return numHorses * (numHorses - 1) * (numHorses - 2) * (numHorses - 3) * ticketConstruction.amount;
      default:
        return numHorses * (numHorses - 1) * ticketConstruction.amount;
    }
  };

  const buildTicket = () => {
    const { betType, boxHorses, keyHorses, withHorses, withPosition1, withPosition2, withPosition3, withPosition4, amount } = ticketConstruction;
    
    let raceNumber = 7;
    if (betType === 'daily_double') {
      raceNumber = selectedRaceForDD;
    } else if (betType === 'pick_three') {
      raceNumber = selectedRaceForP3;
    }

    // Create ticket based on construction
    const newSelections: BetSelection[] = [];

    if (boxHorses.length > 0) {
      boxHorses.forEach(pp => {
        const horse = availableHorses.find(h => h.pp === pp);
        if (horse) {
          newSelections.push({
            horseId: horse.id,
            horseName: horse.name,
            pp: horse.pp,
            betType,
            amount: calculateBoxCost(boxHorses.length, betType),
            isBoxBet: true,
            raceNumber
          });
        }
      });
    }

    if (keyHorses.length > 0) {
      keyHorses.forEach(pp => {
        const horse = availableHorses.find(h => h.pp === pp);
        if (horse) {
          newSelections.push({
            horseId: horse.id,
            horseName: horse.name,
            pp: horse.pp,
            betType,
            amount,
            isKeyHorse: true,
            raceNumber
          });
        }
      });
    }

    if (withHorses.length > 0) {
      withHorses.forEach(pp => {
        const horse = availableHorses.find(h => h.pp === pp);
        if (horse) {
          newSelections.push({
            horseId: horse.id,
            horseName: horse.name,
            pp: horse.pp,
            betType,
            amount,
            raceNumber
          });
        }
      });
    }

    if (withPosition1.length > 0) {
      withPosition1.forEach(pp => {
        const horse = availableHorses.find(h => h.pp === pp);
        if (horse) {
          newSelections.push({
            horseId: horse.id,
            horseName: horse.name,
            pp: horse.pp,
            betType,
            amount,
            raceNumber
          });
        }
      });
    }

    if (withPosition2.length > 0) {
      withPosition2.forEach(pp => {
        const horse = availableHorses.find(h => h.pp === pp);
        if (horse) {
          newSelections.push({
            horseId: horse.id,
            horseName: horse.name,
            pp: horse.pp,
            betType,
            amount,
            raceNumber
          });
        }
      });
    }

    if (withPosition3.length > 0) {
      withPosition3.forEach(pp => {
        const horse = availableHorses.find(h => h.pp === pp);
        if (horse) {
          newSelections.push({
            horseId: horse.id,
            horseName: horse.name,
            pp: horse.pp,
            betType,
            amount,
            raceNumber
          });
        }
      });
    }

    if (withPosition4.length > 0) {
      withPosition4.forEach(pp => {
        const horse = availableHorses.find(h => h.pp === pp);
        if (horse) {
          newSelections.push({
            horseId: horse.id,
            horseName: horse.name,
            pp: horse.pp,
            betType,
            amount,
            raceNumber
          });
        }
      });
    }

    setSelections([...selections, ...newSelections]);
    
    // Reset construction
    setTicketConstruction({
      betType: selectedBetType,
      boxHorses: [],
      keyHorses: [],
      withHorses: [],
      withPosition1: [],
      withPosition2: [],
      withPosition3: [],
      withPosition4: [],
      amount: 2,
      isBoxMode: false,
      isKeyMode: false,
      isWithMode: false
    });
  };

  const removeSelection = (index: number) => {
    setSelections(selections.filter((_, i) => i !== index));
  };

  const updateAmount = (index: number, amount: number) => {
    const updated = [...selections];
    updated[index].amount = Math.max(1, amount);
    setSelections(updated);
  };

  React.useEffect(() => {
    const disqualifiedHorseIds = horses.filter(h => h.isDisqualified).map(h => h.id);
    if (disqualifiedHorseIds.length > 0) {
      setSelections(prev => prev.filter(selection => !disqualifiedHorseIds.includes(selection.horseId)));
    }
  }, [horses]);

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

  const formatTicketDisplay = () => {
    const { boxHorses, keyHorses, withHorses, withPosition1, withPosition2, withPosition3, withPosition4 } = ticketConstruction;
    const parts = [];
    
    if (boxHorses.length > 0) {
      const cost = calculateBoxCost(boxHorses.length, ticketConstruction.betType);
      parts.push(`BOX: ${boxHorses.join(',')} ($${cost})`);
    }
    if (keyHorses.length > 0) {
      parts.push(`KEY: ${keyHorses.join(',')}`);
    }
    if (withHorses.length > 0) {
      parts.push(`WITH: ${withHorses.join(',')}`);
    }
    if (withPosition1.length > 0) {
      parts.push(`1st: ${withPosition1.join(',')}`);
    }
    if (withPosition2.length > 0) {
      parts.push(`2nd: ${withPosition2.join(',')}`);
    }
    if (withPosition3.length > 0) {
      parts.push(`3rd: ${withPosition3.join(',')}`);
    }
    if (withPosition4.length > 0) {
      parts.push(`4th: ${withPosition4.join(',')}`);
    }
    
    return parts.join(' | ') || 'Select horses to build ticket';
  };

  const canUseBoxOrKey = (betType: BetSelection['betType']) => {
    return ['exacta', 'trifecta', 'superfecta'].includes(betType);
  };

  const canUseWithPositions = (betType: BetSelection['betType']) => {
    return betType === 'superfecta';
  };

  const canUseTrifectaPositions = (betType: BetSelection['betType']) => {
    return betType === 'trifecta';
  };

  const needsRaceSelection = (betType: BetSelection['betType']) => {
    return ['daily_double', 'pick_three'].includes(betType);
  };

  const isWinPlaceShowBet = (betType: BetSelection['betType']) => {
    return ['win', 'place', 'show', 'win_place_show', 'win_place', 'win_show', 'place_show'].includes(betType);
  };

  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-gradient-to-br from-betting-darkPurple to-gray-900 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-700 via-blue-700 to-indigo-700 px-6 py-4">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
            <Ticket className="h-4 w-4" />
          </div>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent text-sm">
            BET TICKET GENERATOR
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-5 space-y-3">
        {/* Bet Type Dropdown */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Select Bet Type</h3>
          <Select value={selectedBetType} onValueChange={(value) => {
            setSelectedBetType(value as BetSelection['betType']);
            setTicketConstruction(prev => ({ 
              ...prev, 
              betType: value as BetSelection['betType'],
              isBoxMode: false,
              isKeyMode: false,
              isWithMode: false
            }));
          }}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white text-sm">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${betTypes.find(b => b.type === selectedBetType)?.color}`}></div>
                  <span className="text-sm">{betTypes.find(b => b.type === selectedBetType)?.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 z-50">
              {betTypes.map((bet) => (
                <SelectItem key={bet.type} value={bet.type} className="text-white hover:bg-gray-700 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${bet.color}`}></div>
                    <span className="text-sm">{bet.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Race Selection for Multi-Race Bets */}
        {needsRaceSelection(selectedBetType) && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white">
              Select {selectedBetType === 'daily_double' ? 'Next Race' : 'Starting Race'}
            </h3>
            <Select 
              value={selectedBetType === 'daily_double' ? selectedRaceForDD.toString() : selectedRaceForP3.toString()} 
              onValueChange={(value) => {
                if (selectedBetType === 'daily_double') {
                  setSelectedRaceForDD(parseInt(value));
                } else {
                  setSelectedRaceForP3(parseInt(value));
                }
              }}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 z-50">
                {[8, 9, 10, 11, 12].map((race) => (
                  <SelectItem key={race} value={race.toString()} className="text-white hover:bg-gray-700 text-sm">
                    Race {race}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Ticket Construction Buttons */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Build Your Ticket</h3>
          <div className="flex gap-2 mb-2">
            <Button
              onClick={activateBoxMode}
              className={`text-white text-xs px-2 py-1 ${
                canUseBoxOrKey(selectedBetType) 
                  ? (ticketConstruction.isBoxMode ? 'bg-blue-600' : 'bg-blue-600 hover:bg-blue-700') 
                  : 'bg-gray-500'
              }`}
              disabled={!canUseBoxOrKey(selectedBetType)}
            >
              <Box className="h-3 w-3 mr-1" />
              BOX
            </Button>
            <Button
              onClick={activateKeyMode}
              className={`text-white text-xs px-2 py-1 ${
                canUseBoxOrKey(selectedBetType) 
                  ? (ticketConstruction.isKeyMode ? 'bg-yellow-600' : 'bg-yellow-600 hover:bg-yellow-700') 
                  : 'bg-gray-500'
              }`}
              disabled={!canUseBoxOrKey(selectedBetType)}
            >
              <Key className="h-3 w-3 mr-1" />
              Key
            </Button>
            {!canUseWithPositions(selectedBetType) && !canUseTrifectaPositions(selectedBetType) && (
              <Button
                onClick={activateWithMode}
                className={`text-white text-xs px-2 py-1 ${
                  canUseBoxOrKey(selectedBetType) 
                    ? (ticketConstruction.isWithMode ? 'bg-green-600' : 'bg-green-600 hover:bg-green-700') 
                    : 'bg-gray-500'
                }`}
                disabled={!canUseBoxOrKey(selectedBetType)}
              >
                With
              </Button>
            )}
          </div>

          {/* Trifecta Position Buttons */}
          {canUseTrifectaPositions(selectedBetType) && !ticketConstruction.isBoxMode && !ticketConstruction.isKeyMode && (
            <div className="grid grid-cols-3 gap-1 mb-2">
              <Button
                onClick={() => setTicketConstruction(prev => ({ ...prev, withPosition1: [] }))}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
              >
                1
              </Button>
              <Button
                onClick={() => setTicketConstruction(prev => ({ ...prev, withPosition2: [] }))}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
              >
                2
              </Button>
              <Button
                onClick={() => setTicketConstruction(prev => ({ ...prev, withPosition3: [] }))}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
              >
                3
              </Button>
            </div>
          )}

          {/* Superfecta Position Buttons */}
          {canUseWithPositions(selectedBetType) && !ticketConstruction.isBoxMode && !ticketConstruction.isKeyMode && (
            <div className="grid grid-cols-4 gap-1 mb-2">
              <Button
                onClick={() => setTicketConstruction(prev => ({ ...prev, withPosition1: [] }))}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
              >
                1
              </Button>
              <Button
                onClick={() => setTicketConstruction(prev => ({ ...prev, withPosition2: [] }))}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
              >
                2
              </Button>
              <Button
                onClick={() => setTicketConstruction(prev => ({ ...prev, withPosition3: [] }))}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
              >
                3
              </Button>
              <Button
                onClick={() => setTicketConstruction(prev => ({ ...prev, withPosition4: [] }))}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
              >
                4
              </Button>
            </div>
          )}

          <div className="bg-gray-800/60 rounded p-2 text-white text-sm min-h-[2rem] flex items-center">
            {formatTicketDisplay()}
          </div>
        </div>

        {/* Horse Selection Grid */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Click Horses to Add to Ticket</h3>
          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto custom-scrollbar">
            {availableHorses.slice(0, 10).map((horse) => {
              const isInBox = ticketConstruction.boxHorses.includes(horse.pp);
              const isKeyHorse = ticketConstruction.keyHorses.includes(horse.pp);
              const isWithHorse = ticketConstruction.withHorses.includes(horse.pp);
              const isInWith1 = ticketConstruction.withPosition1.includes(horse.pp);
              const isInWith2 = ticketConstruction.withPosition2.includes(horse.pp);
              const isInWith3 = ticketConstruction.withPosition3.includes(horse.pp);
              const isInWith4 = ticketConstruction.withPosition4.includes(horse.pp);
              
              return (
                <div key={horse.id} className="bg-gray-800/60 rounded-lg p-2 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-5 h-5 flex items-center justify-center border border-gray-500 rounded text-xs"
                        style={{ backgroundColor: getPostPositionColor(horse.pp) }}
                      >
                        <span className={`font-bold text-xs ${horse.pp === 2 || horse.pp === 4 ? 'text-black' : 'text-white'}`}>
                          {horse.pp}
                        </span>
                      </div>
                      <div>
                        <span className="text-white font-medium text-sm">{horse.name}</span>
                        <div className="text-xs text-gray-400">Odds: {horse.liveOdds}/1</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Box Mode Select Button */}
                  {ticketConstruction.isBoxMode && canUseBoxOrKey(selectedBetType) && (
                    <button
                      onClick={() => addHorseToBox(horse)}
                      className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                        isInBox ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-blue-500'
                      }`}
                    >
                      {isInBox ? 'SELECTED' : 'SELECT'}
                    </button>
                  )}

                  {/* Key Mode Select Button */}
                  {ticketConstruction.isKeyMode && canUseBoxOrKey(selectedBetType) && (
                    <button
                      onClick={() => addHorseToKey(horse)}
                      className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                        isKeyHorse ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-yellow-500'
                      }`}
                    >
                      {isKeyHorse ? 'SELECTED' : 'SELECT'}
                    </button>
                  )}

                  {/* With Mode Select Button */}
                  {ticketConstruction.isWithMode && canUseBoxOrKey(selectedBetType) && !canUseWithPositions(selectedBetType) && !canUseTrifectaPositions(selectedBetType) && (
                    <button
                      onClick={() => addHorseToWith(horse)}
                      className={`w-full px-2 py-1 rounded text-xs transition-colors ${
                        isWithHorse ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-green-500'
                      }`}
                    >
                      {isWithHorse ? 'SELECTED' : 'SELECT'}
                    </button>
                  )}

                  {/* Regular button controls when no mode is active */}
                  {!ticketConstruction.isBoxMode && !ticketConstruction.isKeyMode && !ticketConstruction.isWithMode && (
                    <>
                      {/* Main betting buttons */}
                      <div className="flex gap-1 mb-1">
                        <button
                          onClick={() => addHorseToBox(horse)}
                          className={`flex-1 px-2 py-1 rounded text-xs ${
                            canUseBoxOrKey(selectedBetType) 
                              ? (isInBox ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500')
                              : 'bg-gray-500 text-gray-400'
                          }`}
                          disabled={!canUseBoxOrKey(selectedBetType)}
                        >
                          <Box className="h-3 w-3 mx-auto" />
                        </button>
                        <button
                          onClick={() => addHorseToKey(horse)}
                          className={`flex-1 px-2 py-1 rounded text-xs ${
                            canUseBoxOrKey(selectedBetType)
                              ? (isKeyHorse ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500')
                              : 'bg-gray-500 text-gray-400'
                          }`}
                          disabled={!canUseBoxOrKey(selectedBetType)}
                        >
                          <Key className="h-3 w-3 mx-auto" />
                        </button>
                        {!canUseWithPositions(selectedBetType) && !canUseTrifectaPositions(selectedBetType) && (
                          <button
                            onClick={() => addHorseToWith(horse)}
                            className={`flex-1 px-2 py-1 rounded text-xs ${
                              canUseBoxOrKey(selectedBetType)
                                ? (isWithHorse ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500')
                                : 'bg-gray-500 text-gray-400'
                            }`}
                            disabled={!canUseBoxOrKey(selectedBetType)}
                          >
                            W
                          </button>
                        )}
                      </div>

                      {/* Trifecta position buttons */}
                      {canUseTrifectaPositions(selectedBetType) && (
                        <div className="grid grid-cols-3 gap-1 mb-1">
                          <button
                            onClick={() => addHorseToWithPosition(horse, 1)}
                            className={`px-1 py-1 rounded text-xs ${
                              isInWith1 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            1
                          </button>
                          <button
                            onClick={() => addHorseToWithPosition(horse, 2)}
                            className={`px-1 py-1 rounded text-xs ${
                              isInWith2 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            2
                          </button>
                          <button
                            onClick={() => addHorseToWithPosition(horse, 3)}
                            className={`px-1 py-1 rounded text-xs ${
                              isInWith3 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            3
                          </button>
                        </div>
                      )}

                      {/* Superfecta position buttons */}
                      {canUseWithPositions(selectedBetType) && (
                        <div className="grid grid-cols-4 gap-1 mb-1">
                          <button
                            onClick={() => addHorseToWithPosition(horse, 1)}
                            className={`px-1 py-1 rounded text-xs ${
                              isInWith1 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            1
                          </button>
                          <button
                            onClick={() => addHorseToWithPosition(horse, 2)}
                            className={`px-1 py-1 rounded text-xs ${
                              isInWith2 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            2
                          </button>
                          <button
                            onClick={() => addHorseToWithPosition(horse, 3)}
                            className={`px-1 py-1 rounded text-xs ${
                              isInWith3 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            3
                          </button>
                          <button
                            onClick={() => addHorseToWithPosition(horse, 4)}
                            className={`px-1 py-1 rounded text-xs ${
                              isInWith4 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            4
                          </button>
                        </div>
                      )}

                      {/* Select button for win/place/show bets */}
                      {isWinPlaceShowBet(selectedBetType) && (
                        <button
                          onClick={() => addHorseToSelection(horse)}
                          className="w-full px-2 py-1 rounded text-xs bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                        >
                          SELECT
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Build Ticket Button */}
        {(ticketConstruction.boxHorses.length > 0 || ticketConstruction.keyHorses.length > 0 || ticketConstruction.withHorses.length > 0 || 
          ticketConstruction.withPosition1.length > 0 || ticketConstruction.withPosition2.length > 0 || 
          ticketConstruction.withPosition3.length > 0 || ticketConstruction.withPosition4.length > 0) && (
          <Button 
            onClick={buildTicket}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-sm"
          >
            Add to Ticket
          </Button>
        )}

        {/* Current Selections */}
        {selections.length > 0 && (
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
                      onClick={() => updateAmount(index, selection.amount - 1)}
                      className="p-1 bg-red-600 rounded hover:bg-red-700 transition-colors"
                    >
                      <Minus className="h-2 w-2 text-white" />
                    </button>
                    <span className="text-white font-mono min-w-[1.5rem] text-center text-xs">
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
                onClick={() => console.log('Build ticket:', selections)}
              >
                <Ticket className="h-3 w-3 mr-1" />
                Build Ticket
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelections([])}
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white text-sm"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}

        {selections.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select bet type and use BOX, Key, or With buttons to build your ticket</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketBetGenerator;
