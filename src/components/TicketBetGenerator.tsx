import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket } from 'lucide-react';
import { Horse } from '../utils/types';
import { BetSelection, TicketConstruction } from './ticket/types';
import BetTypeSelector from './ticket/BetTypeSelector';
import RaceSelector from './ticket/RaceSelector';
import TicketConstructionControls from './ticket/TicketConstructionControls';
import HorseSelectionGrid from './ticket/HorseSelectionGrid';
import TicketSummary from './ticket/TicketSummary';
import { calculateBoxCost } from './ticket/utils';

interface TicketBetGeneratorProps {
  horses: Horse[];
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

  const availableHorses = horses.filter(horse => !horse.isDisqualified);

  const handleBetTypeChange = (betType: BetSelection['betType']) => {
    setSelectedBetType(betType);
    setTicketConstruction(prev => ({ 
      ...prev, 
      betType,
      isBoxMode: false,
      isKeyMode: false,
      isWithMode: false
    }));
  };

  const handleRaceChange = (race: number, betType: 'daily_double' | 'pick_three') => {
    if (betType === 'daily_double') {
      setSelectedRaceForDD(race);
    } else {
      setSelectedRaceForP3(race);
    }
  };

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

  const setWithPosition = (position: number) => {
    const positionKey = `withPosition${position}` as keyof TicketConstruction;
    setTicketConstruction(prev => ({
      ...prev,
      [positionKey]: []
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

  const buildTicket = () => {
    const { betType, boxHorses, keyHorses, withHorses, withPosition1, withPosition2, withPosition3, withPosition4, amount } = ticketConstruction;
    
    let raceNumber = 7;
    if (betType === 'daily_double') {
      raceNumber = selectedRaceForDD;
    } else if (betType === 'pick_three') {
      raceNumber = selectedRaceForP3;
    }

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
            amount: calculateBoxCost(boxHorses.length, betType, amount),
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
        <BetTypeSelector 
          selectedBetType={selectedBetType}
          onBetTypeChange={handleBetTypeChange}
        />

        <RaceSelector 
          selectedBetType={selectedBetType}
          selectedRaceForDD={selectedRaceForDD}
          selectedRaceForP3={selectedRaceForP3}
          onRaceChange={handleRaceChange}
        />

        <TicketConstructionControls 
          selectedBetType={selectedBetType}
          ticketConstruction={ticketConstruction}
          onActivateBoxMode={activateBoxMode}
          onActivateKeyMode={activateKeyMode}
          onActivateWithMode={activateWithMode}
          onSetWithPosition={setWithPosition}
        />

        <HorseSelectionGrid 
          horses={horses}
          selectedBetType={selectedBetType}
          ticketConstruction={ticketConstruction}
          onAddHorseToBox={addHorseToBox}
          onAddHorseToKey={addHorseToKey}
          onAddHorseToWith={addHorseToWith}
          onAddHorseToWithPosition={addHorseToWithPosition}
          onAddHorseToSelection={addHorseToSelection}
        />

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

        <TicketSummary 
          selections={selections}
          horses={horses}
          onUpdateAmount={updateAmount}
          onRemoveSelection={removeSelection}
          onClearAll={() => setSelections([])}
          onBuildTicket={() => console.log('Build ticket:', selections)}
        />
      </CardContent>
    </Card>
  );
};

export default TicketBetGenerator;
