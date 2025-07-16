
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Horse } from '../../../utils/types';
import { getPostPositionColor, getPostPositionTextColor } from '../utils/postPositionUtils';
import { getOddsColor, getHandicappingFactorDisplay } from '../utils/oddsUtils';

interface HorseRowProps {
  horse: Horse;
  highlightUpdates?: boolean;
  isSelected?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse: (horseId: number) => void;
}

const HorseRow: React.FC<HorseRowProps> = ({ horse, highlightUpdates = false, isSelected = false, isCollapsed = false, onToggleCollapse }) => {
  const ppColor = getPostPositionColor(horse.pp);
  const textColor = getPostPositionTextColor(horse.pp);
  const liveOddsColor = getOddsColor(horse.liveOdds, horse.mlOdds);
  const modelOddsColor = getOddsColor(horse.modelOdds, horse.mlOdds);

  return (
    <tr key={horse.id} className="group transition-colors duration-300 hover:bg-gray-700/20">
      <td className="px-4 py-3 text-center">
        <button onClick={() => onToggleCollapse(horse.id)} className="rounded-full p-1 bg-gray-800/50 group-hover:bg-gray-600/50 transition-colors duration-300">
          {isCollapsed ? (
            <EyeOff className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
          )}
        </button>
      </td>
      <td className="px-4 py-3 text-center">
        <div 
          className="w-7 h-7 flex items-center justify-center rounded-full font-bold shadow-lg border border-gray-500/50 backdrop-blur-sm"
          style={{ backgroundColor: ppColor }}
        >
          <span className={textColor}>{horse.pp}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <div className="ml-2">
            <div className="font-medium text-white">{horse.name}</div>
            <div className="text-gray-500 text-xs">Horse Details</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {horse.mlOdds}
      </td>
      <td className={`px-4 py-3 ${liveOddsColor}`}>
        {horse.liveOdds}
      </td>
      <td className="px-4 py-3">
        {horse.difference}
      </td>
      <td className={`px-4 py-3 ${modelOddsColor}`}>
        {horse.modelOdds}
      </td>
      <td className="px-4 py-3">
        {horse.qModelWinPct}
      </td>
      <td className="px-4 py-3">
        {horse.qModelScore}
      </td>
      <td className="px-4 py-3">
        {horse.jockey}
      </td>
      <td className="px-4 py-3">
        {horse.trainer}
      </td>
      <td className="px-4 py-3 text-center">
        <button className="text-sm text-gray-400 hover:text-blue-300 transition-colors duration-300">
          View Stats
        </button>
      </td>
      <td className="px-4 py-3 text-center">
        {getHandicappingFactorDisplay(horse.handicappingFactor)}
      </td>
    </tr>
  );
};

export default HorseRow;
