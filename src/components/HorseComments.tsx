
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface HorseComment {
  name: string;
  comment: string;
}

interface HorseCommentsProps {
  comments: HorseComment[];
}

const HorseComments: React.FC<HorseCommentsProps> = ({ comments }) => {
  return (
    <Card className="border-4 border-betting-tertiaryPurple shadow-xl bg-betting-darkPurple overflow-hidden">
      <CardHeader className="bg-purple-header px-4 py-3">
        <CardTitle className="text-lg font-semibold text-white">Horse Comments</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          {comments.map((horse, index) => (
            <div key={index} className="p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors">
              <div className="flex items-center mb-1">
                <span className="text-xs text-gray-400 mr-2">PP{index + 1}</span>
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
