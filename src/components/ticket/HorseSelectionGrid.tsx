
import React from 'react';
import { Button } from '@/components/ui/button';
import { Box, Key } from 'lucide-react';
import { Horse } from '../../utils/types';
import { BetSelection, TicketConstruction } from './types';

interface HorseSelectionGridProps {
  horses: Horse[];
  selectedBetType: BetSelection['betType'];
  ticketConstruction: TicketConstruction;
  onAddHorseToBox: (horse: Horse) => void;
  onAddHorseToKey: (horse: Horse) => void;
  onAddHorseToWith: (horse: Horse) => void;
  onAddHorseToWithPosition: (horse: Horse, position: number) => void;
  onAddHorseToSelection: (horse: Horse) => void;
}

const HorseSelectionGrid: React.FC<HorseSelectionGridProps> = ({
  horses,
  selectedBetType,
  ticketConstruction,
  onAddHorseToBox,
  onAddHorseToKey,
  onAddHorseToWith,
  onAddHorseToWithPosition,
  onAddHorseToSelection
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

  const canUseBoxOrKey = (betType: BetSelection['betType']) => {
    return ['exacta', 'trifecta', 'superfecta'].includes(betType);
  };

  const canUseWithPositions = (betType: BetSelection['betType']) => {
    return betType === 'superfecta';
  };

  const canUseTrifectaPositions = (betType: BetSelection['betType']) => {
    return betType === 'trifecta';
  };

  const isWinPlaceShowBet = (betType: BetSelection['betType']) => {
    return ['win', 'place', 'show', 'win_place_show', 'win_place', 'win_show', 'place_show'].includes(betType);
  };

  return (
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
                  onClick={() => onAddHorseToBox(horse)}
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
                  onClick={() => onAddHorseToKey(horse)}
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
                  onClick={() => onAddHorseToWith(horse)}
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
                      onClick={() => onAddHorseToBox(horse)}
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
                      onClick={() => onAddHorseToKey(horse)}
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
                        onClick={() => onAddHorseToWith(horse)}
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
                        onClick={() => onAddHorseToWithPosition(horse, 1)}
                        className={`px-1 py-1 rounded text-xs ${
                          isInWith1 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        1
                      </button>
                      <button
                        onClick={() => onAddHorseToWithPosition(horse, 2)}
                        className={`px-1 py-1 rounded text-xs ${
                          isInWith2 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        2
                      </button>
                      <button
                        onClick={() => onAddHorseToWithPosition(horse, 3)}
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
                        onClick={() => onAddHorseToWithPosition(horse, 1)}
                        className={`px-1 py-1 rounded text-xs ${
                          isInWith1 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        1
                      </button>
                      <button
                        onClick={() => onAddHorseToWithPosition(horse, 2)}
                        className={`px-1 py-1 rounded text-xs ${
                          isInWith2 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        2
                      </button>
                      <button
                        onClick={() => onAddHorseToWithPosition(horse, 3)}
                        className={`px-1 py-1 rounded text-xs ${
                          isInWith3 ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        3
                      </button>
                      <button
                        onClick={() => onAddHorseToWithPosition(horse, 4)}
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
                      onClick={() => onAddHorseToSelection(horse)}
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
  );
};

export default HorseSelectionGrid;
