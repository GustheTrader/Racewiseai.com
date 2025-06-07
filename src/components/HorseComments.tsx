
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Horse } from '../utils/types';

interface HorseComment {
  name: string;
  comment: string;
  pp?: number;
}

interface HorseCommentsProps {
  comments: HorseComment[];
  horses?: Horse[];
}

const HorseComments: React.FC<HorseCommentsProps> = ({ comments, horses = [] }) => {
  // Filter out disqualified horses to match OddsTable behavior
  const availableHorses = horses.filter(horse => !horse.isDisqualified);

  // If we have actual horse data, use it to create comments with proper PP numbers
  const horseCommentsData = availableHorses.length > 0 
    ? availableHorses.map((horse) => {
        // Find existing comment for this horse or use a default one
        const existingComment = comments.find(c => c.name === horse.name);
        return {
          name: horse.name,
          pp: horse.pp,
          comment: existingComment?.comment || `${horse.name} is positioned well for today's race based on recent form and training patterns. Watch for late moves in the stretch.`
        };
      })
    : comments.map((comment, index) => ({
        ...comment,
        pp: comment.pp || index + 1
      }));

  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-betting-darkPurple overflow-hidden">
      <CardHeader className="bg-purple-header px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Horse Comments</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          {horseCommentsData.map((horse) => (
            <div key={horse.name} className="p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors">
              <div className="flex items-center mb-1">
                <span className="text-xs text-gray-400 mr-2">PP{horse.pp}</span>
                <h3 className="text-sm font-bold text-yellow-400">{horse.name}</h3>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">{horse.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HorseComments;
