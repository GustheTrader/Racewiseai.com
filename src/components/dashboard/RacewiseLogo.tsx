import React from 'react';
import { Zap } from 'lucide-react';

const RacewiseLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 group">
      {/* Gradient icon container with enhanced pulsing glow */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 w-14 h-14 -m-1 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 opacity-50 blur-xl animate-logo-glow-outer" />
        
        {/* Main icon */}
        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg animate-logo-glow group-hover:scale-110 transition-transform duration-300">
          <Zap className="w-6 h-6 text-white fill-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] animate-icon-pulse" />
        </div>
      </div>
      
      {/* Text container */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_100%]">
            RACEWISE AI
          </span>
        </div>
        <span className="text-[10px] font-semibold tracking-[0.25em] text-cyan-400/80 uppercase">
          Edge Models
        </span>
      </div>
    </div>
  );
};

export default RacewiseLogo;
