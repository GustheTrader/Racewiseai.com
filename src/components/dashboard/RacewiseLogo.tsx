import React from 'react';
import racewiseLogo from '@/assets/racewise-logo.png';

const RacewiseLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <img 
        src={racewiseLogo} 
        alt="Racewise AI Toolbox" 
        className="h-12 md:h-14 object-contain"
      />
    </div>
  );
};

export default RacewiseLogo;
