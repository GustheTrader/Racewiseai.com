
import { PaceData } from '../types';

// Generate pace data
export const generatePaceData = (): PaceData[] => {
  return [
    { name: 'Fast Lane', early: 0, middle: 7, late: 6 },
    { name: 'Thunder Bolt', early: 8, middle: 0, late: 8 },
    { name: 'Silver Streak', early: 2, middle: 0, late: 0 },
    { name: 'Golden Arrow', early: 0, middle: 8, late: 0 },
    { name: 'Dark Horse', early: 5, middle: 8, late: 10 },
    { name: 'Lightning Flash', early: 0, middle: 4, late: 3 },
    { name: 'Wind Chaser', early: 4, middle: 8, late: 0 }
  ];
};
