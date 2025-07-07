
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

// Track names based on popular horse racing venues
const TRACK_NAMES = [
  "Churchill Downs",
  "Belmont Park",
  "Santa Anita",
  "Saratoga",
  "Del Mar",
  "Keeneland",
  "Gulfstream Park",
  "Oaklawn Park",
  "Aqueduct",
  "Golden Gate Fields"
];

// Horse prefixes and suffixes to generate random horse names
const HORSE_NAME_PREFIXES = [
  "Mighty", "Royal", "Lucky", "Swift", "Rapid", "Noble", "Wild", "Brave", "Bold", "Silver",
  "Golden", "Mystic", "Stellar", "Cosmic", "Thunder", "Midnight", "Majestic", "Grand", "Eternal", "Regal"
];

const HORSE_NAME_SUFFIXES = [
  "Runner", "Streak", "Spirit", "Legend", "Arrow", "Star", "Wind", "Flash", "Blaze", "Storm",
  "Knight", "Dream", "Warrior", "Glory", "Victory", "Champion", "Force", "Fire", "Racer", "Tiger"
];

// Jockey names
const JOCKEY_NAMES = [
  "J. Smith", "M. Johnson", "R. Garcia", "T. Williams", "L. Martinez", 
  "K. Brown", "D. Wilson", "S. Anderson", "P. Lee", "F. Rodriguez",
  "A. Taylor", "J. Thomas", "C. Hernandez", "B. Moore", "A. Martin"
];

// Trainer names
const TRAINER_NAMES = [
  "Bob Baffert", "Todd Pletcher", "Steve Asmussen", "Chad Brown", "Brad Cox",
  "Mark Casse", "Bill Mott", "Jerry Hollendorfer", "Doug O'Neill", "Richard Mandella",
  "Shug McGaughey", "Ken McPeek", "Mike Maker", "Graham Motion", "John Sadler"
];

/**
 * Generates a random horse name by combining a prefix and suffix
 */
const generateHorseName = () => {
  const prefix = HORSE_NAME_PREFIXES[Math.floor(Math.random() * HORSE_NAME_PREFIXES.length)];
  const suffix = HORSE_NAME_SUFFIXES[Math.floor(Math.random() * HORSE_NAME_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
};

/**
 * Generate random Morning Line odds for a horse
 */
const generateMlOdds = () => {
  // Generate common ML odds like 2-1, 3-1, 5-2, etc.
  const numerators = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50];
  const denominators = [1, 2, 5];
  
  const numerator = numerators[Math.floor(Math.random() * numerators.length)];
  const denominator = denominators[Math.floor(Math.random() * denominators.length)];
  
  // Return as decimal odds
  return parseFloat((numerator / denominator).toFixed(2));
};

/**
 * Generate horses for a race
 */
const generateHorsesForRace = (raceId: string, horsesCount: number) => {
  const horses = [];
  
  for (let i = 1; i <= horsesCount; i++) {
    horses.push({
      race_id: raceId,
      pp: i,
      name: generateHorseName(),
      ml_odds: generateMlOdds(),
      jockey: JOCKEY_NAMES[Math.floor(Math.random() * JOCKEY_NAMES.length)],
      trainer: TRAINER_NAMES[Math.floor(Math.random() * TRAINER_NAMES.length)]
    });
  }
  
  return horses;
};

/**
 * Generate race conditions
 */
const generateRaceConditions = () => {
  const distances = ["6F", "7F", "1M", "1 1/16M", "1 1/8M", "1 1/4M", "5F", "5 1/2F"];
  const types = ["Maiden Special Weight", "Allowance", "Claiming", "Stakes", "Grade 1", "Grade 2", "Grade 3"];
  const surfaces = ["Dirt", "Turf", "All Weather"];
  const ages = ["2YO", "3YO", "3YO+", "4YO+"];
  
  const distance = distances[Math.floor(Math.random() * distances.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const surface = surfaces[Math.floor(Math.random() * surfaces.length)];
  const age = ages[Math.floor(Math.random() * ages.length)];
  
  return `${distance} ${surface} ${type} for ${age}`;
};

/**
 * Generate odds data for a race
 */
const generateOddsForRace = (trackName: string, raceNumber: number, horses: any[]) => {
  return horses.map(horse => ({
    track_name: trackName,
    race_number: raceNumber,
    race_date: new Date().toISOString().split('T')[0],
    horse_number: horse.pp,
    horse_name: horse.name,
    win_odds: `${Math.floor(Math.random() * 20) + 1}-1`,
  }));
};

/**
 * Generate exotic will pays for a race
 */
const generateWillPaysForRace = (trackName: string, raceNumber: number) => {
  const willPays = [];
  const wagerTypes = ["Daily Double", "Pick 3", "Pick 4", "Exacta", "Trifecta"];
  
  // For each wager type, generate a few combinations
  wagerTypes.forEach(wagerType => {
    const combinationsCount = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < combinationsCount; i++) {
      // Generate random combinations based on wager type
      let combination = "";
      let payout = 0;
      
      if (wagerType === "Daily Double") {
        combination = `${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 10) + 1}`;
        payout = Math.floor(Math.random() * 200) + 20;
      } else if (wagerType === "Pick 3") {
        combination = `${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 10) + 1}`;
        payout = Math.floor(Math.random() * 1000) + 100;
      } else if (wagerType === "Pick 4") {
        combination = `${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 10) + 1}`;
        payout = Math.floor(Math.random() * 5000) + 500;
      } else if (wagerType === "Exacta") {
        combination = `${Math.floor(Math.random() * 10) + 1}/${Math.floor(Math.random() * 10) + 1}`;
        payout = Math.floor(Math.random() * 150) + 15;
      } else if (wagerType === "Trifecta") {
        combination = `${Math.floor(Math.random() * 10) + 1}/${Math.floor(Math.random() * 10) + 1}/${Math.floor(Math.random() * 10) + 1}`;
        payout = Math.floor(Math.random() * 800) + 80;
      }
      
      willPays.push({
        track_name: trackName,
        race_number: raceNumber,
        race_date: new Date().toISOString().split('T')[0],
        wager_type: wagerType,
        combination: combination,
        payout: payout,
        is_carryover: Math.random() < 0.1, // 10% chance of carryover
        carryover_amount: Math.random() < 0.1 ? Math.floor(Math.random() * 50000) + 5000 : null
      });
    }
  });
  
  return willPays;
};

/**
 * Generate random race results
 */
const generateRaceResults = (trackName: string, raceNumber: number, horses: any[]) => {
  // Create a copy of horses and shuffle them to determine finishing order
  const shuffledHorses = [...horses].sort(() => Math.random() - 0.5);
  
  // Create results data
  const resultsData = {
    finish_order: shuffledHorses.map((horse, index) => ({
      position: index + 1,
      horse_number: horse.pp,
      horse_name: horse.name
    })),
    payouts: {
      win: { horse: shuffledHorses[0].name, amount: (Math.random() * 30 + 5).toFixed(2) },
      place: { horse: shuffledHorses[1].name, amount: (Math.random() * 20 + 3).toFixed(2) },
      show: { horse: shuffledHorses[2].name, amount: (Math.random() * 10 + 2).toFixed(2) }
    },
    exotic_payouts: {
      exacta: { combination: `${shuffledHorses[0].pp}-${shuffledHorses[1].pp}`, amount: (Math.random() * 200 + 20).toFixed(2) },
      trifecta: { combination: `${shuffledHorses[0].pp}-${shuffledHorses[1].pp}-${shuffledHorses[2].pp}`, amount: (Math.random() * 1000 + 100).toFixed(2) }
    },
    race_time: `${Math.floor(Math.random() * 2) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`
  };
  
  return {
    track_name: trackName,
    race_number: raceNumber,
    race_date: new Date().toISOString().split('T')[0],
    results_data: resultsData,
    source_url: `https://results.example.com/${trackName.toLowerCase().replace(/\s+/g, '-')}/race-${raceNumber}`
  };
};

/**
 * Generate and populate data for all tracks and races
 */
export const generateFullDemoData = async () => {
  try {
    toast.info("Starting data generation for full demo...");
    
    // Delete existing data to avoid duplicates
    await supabase.from('race_horses').delete().gt('id', '0');
    await supabase.from('race_data').delete().gt('id', '0');
    await supabase.from('odds_data').delete().gt('id', '0');
    await supabase.from('exotic_will_pays').delete().gt('id', '0');
    await supabase.from('race_results').delete().gt('id', '0');
    
    toast.info("Cleared existing data, generating new demo data...");
    
    let totalRacesCreated = 0;
    
    // Generate data for each track
    for (const trackName of TRACK_NAMES) {
      // Generate 5-12 races for each track
      const racesCount = Math.floor(Math.random() * 8) + 5;
      
      for (let raceNumber = 1; raceNumber <= racesCount; raceNumber++) {
        // Create race
        const { data: raceData, error: raceError } = await supabase
          .from('race_data')
          .insert({
            track_name: trackName,
            race_number: raceNumber,
            race_date: new Date().toISOString().split('T')[0],
            race_conditions: generateRaceConditions()
          })
          .select()
          .single();
          
        if (raceError) {
          console.error('Error creating race:', raceError);
          continue;
        }
        
        // Generate 6-12 horses for the race
        const horsesCount = Math.floor(Math.random() * 7) + 6;
        const horses = generateHorsesForRace(raceData.id, horsesCount);
        
        // Insert horses
        const { error: horsesError } = await supabase
          .from('race_horses')
          .insert(horses);
          
        if (horsesError) {
          console.error('Error creating horses:', horsesError);
          continue;
        }
        
        // Generate odds data
        const oddsData = generateOddsForRace(trackName, raceNumber, horses);
        const { error: oddsError } = await supabase
          .from('odds_data')
          .insert(oddsData);
          
        if (oddsError) {
          console.error('Error creating odds data:', oddsError);
        }
        
        // Generate will pays for races except last race
        if (raceNumber < racesCount) {
          const willPays = generateWillPaysForRace(trackName, raceNumber);
          const { error: willPaysError } = await supabase
            .from('exotic_will_pays')
            .insert(willPays);
            
          if (willPaysError) {
            console.error('Error creating will pays:', willPaysError);
          }
        }
        
        // Generate race results for completed races (random selection)
        if (Math.random() < 0.6) {  // 60% chance the race is completed
          const raceResults = generateRaceResults(trackName, raceNumber, horses);
          const { error: resultsError } = await supabase
            .from('race_results')
            .insert(raceResults);
            
          if (resultsError) {
            console.error('Error creating race results:', resultsError);
          }
        }
        
        totalRacesCreated++;
      }
      
      toast.success(`Generated data for ${trackName}`);
    }
    
    toast.success(`Demo data generation complete! Created ${totalRacesCreated} races across ${TRACK_NAMES.length} tracks.`);
    return true;
  } catch (error) {
    console.error('Error generating demo data:', error);
    toast.error('Failed to generate demo data. Check console for details.');
    return false;
  }
};
