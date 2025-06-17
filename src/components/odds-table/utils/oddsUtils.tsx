import React from 'react';

export const getOddsColor = (odds: number, mlOdds?: number) => {
  if (!mlOdds) return '';
  if (odds < mlOdds) return 'text-red-500';
  if (odds > mlOdds) return 'text-green-500';
  return '';
};

export const getHandicappingFactorDisplay = (hf?: number) => {
  if (!hf) return <span className="text-gray-500">-</span>;
  
  if (hf === 15) {
    return (
      <span className="px-2 py-1 text-xs bg-green-600 text-white rounded font-bold">
        $$$
      </span>
    );
  } else if (hf === 15.5) { // 15a
    return (
      <span className="px-2 py-1 text-xs bg-green-700 text-white rounded font-bold">
        $$$
      </span>
    );
  } else if (hf === 19) {
    return (
      <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded font-bold">
        IP
      </span>
    );
  } else if (hf === 20) {
    return (
      <span className="px-2 py-1 text-xs bg-orange-600 text-white rounded font-bold">
        LL
      </span>
    );
  }
  
  return <span className="text-gray-500">-</span>;
};
