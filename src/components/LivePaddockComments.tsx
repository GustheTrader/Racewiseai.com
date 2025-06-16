
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PaddockComment {
  timestamp: string;
  horse: string;
  comment: string;
}

interface LivePaddockCommentsProps {
  comments: PaddockComment[];
}

const LivePaddockComments: React.FC<LivePaddockCommentsProps> = ({ comments }) => {
  return (
    <Card className="group overflow-hidden h-full transform transition-all duration-500 hover:scale-[1.02] animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-amber-700/80 to-amber-600/90 backdrop-blur-sm px-4 py-3 border-b border-amber-600/30">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full"></div>
          </div>
          Live Paddock Comments
          <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="overflow-y-auto max-h-[510px] scrollbar-on-left pr-2">
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={index} className="p-3 bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-xl hover:from-gray-700/60 hover:to-gray-800/40 transition-all duration-300 border border-white/5 backdrop-blur-sm group hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10">
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-2 py-1 rounded-md">PP{index + 1}</span>
                    <h3 className="text-sm font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">{comment.horse}</h3>
                  </div>
                  <span className="text-xs text-gray-400">{comment.timestamp}</span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">{comment.comment}</p>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LivePaddockComments;
