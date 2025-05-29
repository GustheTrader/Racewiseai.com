
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BetType, BetSelection } from './types';

interface BetTypeSelectorProps {
  selectedBetType: BetSelection['betType'];
  onBetTypeChange: (betType: BetSelection['betType']) => void;
}

const betTypes: BetType[] = [
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

const BetTypeSelector: React.FC<BetTypeSelectorProps> = ({ selectedBetType, onBetTypeChange }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white">Select Bet Type</h3>
      <Select value={selectedBetType} onValueChange={onBetTypeChange}>
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
  );
};

export default BetTypeSelector;
