
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { compareOdds } from '@/utils/oddsUtils';
import { formatDifference } from '@/utils/formatters';

interface Horse {
  rank: number;
  pp: number;
  horseName: string;
  mlOdds: string;
  quantumKpcaOdds: string;
  score: number;
  jockey: string;
  trainer: string;
  comment: string;
}

interface RankingsTableProps {
  rankings: Horse[];
}

const RankingsTable: React.FC<RankingsTableProps> = ({ rankings }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-betting-darkPurple">
          <TableRow>
            <TableHead className="text-white">Rank</TableHead>
            <TableHead className="text-white">PP</TableHead>
            <TableHead className="text-white">Horse</TableHead>
            <TableHead className="text-white">ML Odds</TableHead>
            <TableHead className="text-white">Quantum kPCA Odds</TableHead>
            <TableHead className="text-white">Delta</TableHead>
            <TableHead className="text-white">Quantum Score</TableHead>
            <TableHead className="text-white">Jockey</TableHead>
            <TableHead className="text-white">Trainer</TableHead>
            <TableHead className="text-white">Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankings.map((horse) => {
            const { delta, hasValue } = compareOdds(horse.mlOdds, horse.quantumKpcaOdds);
            return (
              <TableRow key={horse.rank} className="hover:bg-betting-darkPurple/20">
                <TableCell className="font-medium">{horse.rank}</TableCell>
                <TableCell>{horse.pp}</TableCell>
                <TableCell>{horse.horseName}</TableCell>
                <TableCell>{horse.mlOdds}</TableCell>
                <TableCell>{horse.quantumKpcaOdds}</TableCell>
                <TableCell>
                  <span className={`font-mono px-2 py-1 rounded ${hasValue ? 'text-betting-positive bg-betting-positive/10' : 'text-betting-negative bg-betting-negative/10'}`}>
                    {formatDifference(delta)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono bg-betting-darkPurple px-2 py-1 rounded text-orange-400">
                    {horse.score}
                  </span>
                </TableCell>
                <TableCell>{horse.jockey}</TableCell>
                <TableCell>{horse.trainer}</TableCell>
                <TableCell className="max-w-xs">{horse.comment}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RankingsTable;
