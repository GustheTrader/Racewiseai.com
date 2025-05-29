
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BetSelection } from './types';

interface RaceSelectorProps {
  selectedBetType: BetSelection['betType'];
  selectedRaceForDD: number;
  selectedRaceForP3: number;
  onRaceChange: (race: number, betType: 'daily_double' | 'pick_three') => void;
}

const RaceSelector: React.FC<RaceSelectorProps> = ({ 
  selectedBetType, 
  selectedRaceForDD, 
  selectedRaceForP3, 
  onRaceChange 
}) => {
  const needsRaceSelection = ['daily_double', 'pick_three'].includes(selectedBetType);
  
  if (!needsRaceSelection) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white">
        Select {selectedBetType === 'daily_double' ? 'Next Race' : 'Starting Race'}
      </h3>
      <Select 
        value={selectedBetType === 'daily_double' ? selectedRaceForDD.toString() : selectedRaceForP3.toString()} 
        onValueChange={(value) => {
          if (selectedBetType === 'daily_double') {
            onRaceChange(parseInt(value), 'daily_double');
          } else {
            onRaceChange(parseInt(value), 'pick_three');
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
  );
};

export default RaceSelector;
