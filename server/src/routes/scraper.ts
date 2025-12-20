import express, { Router, Request, Response } from 'express';
import { RaceOddsScraper } from '../services/scraper.js';
import { DatabaseService } from '../services/databaseService.js';
import { getConfig, logger } from '../utils/env.js';

const router = Router();
const config = getConfig();
const scraper = new RaceOddsScraper();
const database = new DatabaseService(config.supabaseUrl, config.supabaseKey);

/**
 * GET /api/scraper/odds/:trackName/:raceNumber
 * Get latest odds for a specific race
 */
router.get('/odds/:trackName/:raceNumber', async (req: Request, res: Response) => {
  try {
    const { trackName, raceNumber } = req.params;
    const raceNum = parseInt(raceNumber);

    if (isNaN(raceNum) || raceNum < 1) {
      return res.status(400).json({ error: 'Invalid race number' });
    }

    const odds = await database.getLatestOdds(trackName, raceNum);

    if (!odds) {
      return res.status(404).json({ error: 'No odds found' });
    }

    res.json({
      success: true,
      data: odds,
      trackName,
      raceNumber: raceNum,
      count: odds.length,
    });
  } catch (error) {
    logger.error('Error fetching odds', error);
    res.status(500).json({ error: 'Failed to fetch odds' });
  }
});

/**
 * GET /api/scraper/will-pays/:trackName/:raceNumber
 * Get latest will-pays for a specific race
 */
router.get('/will-pays/:trackName/:raceNumber', async (req: Request, res: Response) => {
  try {
    const { trackName, raceNumber } = req.params;
    const raceNum = parseInt(raceNumber);

    if (isNaN(raceNum) || raceNum < 1) {
      return res.status(400).json({ error: 'Invalid race number' });
    }

    const willPays = await database.getLatestWillPays(trackName, raceNum);

    if (!willPays) {
      return res.status(404).json({ error: 'No will-pays found' });
    }

    res.json({
      success: true,
      data: willPays,
      trackName,
      raceNumber: raceNum,
      count: willPays.length,
    });
  } catch (error) {
    logger.error('Error fetching will-pays', error);
    res.status(500).json({ error: 'Failed to fetch will-pays' });
  }
});

/**
 * GET /api/scraper/races/:trackName/:date
 * Get all available races for a track on a specific date
 */
router.get('/races/:trackName/:date', async (req: Request, res: Response) => {
  try {
    const { trackName, date } = req.params;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const races = await database.getTracksRaces(trackName, date);

    res.json({
      success: true,
      data: races || [],
      trackName,
      date,
      raceCount: races?.length || 0,
    });
  } catch (error) {
    logger.error('Error fetching races', error);
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

/**
 * GET /api/scraper/stats
 * Get scraper statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await database.getScraperStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching stats', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * POST /api/scraper/trigger/morning
 * Manually trigger morning odds scrape (admin only)
 */
router.post('/trigger/morning', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication check
    logger.info('Manual trigger for morning odds scrape initiated');

    // Run in background
    scraper
      .scrapeRace('GPM', 1, 'https://app.offtrackbetting.com/#/lobby/live-racing?programName=GPM')
      .catch(error => logger.error('Background scrape failed', error));

    res.json({
      success: true,
      message: 'Morning odds scrape triggered',
    });
  } catch (error) {
    logger.error('Error triggering morning scrape', error);
    res.status(500).json({ error: 'Failed to trigger scrape' });
  }
});

/**
 * POST /api/scraper/trigger/racing
 * Manually trigger racing odds scrape (admin only)
 */
router.post('/trigger/racing', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication check
    logger.info('Manual trigger for racing odds scrape initiated');

    // Run in background
    scraper
      .scrapeRace('GPM', 1, 'https://app.offtrackbetting.com/#/lobby/live-racing?programName=GPM')
      .catch(error => logger.error('Background scrape failed', error));

    res.json({
      success: true,
      message: 'Racing odds scrape triggered',
    });
  } catch (error) {
    logger.error('Error triggering racing scrape', error);
    res.status(500).json({ error: 'Failed to trigger scrape' });
  }
});

/**
 * POST /api/scraper/manual
 * Manually scrape a specific race (admin only)
 */
router.post('/manual', async (req: Request, res: Response) => {
  try {
    const { trackName, raceNumber, url } = req.body;

    if (!trackName || !raceNumber || !url) {
      return res.status(400).json({ error: 'Missing required fields: trackName, raceNumber, url' });
    }

    // TODO: Add admin authentication check

    const raceData = await scraper.scrapeRace(trackName, raceNumber, url);

    if (!raceData) {
      return res.status(400).json({ error: 'Failed to scrape race' });
    }

    res.json({
      success: true,
      data: raceData,
      message: `Successfully scraped ${trackName} Race ${raceNumber}`,
    });
  } catch (error) {
    logger.error('Error in manual scrape', error);
    res.status(500).json({ error: 'Failed to complete scrape' });
  }
});

export default router;
