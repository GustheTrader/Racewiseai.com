
import { SharpMove } from '../types';

// Generate sharp movement data
export const generateSharpMovements = (): SharpMove[] => {
  return [
    { 
      horse: 'Fast Lane', 
      timestamp: '12:45:15', 
      amount: 12500, 
      oldOdds: '3.40', 
      newOdds: '3.20', 
      direction: 'down' 
    },
    { 
      horse: 'Silver Streak', 
      timestamp: '12:52:42', 
      amount: 8700, 
      oldOdds: '3.00', 
      newOdds: '2.80', 
      direction: 'down' 
    },
    { 
      horse: 'Golden Arrow', 
      timestamp: '12:58:11', 
      amount: 5400, 
      oldOdds: '6.90', 
      newOdds: '7.30', 
      direction: 'up' 
    },
    { 
      horse: 'Wind Chaser', 
      timestamp: '13:02:52', 
      amount: 3300, 
      oldOdds: '15.50', 
      newOdds: '15.00', 
      direction: 'down' 
    }
  ];
};
