
import React from 'react';
import { Button } from '@/components/ui/button';
import { Box, Key } from 'lucide-react';
import { BetSelection, TicketConstruction } from './types';

interface TicketConstructionControlsProps {
  selectedBetType: BetSelection['betType'];
  ticketConstruction: TicketConstruction;
  onActivateBoxMode: () => void;
  onActivateKeyMode: () => void;
  onActivateWithMode: () => void;
  onSetWithPosition: (position: number) => void;
}

const TicketConstructionControls: React.FC<TicketConstructionControlsProps> = ({
  selectedBetType,
  ticketConstruction,
  onActivateBoxMode,
  onActivateKeyMode,
  onActivateWithMode,
  onSetWithPosition
}) => {
  const canUseBoxOrKey = ['exacta', 'trifecta', 'superfecta'].includes(selectedBetType);
  const canUseWithPositions = selectedBetType === 'superfecta';
  const canUseTrifectaPositions = selectedBetType === 'trifecta';

  const formatTicketDisplay = () => {
    const { boxHorses, keyHorses, withHorses, withPosition1, withPosition2, withPosition3, withPosition4 } = ticketConstruction;
    const parts = [];
    
    if (boxHorses.length > 0) {
      const cost = calculateBoxCost(boxHorses.length, ticketConstruction.betType, ticketConstruction.amount);
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

  const calculateBoxCost = (numHorses: number, betType: string, amount: number) => {
    if (numHorses < 2) return 0;
    
    switch (betType) {
      case 'exacta':
        return numHorses * (numHorses - 1) * amount;
      case 'trifecta':
        return numHorses * (numHorses - 1) * (numHorses - 2) * amount;
      case 'superfecta':
        return numHorses * (numHorses - 1) * (numHorses - 2) * (numHorses - 3) * amount;
      default:
        return numHorses * (numHorses - 1) * amount;
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white">Build Your Ticket</h3>
      <div className="flex gap-2 mb-2">
        <Button
          onClick={onActivateBoxMode}
          className={`text-white text-xs px-2 py-1 ${
            canUseBoxOrKey 
              ? (ticketConstruction.isBoxMode ? 'bg-blue-600' : 'bg-blue-600 hover:bg-blue-700') 
              : 'bg-gray-500'
          }`}
          disabled={!canUseBoxOrKey}
        >
          <Box className="h-3 w-3 mr-1" />
          BOX
        </Button>
        <Button
          onClick={onActivateKeyMode}
          className={`text-white text-xs px-2 py-1 ${
            canUseBoxOrKey 
              ? (ticketConstruction.isKeyMode ? 'bg-yellow-600' : 'bg-yellow-600 hover:bg-yellow-700') 
              : 'bg-gray-500'
          }`}
          disabled={!canUseBoxOrKey}
        >
          <Key className="h-3 w-3 mr-1" />
          Key
        </Button>
        {!canUseWithPositions && !canUseTrifectaPositions && (
          <Button
            onClick={onActivateWithMode}
            className={`text-white text-xs px-2 py-1 ${
              canUseBoxOrKey 
                ? (ticketConstruction.isWithMode ? 'bg-green-600' : 'bg-green-600 hover:bg-green-700') 
                : 'bg-gray-500'
            }`}
            disabled={!canUseBoxOrKey}
          >
            With
          </Button>
        )}
      </div>

      {/* Trifecta Position Buttons */}
      {canUseTrifectaPositions && !ticketConstruction.isBoxMode && !ticketConstruction.isKeyMode && (
        <div className="grid grid-cols-3 gap-1 mb-2">
          <Button
            onClick={() => onSetWithPosition(1)}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
          >
            1
          </Button>
          <Button
            onClick={() => onSetWithPosition(2)}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
          >
            2
          </Button>
          <Button
            onClick={() => onSetWithPosition(3)}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
          >
            3
          </Button>
        </div>
      )}

      {/* Superfecta Position Buttons */}
      {canUseWithPositions && !ticketConstruction.isBoxMode && !ticketConstruction.isKeyMode && (
        <div className="grid grid-cols-4 gap-1 mb-2">
          <Button
            onClick={() => onSetWithPosition(1)}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
          >
            1
          </Button>
          <Button
            onClick={() => onSetWithPosition(2)}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
          >
            2
          </Button>
          <Button
            onClick={() => onSetWithPosition(3)}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 py-1"
          >
            3
          </Button>
          <Button
            onClick={() => onSetWithPosition(4)}
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
  );
};

export default TicketConstructionControls;
