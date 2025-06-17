
import React from 'react';
import { Horse } from '../../../utils/types';
import { formatOdds, formatDifference, getChangeClass } from '../../../utils/formatters';
import { Badge } from '../../ui/badge';
import { TrendingDown, TrendingUp, AlertCircle, Eye } from 'lucide-react';
import { getPostPositionColor, getPostPositionTextColor } from '../utils/postPositionUtils';
import { getOddsColor, getHandicappingFactorDisplay } from '../utils/oddsUtils';

interface HorseRowProps {
  horse: Horse;
  highlightUpdates: boolean;
  isSelected: boolean;
  onToggleCollapse: (horseId: number) => void;
}

const HorseRow: React.FC<HorseRowProps> = ({ 
  horse, 
  highlightUpdates, 
  isSelected, 
  onToggleCollapse 
}) => {
  const ppColor = getPostPositionColor(horse.pp);
  const textColor = getPostPositionTextColor(horse.pp);

  return (
    <tr 
      className={`${horse.irregularBetting ? 'bg-gradient-to-r from-red-900/20 to-red-800/10' : 'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10'} ${highlightUpdates ? 'transition-all duration-500' : ''} ${isSelected ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/20 border-l-4 border-yellow-500' : ''} group/row relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"></div>
      <td className="px-4 py-3 text-center relative z-10">
        <button
          onClick={() => onToggleCollapse(horse.id)}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700/30"
          title="Collapse horse"
        >
          <Eye className="h-4 w-4" />
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
      <td className="px-4 py-3 text-left flex items-center space-x-2 relative z-10">
        {horse.isFavorite && (
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-red-400 inline-block animate-pulse shadow-lg shadow-red-500/50"></span>
        )}
        <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-medium">{horse.name}</span>
        {horse.irregularBetting && (
          <Badge variant="destructive" className="ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs flex items-center gap-1 px-2 py-0.5 border border-red-400/30">
            <AlertCircle className="h-3 w-3" />
            <span>Irregular</span>
          </Badge>
        )}
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
        {horse.qModelWinPct ? `${horse.qModelWinPct}%` : 'N/A'}
      </td>
      <td className="px-4 py-3 text-right font-mono relative z-10">
        {horse.qModelScore || 'N/A'}
      </td>
      <td className="px-4 py-3 text-right font-mono flex justify-end items-center relative z-10">
        <span className={getChangeClass(horse.difference)}>
          {formatDifference(horse.difference)}
        </span>
        {horse.difference < 0 ? (
          <TrendingDown className="h-4 w-4 ml-1 text-betting-positive" />
        ) : horse.difference > 0 ? (
          <TrendingUp className="h-4 w-4 ml-1 text-betting-negative" />
        ) : null}
      </td>
      <td className="px-4 py-3 text-left relative z-10">
        {horse.jockey || 'N/A'}
      </td>
      <td className="px-4 py-3 text-left relative z-10">
        {horse.trainer || 'N/A'}
      </td>
      <td className="px-4 py-3 text-center relative z-10">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xs">{horse.jockeyWinPct || '0'}%</span>
          <span className="text-gray-400">/</span>
          <span className="text-xs">{horse.trainerWinPct || '0'}%</span>
          {horse.fireNumber && (
            <span className="fire-number ml-1">{horse.fireNumber}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center relative z-10">
        {getHandicappingFactorDisplay(horse.handicappingFactor)}
      </td>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform scale-x-0 group-hover/row:scale-x-100 transition-transform duration-500"></div>
    </tr>
  );
};

export default HorseRow;
