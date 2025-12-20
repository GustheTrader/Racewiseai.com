import { getConfig, logger } from '../utils/env.js';
import { PuppeteerService } from './puppeteerService.js';
import { GeminiScraper } from './geminiScraper.js';
import { DatabaseService } from './databaseService.js';
import { RaceData } from '../types/index.js';

export class RaceOddsScraper {
  private puppeteer: PuppeteerService;
  private gemini: GeminiScraper;
  private database: DatabaseService;
  private config: ReturnType<typeof getConfig>;

  constructor() {
    this.config = getConfig();
    this.puppeteer = new PuppeteerService();
    this.gemini = new GeminiScraper(this.config.geminiApiKey);
    this.database = new DatabaseService(this.config.supabaseUrl, this.config.supabaseKey);
  }

  /**
   * Scrape a specific race
   */
  async scrapeRace(trackName: string, raceNumber: number, url: string): Promise<RaceData | null> {
    let scrapeSuccess = false;
    let horsesCount = 0;
    let willPaysCount = 0;

    try {
      logger.info(`Starting scrape for ${trackName} Race ${raceNumber}`);

      // Initialize Puppeteer
      await this.puppeteer.initialize();

      // Capture screenshots
      const [oddsScreenshot, willPaysScreenshot, detailsScreenshot] = await Promise.all([
        this.puppeteer.captureOddsBoard(url, trackName, raceNumber),
        this.puppeteer.captureWillPays(url, trackName, raceNumber).catch(e => {
          logger.warn('Failed to capture will-pays', e);
          return '';
        }),
        this.puppeteer.captureRaceDetails(url, trackName, raceNumber).catch(e => {
          logger.warn('Failed to capture race details', e);
          return '';
        }),
      ]);

      // Extract data using Gemini
      const [horses, willPays, details] = await Promise.all([
        this.gemini.extractOdds(oddsScreenshot, trackName, raceNumber),
        willPaysScreenshot ? this.gemini.extractWillPays(willPaysScreenshot, trackName, raceNumber).catch(() => []) : Promise.resolve([]),
        detailsScreenshot ? this.gemini.extractRaceDetails(detailsScreenshot, trackName, raceNumber).catch(() => ({})) : Promise.resolve({}),
      ]);

      horsesCount = horses.length;
      willPaysCount = willPays.length;

      const raceData: RaceData = {
        trackName,
        raceNumber,
        raceTime: (details as any)?.raceTime || new Date().toLocaleTimeString(),
        conditions: (details as any)?.conditions || 'Unknown',
        distance: (details as any)?.distance || 'Unknown',
        purse: (details as any)?.purse,
        horses,
        willPays,
        poolData: {},
        scraped_at: new Date().toISOString(),
      };

      // Store in database
      const oddsStored = await this.database.storeOdds(raceData);
      const willPaysStored = willPays.length > 0 ? await this.database.storeWillPays(raceData) : true;

      if (oddsStored && willPaysStored) {
        scrapeSuccess = true;
        logger.info(`Successfully scraped ${trackName} Race ${raceNumber}`, {
          horses: horsesCount,
          willPays: willPaysCount,
        });
      }

      return raceData;
    } catch (error) {
      logger.error(`Error scraping ${trackName} Race ${raceNumber}`, error);
      return null;
    } finally {
      // Record the scraper run
      await this.database.recordScraperRun(trackName, raceNumber, scrapeSuccess, {
        horsesCount,
        willPaysCount,
        error: !scrapeSuccess ? (error as Error)?.message : null,
      });

      // Close browser
      await this.puppeteer.close();
    }
  }

  /**
   * Scrape multiple races for a track
   */
  async scrapeTrack(trackName: string, raceNumbers: number[], baseUrl: string): Promise<RaceData[]> {
    const results: RaceData[] = [];

    for (const raceNumber of raceNumbers) {
      const url = `${baseUrl}&raceNumber=${raceNumber}`;
      const raceData = await this.scrapeRace(trackName, raceNumber, url);

      if (raceData) {
        results.push(raceData);
      }

      // Add delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }

  /**
   * Get scraper statistics
   */
  async getStats() {
    return this.database.getScraperStats();
  }
}

// Test the scraper
if (import.meta.url === `file://${process.argv[1]}`) {
  const scraper = new RaceOddsScraper();

  const testUrl = 'https://app.offtrackbetting.com/#/lobby/live-racing?lobbyType=adw&programDate=2025-12-20&programName=GPM&raceNumber=6';

  scraper.scrapeRace('GPM', 6, testUrl)
    .then(result => {
      logger.info('Scrape completed', {
        success: !!result,
        horses: result?.horses.length || 0,
        willPays: result?.willPays.length || 0,
      });
    })
    .catch(error => {
      logger.error('Scrape failed', error);
    });
}
