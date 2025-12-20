import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/env.js';
import { RaceData } from '../types/index.js';

export class DatabaseService {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    logger.info('Database service initialized');
  }

  /**
   * Store scraped odds data
   */
  async storeOdds(raceData: RaceData): Promise<boolean> {
    try {
      logger.info(`Storing odds for ${raceData.trackName} Race ${raceData.raceNumber}`);

      for (const horse of raceData.horses) {
        const { error } = await this.supabase.from('odds_data').insert({
          track_name: raceData.trackName,
          race_number: raceData.raceNumber,
          race_date: new Date().toISOString().split('T')[0],
          horse_number: horse.number,
          horse_name: horse.name,
          win_odds: horse.odds,
          morning_line: horse.morningLine,
          post_position: horse.postPosition,
          jockey: horse.jockey,
          trainer: horse.trainer,
          pool_data: raceData.poolData || {},
          scraped_at: raceData.scraped_at,
        });

        if (error) {
          logger.error(`Error storing odds for horse ${horse.name}`, error);
          return false;
        }
      }

      logger.info(`Successfully stored ${raceData.horses.length} horses for ${raceData.trackName} Race ${raceData.raceNumber}`);
      return true;
    } catch (error) {
      logger.error('Error in storeOdds', error);
      return false;
    }
  }

  /**
   * Store will-pays data
   */
  async storeWillPays(raceData: RaceData): Promise<boolean> {
    try {
      logger.info(`Storing will-pays for ${raceData.trackName} Race ${raceData.raceNumber}`);

      for (const willPay of raceData.willPays) {
        const { error } = await this.supabase.from('exotic_will_pays').insert({
          track_name: raceData.trackName,
          race_number: raceData.raceNumber,
          race_date: new Date().toISOString().split('T')[0],
          wager_type: willPay.wagerType,
          combination: willPay.combination,
          payout: willPay.payout,
          is_carryover: willPay.isCarryover || false,
          carryover_amount: willPay.carryoverAmount,
          scraped_at: raceData.scraped_at,
        });

        if (error) {
          logger.error(`Error storing will-pay for ${willPay.wagerType}`, error);
          return false;
        }
      }

      logger.info(`Successfully stored ${raceData.willPays.length} will-pays for ${raceData.trackName} Race ${raceData.raceNumber}`);
      return true;
    } catch (error) {
      logger.error('Error in storeWillPays', error);
      return false;
    }
  }

  /**
   * Get latest odds for a track
   */
  async getLatestOdds(trackName: string, raceNumber: number) {
    try {
      const { data, error } = await this.supabase
        .from('odds_data')
        .select('*')
        .eq('track_name', trackName)
        .eq('race_number', raceNumber)
        .order('scraped_at', { ascending: false })
        .limit(20);

      if (error) {
        logger.error('Error fetching odds', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getLatestOdds', error);
      return null;
    }
  }

  /**
   * Get latest will-pays for a track
   */
  async getLatestWillPays(trackName: string, raceNumber: number) {
    try {
      const { data, error } = await this.supabase
        .from('exotic_will_pays')
        .select('*')
        .eq('track_name', trackName)
        .eq('race_number', raceNumber)
        .order('scraped_at', { ascending: false })
        .limit(20);

      if (error) {
        logger.error('Error fetching will-pays', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getLatestWillPays', error);
      return null;
    }
  }

  /**
   * Get available races for a track on a specific date
   */
  async getTracksRaces(trackName: string, date: string) {
    try {
      const { data, error } = await this.supabase
        .from('odds_data')
        .select('race_number, race_date')
        .eq('track_name', trackName)
        .eq('race_date', date)
        .order('race_number', { ascending: true });

      if (error) {
        logger.error('Error fetching races', error);
        return null;
      }

      // Get unique race numbers
      const uniqueRaces = [...new Set(data.map((d: any) => d.race_number))];
      return uniqueRaces;
    } catch (error) {
      logger.error('Error in getTracksRaces', error);
      return null;
    }
  }

  /**
   * Store scraper job status
   */
  async recordScraperRun(trackName: string, raceNumber: number, success: boolean, data?: any) {
    try {
      const { error } = await this.supabase.from('scraper_runs').insert({
        track_name: trackName,
        race_number: raceNumber,
        success,
        error_message: data?.error || null,
        horses_scraped: data?.horsesCount || 0,
        will_pays_scraped: data?.willPaysCount || 0,
        executed_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Error recording scraper run', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in recordScraperRun', error);
      return false;
    }
  }

  /**
   * Get scraper statistics
   */
  async getScraperStats() {
    try {
      // Get stats from various tables
      const [oddsCount, willPaysCount, runsCount] = await Promise.all([
        this.supabase.from('odds_data').select('*', { count: 'exact', head: true }),
        this.supabase.from('exotic_will_pays').select('*', { count: 'exact', head: true }),
        this.supabase.from('scraper_runs').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalOddsRecords: oddsCount.count || 0,
        totalWillPaysRecords: willPaysCount.count || 0,
        totalScraperRuns: runsCount.count || 0,
      };
    } catch (error) {
      logger.error('Error in getScraperStats', error);
      return null;
    }
  }
}
