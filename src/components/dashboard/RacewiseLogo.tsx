import React from 'react';
import logoWebp from '@/assets/racewise-logo.webp';
import logoAvif from '@/assets/racewise-logo.avif';

const RacewiseLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <picture>
        <source srcSet={logoAvif} type="image/avif" />
        <source srcSet={logoWebp} type="image/webp" />
        <img src={logoWebp} alt="Racewise AI Toolbox" className="h-12 md:h-14 object-contain" />
      </picture>
    </div>
  );
};

export default RacewiseLogo;
