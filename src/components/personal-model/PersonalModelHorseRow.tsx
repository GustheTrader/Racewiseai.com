
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Horse } from '../../utils/types';
import { formatOdds } from '../../utils/formatters';
import { getPostPositionColor, getOddsColor } from './utils';

interface PersonalModelHorseRowProps {
  horse: Horse;
  isCollapsed: boolean;
  personalModelOdds: Record<number, number>;
  personalModelScores: Record<number, number>;
  onToggleCollapse: (horseId: number) => void;
}

const PersonalModelHorseRow: React.FC<PersonalModelHorseRowProps> = ({
  horse,
  isCollapsed,
  personalModelOdds,
  personalModelScores,
  onToggleCollapse
}) => {
  const ppColor = getPostPositionColor(horse.pp);
  const textColor = horse.pp === 2 || horse.pp === 4 || horse.pp === 12 ? "text-black" : "text-white";

  return (
    <tr className="hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300 group/row relative overflow-hidden">
      <td className="px-4 py-3 text-center relative z-10">
        <button onClick={() => onToggleCollapse(horse.id)} className="rounded-full p-1 bg-gray-800/50 group-hover:bg-gray-600/50 transition-colors duration-300">
          {isCollapsed ? (
            <EyeOff className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
          )}
        </button>
      </td>
      <td className="px-4 py-3 text-left relative z-10">
        <div 
          className="w-6 h-6 flex items-center justify-center border border-gray-500/50 backdrop-blur-sm shadow-lg"
          style={{ backgroundColor: ppColor }}
        >
          <span className={`text-xs font-bold ${textColor}`}>{horse.pp}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-left relative z-10">
        <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-medium">{horse.name}</span>
      </td>
      <td className="px-4 py-3 text-right font-mono relative z-10">
        <span className={getOddsColor(horse.liveOdds, horse.mlOdds)}>
          {formatOdds(horse.liveOdds)}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-mono relative z-10">
        {formatOdds(horse.mlOdds || 0)}
      </td>
      <td className="px-4 py-3 text-right font-mono relative z-10">
        <span className={getOddsColor(horse.modelOdds, horse.mlOdds)}>
          {formatOdds(horse.modelOdds)}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-mono relative z-10">
        {horse.qModelScore || 'N/A'}
      </td>
      <td className="px-4 py-3 text-right font-mono font-bold text-blue-400 relative z-10">
        {personalModelOdds[horse.id] ? (
          <span className={getOddsColor(personalModelOdds[horse.id], horse.mlOdds)}>
            {formatOdds(personalModelOdds[horse.id])}
          </span>
        ) : '-'}
      </td>
      <td className="px-4 py-3 text-right font-mono font-bold text-green-400 relative z-10">
        {personalModelScores[horse.id] || '-'}
      </td>
    </tr>
  );
};

export default PersonalModelHorseRow;
