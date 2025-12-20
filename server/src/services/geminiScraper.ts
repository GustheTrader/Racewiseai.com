import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/env.js';
import { RaceData, Horse, WillPay } from '../types/index.js';

export class GeminiScraper {
  private client: GoogleGenerativeAI;
  private model = 'gemini-2.0-flash'; // Using Gemini Flash model

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Extract race odds from a screenshot using Gemini Vision
   */
  async extractOdds(imageBase64: string, trackName: string, raceNumber: number): Promise<Horse[]> {
    try {
      logger.info(`Extracting odds for ${trackName} Race ${raceNumber}`);

      const model = this.client.getGenerativeModel({ model: this.model });

      const prompt = `
You are analyzing a horse racing odds board screenshot. Extract the following information for each horse in the race:
1. Horse number (post position)
2. Horse name
3. Current odds (Win odds)
4. Morning line (if available)
5. Jockey name (if visible)
6. Trainer name (if visible)

Return the data as a JSON array with this structure:
[
  {
    "number": <post position>,
    "name": "<horse name>",
    "odds": "<current odds>",
    "morningLine": "<morning line or null>",
    "jockey": "<jockey name or null>",
    "trainer": "<trainer name or null>"
  }
]

Be precise and extract ONLY visible information. If a field is not visible, use null.
Return ONLY valid JSON, no other text.
`;

      const response = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/png',
          },
        },
        {
          text: prompt,
        },
      ]);

      const responseText = response.response.text();
      logger.info('Gemini extraction response', { raceNumber, responseLength: responseText.length });

      // Parse the JSON response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Gemini response');
      }

      const horses: Horse[] = JSON.parse(jsonMatch[0]);
      return horses;
    } catch (error) {
      logger.error(`Error extracting odds for ${trackName} Race ${raceNumber}`, error);
      throw error;
    }
  }

  /**
   * Extract will-pays (exotic payouts) from a screenshot
   */
  async extractWillPays(imageBase64: string, trackName: string, raceNumber: number): Promise<WillPay[]> {
    try {
      logger.info(`Extracting will-pays for ${trackName} Race ${raceNumber}`);

      const model = this.client.getGenerativeModel({ model: this.model });

      const prompt = `
You are analyzing a horse racing will-pay/exotic payouts board. Extract all available wager types and their payouts.

For each wager type shown (Win, Place, Show, Exacta, Trifecta, Superfecta, Pick 3, Pick 4, Pick 5, etc.):
1. Wager type name
2. The combination(s) if showing specific horses
3. Payout amount
4. Whether it's a carryover
5. Carryover amount if applicable

Return the data as a JSON array with this structure:
[
  {
    "wagerType": "<type name>",
    "combination": "<horse combination or 'Not Set' if jackpot>",
    "payout": <payout amount or null>,
    "isCarryover": <true/false>,
    "carryoverAmount": <amount or null>
  }
]

Return ONLY valid JSON, no other text.
`;

      const response = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/png',
          },
        },
        {
          text: prompt,
        },
      ]);

      const responseText = response.response.text();
      logger.info('Will-pays extraction response', { raceNumber, responseLength: responseText.length });

      // Parse the JSON response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        logger.warn('No will-pays data found in response', { raceNumber });
        return [];
      }

      const willPays: WillPay[] = JSON.parse(jsonMatch[0]);
      return willPays;
    } catch (error) {
      logger.error(`Error extracting will-pays for ${trackName} Race ${raceNumber}`, error);
      // Don't throw - will-pays are optional
      return [];
    }
  }

  /**
   * Extract race conditions and details
   */
  async extractRaceDetails(imageBase64: string, trackName: string, raceNumber: number): Promise<Partial<RaceData>> {
    try {
      logger.info(`Extracting race details for ${trackName} Race ${raceNumber}`);

      const model = this.client.getGenerativeModel({ model: this.model });

      const prompt = `
You are analyzing a horse racing page header/details section. Extract the race information:
1. Race time (HH:MM format)
2. Race conditions (Type of race, e.g., "Maiden Special Weight", "Stakes", etc.)
3. Distance (e.g., "1 Mile", "6 Furlongs")
4. Purse amount if visible

Return as JSON:
{
  "raceTime": "<time in HH:MM format or null>",
  "conditions": "<race type description>",
  "distance": "<distance>",
  "purse": "<purse amount or null>"
}

Return ONLY valid JSON, no other text.
`;

      const response = await model.generateContent([
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/png',
          },
        },
        {
          text: prompt,
        },
      ]);

      const responseText = response.response.text();
      logger.info('Race details extraction response', { raceNumber, responseLength: responseText.length });

      // Parse the JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('Could not extract race details', { raceNumber });
        return {};
      }

      const details = JSON.parse(jsonMatch[0]);
      return details;
    } catch (error) {
      logger.error(`Error extracting race details for ${trackName} Race ${raceNumber}`, error);
      return {};
    }
  }
}
