
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

// Function to scrape entries data (ML odds, jockey, trainer, post position)
export async function scrapeEntries(url: string, trackName: string, supabase: any) {
  console.log(`Scraping entries from: ${url}`);
  
  try {
    // Normalize URL to ensure we have a race page
    if (!url.includes('/race-') && !url.includes('?race=') && !url.includes('entries')) {
      // If no specific race is in the URL, append entries
      if (!url.endsWith('/')) {
        url += '/';
      }
      url += 'entries';
      console.log(`No entries specified in URL, updated to: ${url}`);
    }
    
    // Fetch the HTML content
    console.log(`Fetching content from: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`HTML content length: ${html.length} characters`);
    
    const $ = cheerio.load(html);
    console.log(`Cheerio loaded HTML document`);
    
    // Extract all races with entries
    const races = [];
    
    // Find race headings or sections
    $('h2, h3, .race-header, .race-title').each((i, el) => {
      const raceText = $(el).text().trim();
      const raceMatch = raceText.match(/Race\s*(\d+)/i);
      
      if (raceMatch && raceMatch[1]) {
        const raceNumber = parseInt(raceMatch[1]);
        console.log(`Found Race ${raceNumber}`);
        
        // Find the entries table that follows this race header
        const entriesTable = $(el).next('table, .entries-table, .entries-list');
        if (entriesTable.length > 0) {
          processRaceEntries($, entriesTable, raceNumber, trackName, races);
        } else {
          // Try to find the entries by looking for a container that might have the race entries
          const container = $(el).closest('.race-container, .race-section, .race-card');
          const entriesInContainer = container.find('table, .entries-table, .entries-list');
          
          if (entriesInContainer.length > 0) {
            processRaceEntries($, entriesInContainer, raceNumber, trackName, races);
          } else {
            console.log(`No entries table found for Race ${raceNumber}`);
          }
        }
      }
    });
    
    // If we didn't find races with the method above, try a different approach
    if (races.length === 0) {
      console.log("Trying alternative parsing method for entries");
      
      // Look for all tables that might contain entries
      $('table').each((i, table) => {
        const tableText = $(table).text();
        const raceMatch = tableText.match(/Race\s*(\d+)/i);
        
        if (raceMatch && raceMatch[1]) {
          const raceNumber = parseInt(raceMatch[1]);
          processRaceEntries($, $(table), raceNumber, trackName, races);
        }
      });
    }
    
    console.log(`Found entries for ${races.length} races`);
    
    // Insert data into the database
    const raceDate = new Date().toISOString().split('T')[0];
    
    for (const race of races) {
      console.log(`Processing entries for Race ${race.raceNumber} with ${race.entries.length} horses`);
      
      // First check if the race exists in race_data
      let raceId;
      const { data: existingRace, error: raceError } = await supabase
        .from('race_data')
        .select('id')
        .eq('track_name', trackName)
        .eq('race_number', race.raceNumber)
        .eq('race_date', raceDate)
        .maybeSingle();
      
      if (raceError) {
        console.error("Error checking for existing race:", raceError);
        continue;
      }
      
      if (existingRace) {
        raceId = existingRace.id;
        console.log(`Found existing race with ID ${raceId}`);
      } else {
        // Create new race
        const { data: newRace, error: createRaceError } = await supabase
          .from('race_data')
          .insert({
            track_name: trackName,
            race_number: race.raceNumber,
            race_date: raceDate,
            race_conditions: race.conditions || null
          })
          .select()
          .single();
        
        if (createRaceError) {
          console.error("Error creating race:", createRaceError);
          continue;
        }
        
        raceId = newRace.id;
        console.log(`Created new race with ID ${raceId}`);
      }
      
      // First, clear any existing horses for this race to avoid duplicates
      const { error: deleteError } = await supabase
        .from('race_horses')
        .delete()
        .eq('race_id', raceId);
      
      if (deleteError) {
        console.error("Error clearing existing horses:", deleteError);
      }
      
      // Now insert all horses for this race
      for (const entry of race.entries) {
        const { data: horseData, error: horseError } = await supabase
          .from('race_horses')
          .insert({
            race_id: raceId,
            name: entry.name,
            pp: entry.pp,
            ml_odds: entry.mlOdds,
            jockey: entry.jockey,
            trainer: entry.trainer
          });
        
        if (horseError) {
          console.error(`Error inserting horse ${entry.name}:`, horseError);
        } else {
          console.log(`Added horse: ${entry.name}`);
        }
      }
    }
    
    return { count: races.length, trackName };
    
  } catch (error) {
    console.error("Error scraping entries:", error);
    throw error;
  }
}

function processRaceEntries($: any, table: any, raceNumber: number, trackName: string, races: any[]) {
  const entries = [];
  const conditions = extractRaceConditions($, table);
  
  // Process each row in the table to extract horse entries
  table.find('tr').each((i: number, row: any) => {
    // Skip header row
    if ($(row).find('th').length > 0) {
      return;
    }
    
    const cells = $(row).find('td');
    if (cells.length < 3) {
      return; // Not enough cells for an entry
    }
    
    // Extract horse data from cells
    const ppText = $(cells[0]).text().trim();
    const pp = parseInt(ppText) || i;
    
    const horseName = $(cells[1]).text().trim();
    if (!horseName) {
      return; // Skip if no horse name
    }
    
    // Try different columns for ML odds, jockey, trainer
    let mlOdds = null;
    let jockey = null;
    let trainer = null;
    
    // Different sites have different formats - try to handle common patterns
    cells.each((idx: number, cell: any) => {
      const cellText = $(cell).text().trim();
      
      // Check for ML odds (usually contains "/" or "-")
      if ((cellText.includes('/') || cellText.includes('-')) && 
          !cellText.includes('@') && 
          cellText.length < 10) {
        const oddsValue = parseOddsToDecimal(cellText);
        if (oddsValue && !mlOdds) {
          mlOdds = oddsValue;
        }
      }
      
      // Check for jockey (usually labeled or at specific position)
      if (idx === 3 || idx === 4 || $(cell).hasClass('jockey')) {
        if (!jockey) jockey = cellText;
      }
      
      // Check for trainer (usually labeled or at specific position)
      if (idx === 4 || idx === 5 || $(cell).hasClass('trainer')) {
        if (!trainer) trainer = cellText;
      }
    });
    
    entries.push({
      pp,
      name: horseName,
      mlOdds,
      jockey,
      trainer
    });
    
    console.log(`Extracted horse: #${pp} ${horseName} (${mlOdds}) - Jockey: ${jockey}, Trainer: ${trainer}`);
  });
  
  if (entries.length > 0) {
    races.push({
      raceNumber,
      entries,
      conditions
    });
    console.log(`Added race ${raceNumber} with ${entries.length} entries`);
  }
}

function extractRaceConditions($: any, table: any) {
  // Try to find race conditions near the entries table
  const container = table.closest('.race-container, .race-section, .race-card');
  const conditionsEl = container.find('.race-conditions, .conditions, .race-details');
  
  if (conditionsEl.length > 0) {
    return conditionsEl.text().trim();
  }
  
  // Try to find conditions in nearby elements
  const prevEl = table.prev('p, div');
  if (prevEl.length > 0 && prevEl.text().length > 20) {
    return prevEl.text().trim();
  }
  
  return null;
}

function parseOddsToDecimal(odds: string): number | null {
  // Handle empty or invalid
  if (!odds || odds === 'SCR') return null;
  
  // Handle fractional odds (e.g., "5/2")
  if (odds.includes('/')) {
    const [num, denom] = odds.split('/').map(part => parseFloat(part.trim()));
    if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
      return parseFloat((num / denom).toFixed(2));
    }
  }
  
  // Handle decimal odds
  if (!isNaN(parseFloat(odds))) {
    return parseFloat(odds);
  }
  
  // Handle hyphenated odds (e.g., "5-2")
  if (odds.includes('-')) {
    const [num, denom] = odds.split('-').map(part => parseFloat(part.trim()));
    if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
      return parseFloat((num / denom).toFixed(2));
    }
  }
  
  return null;
}
