
import { PoolData, ExoticPool } from '../types';

// Generate pool data
export const generatePoolData = (): PoolData[] => {
  return [
    { number: 1, odds: '46', win: 21462, place: 22383, show: 21978 },
    { number: 2, odds: '11', win: 33263, place: 31046, show: 22425 },
    { number: 3, odds: '20', win: 35934, place: 33194, show: 21697 },
    { number: 4, odds: '15', win: 28750, place: 26840, show: 22150 },
    { number: 5, odds: '11', win: 33263, place: 31046, show: 22425 },
    { number: 6, odds: '19', win: 32185, place: 31512, show: 21978 },
    { number: 7, odds: '9/2', win: 321136, place: 39419, show: 39211 },
    { number: 8, odds: '8', win: 131219, place: 89576, show: 68411 }
  ];
};

// Generate exotic pools data
export const generateExoticPools = (): ExoticPool[] => {
  return [
    { name: '$2 Exacta', amount: 156634 },
    { name: '$1 Trifecta', amount: 183366 },
    { name: '$1 Superfecta', amount: 89388 },
    { name: '$1 Super High 5', amount: 22606 },
    { name: '$1 Double', amount: 32301 },
    { name: '$1 Pick 3', amount: 32337 },
    { name: '$1 Pick 5', amount: 74869 }
  ];
};
