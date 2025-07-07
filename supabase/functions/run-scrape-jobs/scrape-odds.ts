
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";
import { formatTrackUrl } from "./config.ts";

// Function to scrape odds data from offtrackbetting.com
export async function scrapeOdds(url: string, trackName: string, supabase: any) {
  console.log(`Scraping odds from: ${url}`);
  
  try {
    // If no URL is provided or it's empty, generate one based on track name
    if (!url || url.trim() === '') {
      url = formatTrackUrl(trackName);
      console.log(`No URL provided, using default: ${url}`);
    }
    
    // Fetch the HTML content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract race number from URL or page content
    let raceNumber = 1;
    const raceMatch = url.match(/raceNumber=(\d+)/i);
    if (raceMatch && raceMatch[1]) {
      raceNumber = parseInt(raceMatch[1]);
    } else {
      // Try to find race number in the page
      const raceText = $('.race-header, .race-info, .race-number').text();
      const pageRaceMatch = raceText.match(/Race\s*(\d+)/i);
      if (pageRaceMatch && pageRaceMatch[1]) {
        raceNumber = parseInt(pageRaceMatch[1]);
      }
    }
    
    const raceDate = new Date().toISOString().split('T')[0];
    
    // Extract odds data
    const oddsData = [];
    
    // OTB site typically has a table with entries
    const entries = $('.entries-table tr, .race-entries tr, .horse-odds-row');
    
    if (entries.length > 0) {
      console.log(`Found ${entries.length} potential horse entries`);
      
      entries.each((i, el) => {
        // Skip header row
        if ($(el).find('th').length > 0 || $(el).is('th') || $(el).hasClass('header-row')) {
          return;
        }
        
        const programNumber = $(el).find('.program-number, .horse-number, td:first-child').text().trim();
        const horseName = $(el).find('.horse-name, .entry-name, .runner-name').text().trim();
        const morningLine = $(el).find('.morning-line, .odds, .win-odds').text().trim();
        
        // Parse program number (might include letters for coupled entries)
        const horseNumber = parseInt(programNumber.replace(/[^0-9]/g, '')) || (i + 1);
        
        if (horseName && horseName !== "") {
          const entry = {
            horse_number: horseNumber,
            horse_name: horseName,
            win_odds: morningLine || 'SCR',
            track_name: trackName,
            race_number: raceNumber,
            race_date: raceDate,
            pool_data: {}
          };
          
          // Extract additional pool data if available
          const poolData: any = {};
          
          // Look for pool columns like WP (win/place), EX (exacta), etc.
          $(el).find('td').each((j, td) => {
            const header = $('th').eq(j).text().trim().toLowerCase();
            const value = $(td).text().trim();
            if (header && value && !['pp', 'horse', 'odds', '#', 'program'].includes(header)) {
              poolData[header] = value;
            }
          });
          
          if (Object.keys(poolData).length > 0) {
            entry.pool_data = poolData;
          }
          
          oddsData.push(entry);
          console.log(`Found horse: #${horseNumber} ${horseName} (${morningLine})`);
        }
      });
    }
    
    // If we couldn't find structured data, try looking for odds in text form
    if (oddsData.length === 0) {
      console.log("No structured odds data found, trying to extract from text");
      
      const pageText = $('body').text();
      const horseRegex = /(\d+)[.\s]*([A-Za-z\s'&\-]+)[\s]*(\d+[\-\/]?\d*)/g;
      
      let match;
      let index = 0;
      
      while ((match = horseRegex.exec(pageText)) !== null) {
        const horseNumber = parseInt(match[1]);
        const horseName = match[2].trim();
        const odds = match[3].trim();
        
        if (horseName.length > 2) {  // Filter out short, likely incorrect matches
          oddsData.push({
            horse_number: horseNumber || (index + 1),
            horse_name: horseName,
            win_odds: odds,
            track_name: trackName,
            race_number: raceNumber,
            race_date: raceDate,
            pool_data: {}
          });
          
          console.log(`Extracted from text: #${horseNumber} ${horseName} (${odds})`);
          index++;
        }
      }
    }
    
    // If we still don't have data, this could be due to a few reasons:
    // 1. The race card isn't available yet
    // 2. The track isn't running today
    // 3. The site structure has changed
    if (oddsData.length === 0) {
      console.log(`No odds data found for ${trackName} Race ${raceNumber}`);
      
      // Insert a placeholder record to indicate we attempted to scrape
      await supabase
        .from('scrape_attempts')
        .insert({
          track_name: trackName,
          race_number: raceNumber,
          url: url,
          status: 'no_data_found',
          timestamp: new Date().toISOString()
        });
      
      return { count: 0, message: `No odds data found for ${trackName} Race ${raceNumber}` };
    }
    
    console.log(`Found odds for ${oddsData.length} horses in ${trackName} Race ${raceNumber}`);
    
    // Insert data into the database
    for (const entry of oddsData) {
      const { data, error } = await supabase
        .from('odds_data')
        .insert(entry);
      
      if (error) {
        console.error("Error inserting odds data:", error);
      }
    }
    
    return { count: oddsData.length, raceNumber, trackName };
    
  } catch (error) {
    console.error("Error scraping odds:", error);
    throw error;
  }
}
