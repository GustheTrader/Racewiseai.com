
import { supabase } from '@/integrations/supabase/client';
import { PDFExtractionResult } from '@/utils/types';

export async function processMockPDFData(filename: string): Promise<PDFExtractionResult> {
  try {
    // Extract track name from filename for demonstration
    const trackName = filename.split('.')[0].toUpperCase();
    const raceNumber = Math.floor(Math.random() * 10) + 1;
    const raceDate = new Date().toISOString();
    const raceConditions = "Allowance - For Three Year Olds - 6 Furlongs";
    
    // Create mock horse data based on the track name
    const mockHorses = Array.from({ length: 10 }, (_, i) => ({
      pp: i + 1,
      name: `${trackName} Runner ${i + 1}`,
      jockey: `Jockey ${String.fromCharCode(65 + i)}`,
      trainer: `Trainer ${String.fromCharCode(65 + i)}`,
      mlOdds: parseFloat((2 + i * 0.5).toFixed(1)),
    }));
    
    // Insert race data into Supabase
    const { data: raceData, error: raceError } = await supabase
      .from('race_data')
      .insert({
        track_name: trackName,
        race_number: raceNumber,
        race_date: raceDate,
        race_conditions: raceConditions,
      })
      .select()
      .single();
    
    if (raceError) {
      console.error('Error saving race data:', raceError);
      throw new Error(`Failed to save race data: ${raceError.message}`);
    }
    
    // Insert horse data into Supabase
    const horsesWithRaceId = mockHorses.map(horse => ({
      race_id: raceData.id,
      pp: horse.pp,
      name: horse.name,
      jockey: horse.jockey,
      trainer: horse.trainer,
      ml_odds: horse.mlOdds,
    }));
    
    const { data: horsesData, error: horsesError } = await supabase
      .from('race_horses')
      .insert(horsesWithRaceId)
      .select();
    
    if (horsesError) {
      console.error('Error saving horse data:', horsesError);
      throw new Error(`Failed to save horse data: ${horsesError.message}`);
    }
    
    // Return the extracted data
    return {
      success: true,
      data: {
        raceId: raceData.id,
        trackName: trackName,
        raceNumber: raceNumber,
        raceDate: raceDate,
        raceConditions: raceConditions,
        horses: mockHorses,
      },
    };
  } catch (error) {
    console.error('Error in processMockPDFData:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
