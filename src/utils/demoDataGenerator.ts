import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

// Clear all existing demo data
const clearExistingData = async (): Promise<void> => {
  try {
    // Clear all race-related data
    await supabase.from('race_horses').delete().neq('id', '');
    await supabase.from('race_data').delete().neq('id', '');
    await supabase.from('odds_data').delete().neq('id', '');
    await supabase.from('exotic_will_pays').delete().neq('id', '');
    await supabase.from('race_results').delete().neq('id', '');
    
    console.log('Cleared existing demo data');
  } catch (error) {
    console.error('Error clearing existing data:', error);
    throw error;
  }
};

// Generate comprehensive demo data for a single race with 10 horses
export const generateFullDemoData = async (): Promise<boolean> => {
  try {
    console.log('Starting comprehensive demo data generation...');
    
    // Clear existing data first
    await clearExistingData();
    
    const trackName = "Belmont Park";
    const raceNumber = 5;
    const raceDate = new Date().toISOString().split('T')[0];
    
    // Create race data
    const { data: raceData, error: raceError } = await supabase
      .from('race_data')
      .insert({
        track_name: trackName,
        race_number: raceNumber,
        race_date: raceDate,
        race_conditions: "6 Furlongs. Dirt. Allowance. Purse $85,000. For three year olds and upward which have never won two races."
      })
      .select()
      .single();
    
    if (raceError) {
      throw new Error(`Failed to create race: ${raceError.message}`);
    }
    
    // Horse data with realistic names, jockeys, trainers, and odds
    const horses = [
      { name: "Thunder Strike", jockey: "J. Rosario", trainer: "B. Cox", odds: 3.2, pp: 1 },
      { name: "Golden Arrow", jockey: "I. Ortiz Jr.", trainer: "C. McGaughey", odds: 5.5, pp: 2 },
      { name: "Midnight Express", jockey: "J. Velazquez", trainer: "T. Pletcher", odds: 7.8, pp: 3 },
      { name: "Silver Bullet", jockey: "L. Saez", trainer: "S. Asmussen", odds: 4.1, pp: 4 },
      { name: "Fire Storm", jockey: "M. Franco", trainer: "D. Romans", odds: 12.5, pp: 5 },
      { name: "Lightning Bolt", jockey: "J. Alvarado", trainer: "B. Mott", odds: 8.9, pp: 6 },
      { name: "Star Gazer", jockey: "K. Carmouche", trainer: "L. Rice", odds: 15.2, pp: 7 },
      { name: "Royal Thunder", jockey: "R. Santana Jr.", trainer: "M. Maker", odds: 6.7, pp: 8 },
      { name: "Dream Chaser", jockey: "T. Gaffalione", trainer: "G. Motion", odds: 9.4, pp: 9 },
      { name: "Victory Lane", jockey: "D. Davis", trainer: "R. Rodriguez", odds: 18.6, pp: 10 }
    ];
    
    // Insert all horses
    const horseInserts = horses.map(horse => ({
      race_id: raceData.id,
      name: horse.name,
      pp: horse.pp,
      jockey: horse.jockey,
      trainer: horse.trainer,
      ml_odds: horse.odds
    }));
    
    const { error: horsesError } = await supabase
      .from('race_horses')
      .insert(horseInserts);
    
    if (horsesError) {
      throw new Error(`Failed to create horses: ${horsesError.message}`);
    }
    
    // Create current odds data
    const oddsInserts = horses.map(horse => ({
      track_name: trackName,
      race_number: raceNumber,
      race_date: raceDate,
      horse_number: horse.pp,
      horse_name: horse.name,
      win_odds: (horse.odds + Math.random() * 2 - 1).toFixed(1), // Slightly vary from morning line
      pool_data: {
        morning_line: horse.odds,
        current_odds: horse.odds + Math.random() * 2 - 1,
        last_update: new Date().toISOString()
      }
    }));
    
    const { error: oddsError } = await supabase
      .from('odds_data')
      .insert(oddsInserts);
    
    if (oddsError) {
      throw new Error(`Failed to create odds data: ${oddsError.message}`);
    }
    
    // Create exotic will pays
    const exoticWagers = [
      { type: "Exacta", combination: "1-2", payout: 28.60 },
      { type: "Exacta", combination: "1-4", payout: 15.80 },
      { type: "Trifecta", combination: "1-2-4", payout: 142.40 },
      { type: "Trifecta", combination: "1-4-2", payout: 89.20 },
      { type: "Superfecta", combination: "1-2-4-8", payout: 1247.80 },
      { type: "Daily Double", combination: "Race 4: 3 / Race 5: 1", payout: 45.20 },
      { type: "Pick 3", combination: "Races 3-4-5: 2/3/1", payout: 234.60 }
    ];
    
    const willPayInserts = exoticWagers.map(wager => ({
      track_name: trackName,
      race_number: raceNumber,
      race_date: raceDate,
      wager_type: wager.type,
      combination: wager.combination,
      payout: wager.payout,
      is_carryover: false
    }));
    
    const { error: willPaysError } = await supabase
      .from('exotic_will_pays')
      .insert(willPayInserts);
    
    if (willPaysError) {
      throw new Error(`Failed to create will pays: ${willPaysError.message}`);
    }
    
    // Create race results (Thunder Strike wins)
    const raceResults = {
      finish_order: [
        { position: 1, horse: "Thunder Strike", jockey: "J. Rosario", time: "1:10.23", margin: "Win" },
        { position: 2, horse: "Golden Arrow", jockey: "I. Ortiz Jr.", time: "1:10.45", margin: "1.25" },
        { position: 3, horse: "Silver Bullet", jockey: "L. Saez", time: "1:10.67", margin: "0.75" },
        { position: 4, horse: "Royal Thunder", jockey: "R. Santana Jr.", time: "1:10.89", margin: "1.50" },
        { position: 5, horse: "Lightning Bolt", jockey: "J. Alvarado", time: "1:11.12", margin: "2.25" },
        { position: 6, horse: "Dream Chaser", jockey: "T. Gaffalione", time: "1:11.34", margin: "1.75" },
        { position: 7, horse: "Midnight Express", jockey: "J. Velazquez", time: "1:11.56", margin: "2.00" },
        { position: 8, horse: "Fire Storm", jockey: "M. Franco", time: "1:11.78", margin: "3.50" },
        { position: 9, horse: "Star Gazer", jockey: "K. Carmouche", time: "1:12.01", margin: "4.25" },
        { position: 10, horse: "Victory Lane", jockey: "D. Davis", time: "1:12.45", margin: "6.75" }
      ],
      payouts: {
        win: { "1": 8.40 },
        place: { "1": 4.20, "2": 3.80 },
        show: { "1": 3.20, "2": 2.90, "4": 2.60 },
        exacta: { "1-2": 28.60 },
        trifecta: { "1-2-4": 142.40 },
        superfecta: { "1-2-4-8": 1247.80 }
      },
      fractional_times: {
        "quarter": "22.45",
        "half": "45.67",
        "three_quarters": "1:09.12",
        "final": "1:10.23"
      }
    };
    
    const { error: resultsError } = await supabase
      .from('race_results')
      .insert({
        track_name: trackName,
        race_number: raceNumber,
        race_date: raceDate,
        results_data: raceResults,
        source_url: `https://example.com/${trackName.toLowerCase().replace(' ', '')}/results`
      });
    
    if (resultsError) {
      throw new Error(`Failed to create race results: ${resultsError.message}`);
    }
    
    console.log('✅ Demo data generation completed successfully!');
    console.log(`Generated: ${trackName} Race ${raceNumber} with ${horses.length} horses`);
    
    toast.success(`Demo data generated! ${trackName} Race ${raceNumber} with ${horses.length} horses`);
    return true;
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error);
    toast.error(`Failed to generate demo data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};