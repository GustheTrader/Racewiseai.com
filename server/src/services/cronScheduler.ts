import cron from 'node-cron';
import { getConfig, logger } from '../utils/env.js';
import { RaceOddsScraper } from './scraper.js';

export class CronScheduler {
  private config: ReturnType<typeof getConfig>;
  private scraper: RaceOddsScraper;
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isRunningRacingScrapes = false;

  constructor() {
    this.config = getConfig();
    this.scraper = new RaceOddsScraper();
    logger.info('Cron scheduler initialized');
  }

  /**
   * Start all scheduled jobs
   */
  startAll(): void {
    logger.info('Starting all cron jobs');
    this.scheduleMorningOdds();
    this.scheduleRacingDayOdds();
    this.logScheduledJobs();
  }

  /**
   * Schedule morning odds scraping (before racing starts)
   * Default: 8:00 AM every day
   */
  private scheduleMorningOdds(): void {
    // Convert time to cron expression (HH:MM format to cron)
    const [hour, minute] = this.config.morningScrapTime.split(':').map(Number);
    const cronExpression = `${minute} ${hour} * * *`; // Every day at HH:MM

    logger.info(`Scheduling morning odds scrape at ${this.config.morningScrapTime} (${cronExpression})`);

    const task = cron.schedule(cronExpression, async () => {
      logger.info('Starting scheduled morning odds scrape');
      await this.runMorningOddsCollection();
    });

    this.jobs.set('morningOdds', task);
  }

  /**
   * Schedule racing day odds scraping
   * Runs continuously during racing hours (e.g., 12 PM - 10 PM)
   */
  private scheduleRacingDayOdds(): void {
    // Start racing scrapes at race start time
    const [startHour, startMinute] = this.config.racingScrapStartTime.split(':').map(Number);
    const [endHour, endMinute] = this.config.racingScrapEndTime.split(':').map(Number);
    const intervalSeconds = this.config.racingScrapInterval;
    const intervalMinutes = Math.ceil(intervalSeconds / 60);

    const cronExpression = `*/${intervalMinutes} ${startHour}-${endHour} * * *`;

    logger.info(
      `Scheduling racing day odds scrape every ${intervalMinutes} minutes between ${this.config.racingScrapStartTime} and ${this.config.racingScrapEndTime}`
    );

    const task = cron.schedule(cronExpression, async () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Check if we're within racing hours
      const isInRacingWindow = (
        (currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) &&
        (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute))
      );

      if (isInRacingWindow && !this.isRunningRacingScrapes) {
        logger.info('Starting scheduled racing day odds scrape');
        await this.runRacingDayOddsCollection();
      } else if (!isInRacingWindow) {
        logger.info('Outside racing window, skipping scheduled scrape');
      }
    });

    this.jobs.set('racingOdds', task);
  }

  /**
   * Run morning odds collection
   * Scrapes entries and morning line odds
   */
  private async runMorningOddsCollection(): Promise<void> {
    try {
      logger.info('Collecting morning entries and odds');

      // List of tracks to scrape
      const tracks = [
        { name: 'GPM', raceCount: 10 },
        { name: 'SARATOGA', raceCount: 9 },
        { name: 'BELMONT', raceCount: 10 },
      ];

      for (const track of tracks) {
        try {
          const baseUrl = `https://app.offtrackbetting.com/#/lobby/live-racing?lobbyType=adw&programDate=${new Date().toISOString().split('T')[0]}&programName=${track.name}`;

          // Get race numbers (1-9 or 1-10 depending on track)
          const raceNumbers = Array.from({ length: track.raceCount }, (_, i) => i + 1);

          logger.info(`Scraping morning odds for ${track.name} (${raceNumbers.length} races)`);
          await this.scraper.scrapeTrack(track.name, raceNumbers, baseUrl);

          logger.info(`Completed morning scrape for ${track.name}`);
        } catch (error) {
          logger.error(`Error in morning scrape for ${track.name}`, error);
        }
      }

      logger.info('Morning odds collection completed');
    } catch (error) {
      logger.error('Error in runMorningOddsCollection', error);
    }
  }

  /**
   * Run racing day odds collection
   * Continuously updates odds during the racing day
   */
  private async runRacingDayOddsCollection(): Promise<void> {
    if (this.isRunningRacingScrapes) {
      logger.warn('Racing day scrape already in progress, skipping duplicate');
      return;
    }

    try {
      this.isRunningRacingScrapes = true;
      logger.info('Collecting racing day odds updates');

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Track with active racing
      const activeTrack = {
        name: 'GPM', // or dynamically determine from racing calendar
        raceCount: 10,
      };

      const baseUrl = `https://app.offtrackbetting.com/#/lobby/live-racing?lobbyType=adw&programDate=${today}&programName=${activeTrack.name}`;
      const raceNumbers = Array.from({ length: activeTrack.raceCount }, (_, i) => i + 1);

      logger.info(`Updating odds for ${activeTrack.name}`);
      await this.scraper.scrapeTrack(activeTrack.name, raceNumbers, baseUrl);

      logger.info('Racing day odds update completed');
    } catch (error) {
      logger.error('Error in runRacingDayOddsCollection', error);
    } finally {
      this.isRunningRacingScrapes = false;
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll(): void {
    logger.info('Stopping all cron jobs');
    for (const [jobId, task] of this.jobs) {
      task.stop();
      logger.info(`Stopped job: ${jobId}`);
    }
    this.jobs.clear();
  }

  /**
   * Get status of all jobs
   */
  getStatus(): { jobId: string; active: boolean }[] {
    return Array.from(this.jobs.entries()).map(([jobId, task]) => ({
      jobId,
      active: !task._destroyed,
    }));
  }

  /**
   * Log all scheduled jobs
   */
  private logScheduledJobs(): void {
    logger.info('Scheduled jobs:');
    const status = this.getStatus();
    for (const job of status) {
      logger.info(`  - ${job.jobId}: ${job.active ? 'ACTIVE' : 'INACTIVE'}`);
    }
  }

  /**
   * Manually trigger morning odds scrape
   */
  async triggerMorningOdds(): Promise<void> {
    logger.info('Manual trigger: Morning odds scrape');
    await this.runMorningOddsCollection();
  }

  /**
   * Manually trigger racing odds scrape
   */
  async triggerRacingOdds(): Promise<void> {
    logger.info('Manual trigger: Racing odds scrape');
    await this.runRacingDayOddsCollection();
  }
}
