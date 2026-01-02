import { z } from "zod";

// Race Card Schema
export const RaceCardSchema = z.object({
  track_name: z.string().min(1),
  race_date: z.string().date(),
  race_number: z.number().int().positive(),
  race_time: z.string().optional(),
  post_time: z.string().optional(),
  race_type: z.string().optional(),
  distance: z.string().optional(),
  surface: z.string().optional(),
  conditions: z.string().optional(),
  purse: z.string().optional(),
  source_url: z.string().url().optional(),
});

// Horse Schema
export const HorseSchema = z.object({
  program_number: z.number().int().positive(),
  horse_name: z.string().min(1),
  jockey_name: z.string().optional(),
  trainer_name: z.string().optional(),
  post_position: z.number().int().positive().optional(),
  morning_line: z.string().optional(),
  weight: z.number().int().optional(),
  age: z.number().int().optional(),
  recent_form: z.string().optional(),
});

// Betting Pool Schema
export const BettingPoolSchema = z.object({
  pool_type: z.enum(["WIN", "PLACE", "SHOW", "EXACTA", "TRIFECTA", "SUPERFECTA"]),
  total_pool: z.number().positive(),
  pool_count: z.number().int().positive().optional(),
});

// Scraped Race Data Schema
export const ScrapedRaceDataSchema = z.object({
  track_name: z.string().min(1),
  race_date: z.string().date(),
  race_number: z.number().int().positive(),
  race_time: z.string().optional(),
  post_time: z.string().optional(),
  race_type: z.string().optional(),
  distance: z.string().optional(),
  surface: z.string().optional(),
  conditions: z.string().optional(),
  purse: z.string().optional(),
  horses: z.array(HorseSchema).min(1),
  betting_pools: z.array(BettingPoolSchema).optional(),
});

// Race Result Schema
export const RaceResultSchema = z.object({
  track_name: z.string().min(1),
  race_number: z.number().int().positive(),
  race_date: z.string().date(),
  winning_horse: z.string().optional(),
  winning_program: z.number().int().positive().optional(),
  winning_odds: z.string().optional(),
  place_horse: z.string().optional(),
  place_program: z.number().int().positive().optional(),
  place_odds: z.string().optional(),
  show_horse: z.string().optional(),
  show_program: z.number().int().positive().optional(),
  show_odds: z.string().optional(),
  exacta_payout: z.string().optional(),
  trifecta_payout: z.string().optional(),
  superfecta_payout: z.string().optional(),
  win_pool_total: z.number().positive().optional(),
  place_pool_total: z.number().positive().optional(),
  show_pool_total: z.number().positive().optional(),
  exacta_pool_total: z.number().positive().optional(),
  carryover: z.number().optional(),
  time_of_race: z.string().optional(),
  race_conditions: z.string().optional(),
  distance: z.string().optional(),
  surface: z.string().optional(),
  field_size: z.number().int().positive().optional(),
});

// Scrape Job Schema
export const ScrapeJobSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url(),
  track_name: z.string().min(1),
  job_type: z.enum(["odds", "will_pays", "results", "entries"]),
  status: z.enum(["pending", "running", "completed", "failed"]).optional(),
  interval_seconds: z.number().int().positive(),
  is_active: z.boolean().default(true),
  last_run_at: z.string().datetime().nullable().optional(),
  next_run_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  created_by: z.string().uuid().optional(),
  retry_count: z.number().int().nonnegative().optional(),
  max_retries: z.number().int().positive().optional(),
  error_message: z.string().optional(),
});

// Odds Data Schema
export const OddsDataSchema = z.object({
  track_name: z.string().min(1),
  race_number: z.number().int().positive(),
  race_date: z.string().date(),
  horse_number: z.number().int().positive(),
  horse_name: z.string().min(1),
  win_odds: z.number().positive().optional(),
  place_odds: z.number().positive().optional(),
  show_odds: z.number().positive().optional(),
  pool_data: z.record(z.any()).optional(),
  scraped_at: z.string().datetime().optional(),
});

// Exotic Will Pay Schema
export const ExoticWillPaySchema = z.object({
  track_name: z.string().min(1),
  race_number: z.number().int().positive(),
  race_date: z.string().date(),
  wager_type: z.enum(["EXACTA", "TRIFECTA", "SUPERFECTA", "PICK3", "PICK4"]),
  combination: z.string(),
  payout: z.number().positive(),
  is_carryover: z.boolean().optional(),
  carryover_amount: z.number().optional(),
  scraped_at: z.string().datetime().optional(),
});

// Scraper Audit Log Schema
export const ScraperAuditLogSchema = z.object({
  track_name: z.string().min(1),
  race_date: z.string().date(),
  status: z.enum(["SUCCESS", "FAILED", "PARTIAL"]),
  races_scraped: z.number().int().nonnegative(),
  horses_scraped: z.number().int().nonnegative(),
  duration_ms: z.number().int().positive(),
  error_message: z.string().optional(),
  created_at: z.string().datetime().optional(),
});

// Type exports for TypeScript
export type RaceCard = z.infer<typeof RaceCardSchema>;
export type Horse = z.infer<typeof HorseSchema>;
export type BettingPool = z.infer<typeof BettingPoolSchema>;
export type ScrapedRaceData = z.infer<typeof ScrapedRaceDataSchema>;
export type RaceResult = z.infer<typeof RaceResultSchema>;
export type ScrapeJob = z.infer<typeof ScrapeJobSchema>;
export type OddsData = z.infer<typeof OddsDataSchema>;
export type ExoticWillPay = z.infer<typeof ExoticWillPaySchema>;
export type ScraperAuditLog = z.infer<typeof ScraperAuditLogSchema>;
