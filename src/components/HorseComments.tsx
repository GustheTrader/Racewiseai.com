
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Horse } from '../utils/types';
import { MessageSquare } from 'lucide-react';

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
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.02] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm px-4 py-3 border-b border-purple-500/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <MessageSquare className="h-5 w-5 text-purple-300" />
          </div>
          Horse Comments
          <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          {horseCommentsData.map((horse) => (
            <div key={horse.name} className="p-3 bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-xl hover:from-gray-700/60 hover:to-gray-800/40 transition-all duration-300 border border-white/5 backdrop-blur-sm group hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-1">
                  <span className="text-xs text-gray-400 mr-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-2 py-1 rounded-md">PP{horse.pp}</span>
                  <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">{horse.name}</h3>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">{horse.comment}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HorseComments;
