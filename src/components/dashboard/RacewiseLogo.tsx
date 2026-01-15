import React from 'react';
import fireHorseLogo from '@/assets/racewise-fire-horse.png';

const RacewiseLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 group">
      {/* Fire horse logo with glow effect */}
      <div className="relative">
        {/* Outer fire glow */}
        <div className="absolute inset-0 w-16 h-16 -m-2 rounded-full bg-gradient-to-br from-orange-500 via-red-600 to-yellow-500 opacity-40 blur-xl animate-pulse" />
        
        {/* Main logo */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
          <img 
            src={fireHorseLogo} 
            alt="Racewise AI Fire Horse" 
            className="w-full h-full object-cover drop-shadow-[0_0_12px_rgba(255,165,0,0.8)]"
          />
        </div>
      </div>
      
      {/* Text container */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_100%]">
            RACEWISE AI
          </span>
        </div>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-orange-400/90 uppercase">
          Ignite Your Edge
        </span>
      </div>
    </div>
  );
};

export default RacewiseLogo;
