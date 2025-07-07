
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

// Function to scrape will pays data
export async function scrapeWillPays(url: string, trackName: string, supabase: any) {
  console.log(`Scraping will pays from: ${url}`);
  
  try {
    // Fetch the HTML content
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract race number from URL or page content
    let raceNumber = 1;
    const raceMatch = url.match(/race-(\d+)/i);
    if (raceMatch && raceMatch[1]) {
      raceNumber = parseInt(raceMatch[1]);
    } else {
      // Try to find race number in the page
      const raceText = $('.race-info').text() || $('.race-number').text();
      const pageRaceMatch = raceText.match(/Race\s*(\d+)/i);
      if (pageRaceMatch && pageRaceMatch[1]) {
        raceNumber = parseInt(pageRaceMatch[1]);
      }
    }
    
    const raceDate = new Date().toISOString().split('T')[0];
    
    // Extract will pays data for different exotic bet types
    const willPaysData = [];
    
    // Process each type of exotic bet (DD, P3, P4, P5, P6)
    const exoticTypes = [
      { selector: '.double-table, .daily-double', name: 'Daily Double' },
      { selector: '.pick3-table, .pick-3', name: 'Pick 3' },
      { selector: '.pick4-table, .pick-4', name: 'Pick 4' },
      { selector: '.pick5-table, .pick-5', name: 'Pick 5' },
      { selector: '.pick6-table, .pick-6', name: 'Pick 6' }
    ];
    
    for (const exotic of exoticTypes) {
      const $table = $(exotic.selector);
      if ($table.length === 0) continue;
      
      // Check for carryover
      const carryoverText = $table.prev('p, .carryover').text() || '';
      const isCarryover = /carryover/i.test(carryoverText);
      let carryoverAmount = null;
      
      if (isCarryover) {
        const amountMatch = carryoverText.match(/\$[\d,.]+/);
        if (amountMatch) {
          carryoverAmount = parseFloat(amountMatch[0].replace(/[$,]/g, ''));
        }
      }
      
      // Extract combinations and payouts
      $table.find('tr').each((i, row) => {
        if (i === 0 && $(row).find('th').length > 0) return; // Skip header
        
        const combination = $(row).find('td').eq(0).text().trim();
        const payoutText = $(row).find('td').eq(1).text().trim();
        
        if (combination) {
          let payout = null;
          if (payoutText) {
            const payoutMatch = payoutText.match(/[\d,.]+/);
            if (payoutMatch) {
              payout = parseFloat(payoutMatch[0].replace(/[,$]/g, ''));
            }
          }
          
          willPaysData.push({
            track_name: trackName,
            race_number: raceNumber,
            race_date: raceDate,
            wager_type: exotic.name,
            combination: combination,
            payout: payout,
            is_carryover: isCarryover,
            carryover_amount: carryoverAmount
          });
        }
      });
    }
    
    // If no structured tables are found, try to parse from text
    if (willPaysData.length === 0) {
      // Look for text patterns like "Pick 6 (4,5,1,2,3,6) $1,234.50"
      const pageText = $('body').text();
      const patterns = [
        { regex: /Daily Double.*?(\d+[,-]\d+).*?\$([\d,.]+)/i, type: 'Daily Double' },
        { regex: /Pick 3.*?(\d+[,-]\d+[,-]\d+).*?\$([\d,.]+)/i, type: 'Pick 3' },
        { regex: /Pick 4.*?(\d+[,-]\d+[,-]\d+[,-]\d+).*?\$([\d,.]+)/i, type: 'Pick 4' },
        { regex: /Pick 5.*?(\d+[,-]\d+[,-]\d+[,-]\d+[,-]\d+).*?\$([\d,.]+)/i, type: 'Pick 5' },
        { regex: /Pick 6.*?(\d+[,-]\d+[,-]\d+[,-]\d+[,-]\d+[,-]\d+).*?\$([\d,.]+)/i, type: 'Pick 6' }
      ];
      
      for (const pattern of patterns) {
        const matches = pageText.match(new RegExp(pattern.regex, 'g'));
        if (matches) {
          for (const match of matches) {
            const detailMatch = match.match(pattern.regex);
            if (detailMatch && detailMatch[1] && detailMatch[2]) {
              willPaysData.push({
                track_name: trackName,
                race_number: raceNumber,
                race_date: raceDate,
                wager_type: pattern.type,
                combination: detailMatch[1],
                payout: parseFloat(detailMatch[2].replace(/[,$]/g, '')),
                is_carryover: false,
                carryover_amount: null
              });
            }
          }
        }
      }
    }
    
    if (willPaysData.length === 0) {
      console.log("No will pays data found on the page");
      return { count: 0, raceNumber, trackName };
    }
    
    console.log(`Found ${willPaysData.length} will pays entries`);
    
    // Insert data into the database
    for (const entry of willPaysData) {
      const { error } = await supabase
        .from('exotic_will_pays')
        .insert(entry);
      
      if (error) {
        console.error("Error inserting will pays data:", error);
      }
    }
    
    return { count: willPaysData.length, raceNumber, trackName };
    
  } catch (error) {
    console.error("Error scraping will pays:", error);
    throw error;
  }
}
