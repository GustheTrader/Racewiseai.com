import React from 'react';
import { Zap } from 'lucide-react';

const RacewiseLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Gradient icon container */}
      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
        <Zap className="w-6 h-6 text-white fill-white" />
      </div>
      
      {/* Text container */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            RACEWISE AI
          </span>
        </div>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Edge Models
        </span>
      </div>
    </div>
  );
};

export default RacewiseLogo;
