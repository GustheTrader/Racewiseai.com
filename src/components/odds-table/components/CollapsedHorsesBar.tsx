
import React from 'react';
import { Horse } from '../../../utils/types';
import { getPostPositionColor, getPostPositionTextColor } from '../utils/postPositionUtils';

interface CollapsedHorsesBarProps {
  collapsedHorses: Horse[];
  onToggleHorse: (horseId: number) => void;
}

const CollapsedHorsesBar: React.FC<CollapsedHorsesBarProps> = ({ 
  collapsedHorses, 
  onToggleHorse 
}) => {
  if (collapsedHorses.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-gradient-to-r from-gray-800/40 to-gray-900/30 border-b border-gray-700/50 backdrop-blur-sm">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-400 mr-2">Collapsed:</span>
        {collapsedHorses.map((horse) => {
          const ppColor = getPostPositionColor(horse.pp);
          const textColor = getPostPositionTextColor(horse.pp);
          
          return (
            <button
              key={horse.id}
              onClick={() => onToggleHorse(horse.id)}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-gradient-to-r from-gray-700/60 to-gray-600/60 hover:from-gray-600/60 hover:to-gray-500/60 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-purple-500/30"
              title={`Click to expand ${horse.name}`}
            >
              <div 
                className="w-5 h-5 flex items-center justify-center border border-gray-500/50 rounded backdrop-blur-sm shadow-lg"
                style={{ backgroundColor: ppColor }}
              >
                <span className={`text-xs font-bold ${textColor}`}>{horse.pp}</span>
              </div>
              <span className="text-xs text-white">{horse.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CollapsedHorsesBar;
