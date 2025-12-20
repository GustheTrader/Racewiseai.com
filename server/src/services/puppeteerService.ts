import puppeteer, { Browser, Page } from 'puppeteer';
import { logger } from '../utils/env.js';

export class PuppeteerService {
  private browser: Browser | null = null;

  /**
   * Initialize the Puppeteer browser
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Puppeteer browser');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
      });
      logger.info('Puppeteer browser initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Puppeteer', error);
      throw error;
    }
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      logger.info('Puppeteer browser closed');
    }
  }

  /**
   * Navigate to a URL and wait for content to load
   */
  private async createPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }
    return this.browser.newPage();
  }

  /**
   * Capture a screenshot of the odds board
   */
  async captureOddsBoard(url: string, trackName: string, raceNumber: number): Promise<string> {
    let page: Page | null = null;
    try {
      logger.info(`Capturing odds board for ${trackName} Race ${raceNumber}`);
      page = await this.createPage();

      // Set viewport for consistent screenshots
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate with timeout
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for odds data to be visible
      await page.waitForSelector('[data-testid="odds"], .odds-board, .horse-row', {
        timeout: 10000,
      }).catch(() => {
        logger.warn(`Odds selector not found for ${trackName} Race ${raceNumber}, proceeding anyway`);
      });

      // Additional wait for dynamic content
      await page.waitForTimeout(2000);

      // Take screenshot
      const screenshot = await page.screenshot({ encoding: 'base64' });

      logger.info(`Odds board captured successfully for ${trackName} Race ${raceNumber}`);
      return screenshot as string;
    } catch (error) {
      logger.error(`Error capturing odds board for ${trackName} Race ${raceNumber}`, error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Capture a screenshot of will-pays/exotics section
   */
  async captureWillPays(url: string, trackName: string, raceNumber: number): Promise<string> {
    let page: Page | null = null;
    try {
      logger.info(`Capturing will-pays for ${trackName} Race ${raceNumber}`);
      page = await this.createPage();

      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait for will-pay data
      await page.waitForSelector('[data-testid="will-pay"], .will-pay, .exotic-payout', {
        timeout: 10000,
      }).catch(() => {
        logger.warn(`Will-pay selector not found for ${trackName} Race ${raceNumber}`);
      });

      await page.waitForTimeout(1000);

      // Scroll to will-pay section if needed
      await page.evaluate(() => {
        const willPayElement = document.querySelector('[data-testid="will-pay"], .will-pay');
        if (willPayElement) {
          willPayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      await page.waitForTimeout(1000);

      const screenshot = await page.screenshot({ encoding: 'base64' });

      logger.info(`Will-pays captured for ${trackName} Race ${raceNumber}`);
      return screenshot as string;
    } catch (error) {
      logger.error(`Error capturing will-pays for ${trackName} Race ${raceNumber}`, error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Capture race details/header section
   */
  async captureRaceDetails(url: string, trackName: string, raceNumber: number): Promise<string> {
    let page: Page | null = null;
    try {
      logger.info(`Capturing race details for ${trackName} Race ${raceNumber}`);
      page = await this.createPage();

      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await page.waitForTimeout(2000);

      // Get the header/race details section
      const screenshot = await page.screenshot({
        encoding: 'base64',
        clip: {
          x: 0,
          y: 0,
          width: 1920,
          height: 200, // Just the header area
        },
      });

      logger.info(`Race details captured for ${trackName} Race ${raceNumber}`);
      return screenshot as string;
    } catch (error) {
      logger.error(`Error capturing race details for ${trackName} Race ${raceNumber}`, error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }
}
