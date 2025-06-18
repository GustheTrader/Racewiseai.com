
import React from 'react';
import { Horse } from '../../utils/types';

interface CollapsedHorsesBarProps {
  collapsedHorses: Horse[];
  onToggleHorse: (horseId: number) => void;
}

const CollapsedHorsesBar: React.FC<CollapsedHorsesBarProps> = ({ collapsedHorses, onToggleHorse }) => {
  if (collapsedHorses.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700/50">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-400">Collapsed horses:</span>
        {collapsedHorses.map((horse) => (
          <button
            key={horse.id}
            onClick={() => onToggleHorse(horse.id)}
            className="text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded transition-colors"
          >
            {horse.pp} - {horse.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CollapsedHorsesBar;
