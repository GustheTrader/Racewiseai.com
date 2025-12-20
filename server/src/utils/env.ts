import dotenv from 'dotenv';
import { ScraperConfig } from '../types/index.js';

dotenv.config();

export const getConfig = (): ScraperConfig => {
  const requiredEnvVars = [
    'GEMINI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_KEY'
  ];

  // Check for required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    geminiApiKey: process.env.GEMINI_API_KEY!,
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_KEY!,
    adminEmails: (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean),
    serverPort: parseInt(process.env.SERVER_PORT || '3001', 10),
    morningScrapTime: process.env.MORNING_SCRAP_TIME || '08:00', // 8 AM
    racingScrapStartTime: process.env.RACING_START_TIME || '12:00', // 12 PM (noon)
    racingScrapEndTime: process.env.RACING_END_TIME || '22:00', // 10 PM
    racingScrapInterval: parseInt(process.env.RACING_SCRAP_INTERVAL || '300', 10), // 5 minutes default
  };
};

export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  },
};
