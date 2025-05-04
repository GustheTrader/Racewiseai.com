
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
      difference: -0.5, 
      isFavorite: false,
      jockey: "J. Smith",
      trainer: "T. Brown",
      hFactors: { speed: true, form: true }
    },
    { 
      id: 2, 
      pp: 2, 
      name: 'Lucky Star', 
      liveOdds: 9.2, 
      mlOdds: 8.0,
      modelOdds: 10.4, 
      difference: -1.2, 
      isFavorite: false,
      jockey: "M. Johnson",
      trainer: "R. Davis",
      hFactors: { speed: true, pace: true, class: true }
    },
    { 
      id: 3, 
      pp: 3, 
      name: 'Thunder Bolt', 
      liveOdds: 4.4, 
      mlOdds: 2.5,
      modelOdds: 6.3, 
      difference: -1.9, 
      isFavorite: true,
      irregularBetting: true,
      jockey: "A. Williams",
      trainer: "S. Miller",
      hFactors: { pace: true, form: true }
    },
    { 
      id: 4, 
      pp: 4, 
      name: 'Silver Streak', 
      liveOdds: 5.4, 
      mlOdds: 5.0,
      modelOdds: 5.8, 
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
      difference: 2.2, 
      isFavorite: false,
      irregularBetting: true,
      jockey: "R. Martinez",
      trainer: "L. Garcia",
      hFactors: { speed: true, class: true }
    },
    { 
      id: 6, 
      pp: 6, 
      name: 'Midnight Runner', 
      liveOdds: 4.5, 
      mlOdds: 4.0,
      modelOdds: 5.0, 
      difference: -0.5, 
      isFavorite: false,
      jockey: "C. Taylor",
      trainer: "P. Anderson",
      hFactors: { pace: true }
    },
    { 
      id: 7, 
      pp: 7, 
      name: 'Wind Chaser', 
      liveOdds: 5.39, 
      mlOdds: 6.00,
      modelOdds: 5.80, 
      difference: -0.41, 
      isFavorite: false,
      jockey: "J. Castellano",
      trainer: "C. McGaughey",
      hFactors: { speed: true, form: true, class: true }
    },
    { 
      id: 8, 
      pp: 8, 
      name: 'Dark Horse', 
      liveOdds: 9.61, 
      mlOdds: 8.00,
      modelOdds: 11.30, 
      difference: -1.69, 
      isFavorite: false,
      jockey: "T. Gaffalione",
      trainer: "M. Maker",
      hFactors: { pace: true, form: true }
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
