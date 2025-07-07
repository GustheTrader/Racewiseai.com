
import { Horse } from '../types';

// Generate mock horse data
export const generateHorses = (): Horse[] => {
  const horses = [
    { 
      id: 1, 
      pp: 1, 
      name: 'Fast Lightning', 
      liveOdds: 6.5, 
      mlOdds: 6.0,
      modelOdds: 7.0,
      qModelWinPct: 14.3,
      qModelScore: 85,
      difference: -0.5, 
      isFavorite: false,
      jockey: "J. Smith",
      trainer: "T. Brown",
      hFactors: { speed: true, form: true },
      handicappingFactor: 15 // Money Horse
    },
    { 
      id: 2, 
      pp: 2, 
      name: 'Lucky Star', 
      liveOdds: 9.2, 
      mlOdds: 8.0,
      modelOdds: 10.4,
      qModelWinPct: 9.6,
      qModelScore: 72,
      difference: -1.2, 
      isFavorite: false,
      jockey: "M. Johnson",
      trainer: "R. Davis",
      hFactors: { speed: true, pace: true, class: true },
      handicappingFactor: 19 // Improving Horse
    },
    { 
      id: 3, 
      pp: 3, 
      name: 'Thunder Bolt', 
      liveOdds: 4.4, 
      mlOdds: 2.5,
      modelOdds: 6.3,
      qModelWinPct: 15.9,
      qModelScore: 92,
      difference: -1.9, 
      isFavorite: true,
      irregularBetting: true,
      jockey: "A. Williams",
      trainer: "S. Miller",
      hFactors: { pace: true, form: true },
      handicappingFactor: 15.5 // Money Horse (15a)
    },
    { 
      id: 4, 
      pp: 4, 
      name: 'Silver Streak', 
      liveOdds: 5.4, 
      mlOdds: 5.0,
      modelOdds: 5.8,
      qModelWinPct: 17.2,
      qModelScore: 88,
      difference: -0.4, 
      isFavorite: false,
      jockey: "D. Jones",
      trainer: "J. Wilson",
      hFactors: { form: true }
    },
    { 
      id: 5, 
      pp: 5, 
      name: 'Golden Arrow', 
      liveOdds: 7.8, 
      mlOdds: 10.0,
      modelOdds: 5.6,
      qModelWinPct: 17.9,
      qModelScore: 89,
      difference: 2.2, 
      isFavorite: false,
      irregularBetting: true,
      jockey: "R. Martinez",
      trainer: "L. Garcia",
      hFactors: { speed: true, class: true },
      handicappingFactor: 20 // Live Longshot
    },
    { 
      id: 6, 
      pp: 6, 
      name: 'Midnight Runner', 
      liveOdds: 4.5, 
      mlOdds: 4.0,
      modelOdds: 5.0,
      qModelWinPct: 20.0,
      qModelScore: 95,
      difference: -0.5, 
      isFavorite: false,
      jockey: "C. Taylor",
      trainer: "P. Anderson",
      hFactors: { pace: true },
      handicappingFactor: 19 // Improving Horse
    },
    { 
      id: 7, 
      pp: 7, 
      name: 'Wind Chaser', 
      liveOdds: 5.39, 
      mlOdds: 6.00,
      modelOdds: 5.80,
      qModelWinPct: 17.2,
      qModelScore: 87,
      difference: -0.41, 
      isFavorite: false,
      jockey: "J. Castellano",
      trainer: "C. McGaughey",
      hFactors: { speed: true, form: true, class: true },
      handicappingFactor: 15 // Money Horse
    },
    { 
      id: 8, 
      pp: 8, 
      name: 'Dark Horse', 
      liveOdds: 9.61, 
      mlOdds: 8.00,
      modelOdds: 11.30,
      qModelWinPct: 8.8,
      qModelScore: 68,
      difference: -1.69, 
      isFavorite: false,
      jockey: "T. Gaffalione",
      trainer: "M. Maker",
      hFactors: { pace: true, form: true },
      handicappingFactor: 20 // Live Longshot
    },
    // Add a disqualified horse example
    { 
      id: 9, 
      pp: 9, 
      name: 'Scratched Runner', 
      liveOdds: 0, 
      mlOdds: 12.00,
      modelOdds: 15.30,
      qModelWinPct: 6.7,
      qModelScore: 45,
      difference: 0, 
      isFavorite: false,
      isDisqualified: true,
      jockey: "B. Hernandez",
      trainer: "W. Mott",
      hFactors: { speed: true }
    },
  ];
  
  return horses;
};

// Simulate changing odds
export const updateOdds = (horses: Horse[]): Horse[] => {
  return horses.map(horse => {
    // Small random change in live odds
    const change = (Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : -1);
    const newLiveOdds = Math.max(1.05, horse.liveOdds + change);
    
    // Update the difference
    const newDifference = parseFloat((newLiveOdds - horse.modelOdds).toFixed(2));
    
    // Occasionally toggle irregular betting for demonstration purposes
    const toggleIrregular = Math.random() > 0.995;
    const irregularBetting = toggleIrregular 
      ? !horse.irregularBetting 
      : horse.irregularBetting;
    
    return {
      ...horse,
      liveOdds: parseFloat(newLiveOdds.toFixed(2)),
      difference: newDifference,
      irregularBetting
    };
  });
};
