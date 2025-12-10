import React from 'react';
import { Zap } from 'lucide-react';

const RacewiseLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Icon container with gradient background */}
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap className="w-7 h-7 text-white" fill="currentColor" />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 blur-lg opacity-50 -z-10" />
      </div>
      
      {/* Text with gradient */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            RACEWISE
          </span>
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent ml-1">
            AI
          </span>
        </h1>
        <span className="text-xs font-medium tracking-widest text-muted-foreground/80 uppercase">
          Toolbox
        </span>
      </div>
    </div>
  );
};

export default RacewiseLogo;
