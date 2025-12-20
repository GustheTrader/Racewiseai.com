# RaceWise Scraper Integration Guide

Complete guide to integrate the Gemini 3.0 Flash scraper backend with your React frontend.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Your React Frontend                      │
│                  (http://localhost:5173)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP API Calls
                         │
          ┌──────────────▼──────────────┐
          │   Express.js Backend        │
          │ (http://localhost:3001)     │
          ├──────────────┬──────────────┤
          │ • API Routes │              │
          │ • Cron Jobs  │              │
          └──────┬───────┴──────┬───────┘
                 │              │
        ┌────────▼──┐    ┌─────▼──────┐
        │ Puppeteer  │    │   Gemini   │
        │ (Renders)  │    │  3.0 Flash │
        └────┬───────┘    └─────┬──────┘
             │                  │
             │  Screenshots     │  Extract Data
             └────────┬─────────┘
                      │
              ┌───────▼────────┐
              │   OTB Website   │
              │ (Live Racing)   │
              └────────────────┘

              ┌───────────────────┐
              │    Supabase       │
              │  (Data Storage)   │
              ├───────────────────┤
              │ • odds_data       │
              │ • will_pays       │
              │ • scraper_runs    │
              └───────────────────┘
```

## Complete Setup Steps

### 1. Backend Installation

```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Get Gemini API Key from: https://aistudio.google.com/apikey
# Get Supabase credentials from: https://supabase.com

# Edit .env with your credentials
nano .env

# Test the backend
npm run dev

# In another terminal, check if it's running
curl http://localhost:3001/health
```

### 2. Configure Supabase

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create odds_data table
CREATE TABLE odds_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  track_name TEXT NOT NULL,
  race_number INT NOT NULL,
  race_date DATE NOT NULL,
  horse_number INT NOT NULL,
  horse_name TEXT NOT NULL,
  win_odds TEXT,
  morning_line TEXT,
  post_position INT,
  jockey TEXT,
  trainer TEXT,
  pool_data JSONB,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_odds_track_race ON odds_data(track_name, race_number);
CREATE INDEX idx_odds_date ON odds_data(race_date);
CREATE INDEX idx_odds_scraped ON odds_data(scraped_at);

-- Create exotic_will_pays table
CREATE TABLE exotic_will_pays (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  track_name TEXT NOT NULL,
  race_number INT NOT NULL,
  race_date DATE NOT NULL,
  wager_type TEXT NOT NULL,
  combination TEXT,
  payout NUMERIC,
  is_carryover BOOLEAN DEFAULT FALSE,
  carryover_amount NUMERIC,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_willpay_track_race ON exotic_will_pays(track_name, race_number);
CREATE INDEX idx_willpay_date ON exotic_will_pays(race_date);

-- Create scraper_runs table
CREATE TABLE scraper_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  track_name TEXT NOT NULL,
  race_number INT NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  horses_scraped INT,
  will_pays_scraped INT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_runs_track_date ON scraper_runs(track_name, executed_at);
```

### 3. Update React Frontend

Create `src/services/scraperApi.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_SCRAPER_API || 'http://localhost:3001/api/scraper';

export interface ScraperResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const scraperApi = {
  /**
   * Get latest odds for a race
   */
  async getOdds(trackName: string, raceNumber: number) {
    const response = await fetch(
      `${API_BASE_URL}/odds/${encodeURIComponent(trackName)}/${raceNumber}`
    );
    return response.json() as Promise<ScraperResponse<any[]>>;
  },

  /**
   * Get latest will-pays for a race
   */
  async getWillPays(trackName: string, raceNumber: number) {
    const response = await fetch(
      `${API_BASE_URL}/will-pays/${encodeURIComponent(trackName)}/${raceNumber}`
    );
    return response.json() as Promise<ScraperResponse<any[]>>;
  },

  /**
   * Get available races for a track on a specific date
   */
  async getRaces(trackName: string, date: string) {
    const response = await fetch(
      `${API_BASE_URL}/races/${encodeURIComponent(trackName)}/${date}`
    );
    return response.json() as Promise<ScraperResponse<number[]>>;
  },

  /**
   * Get scraper statistics
   */
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return response.json() as Promise<ScraperResponse<any>>;
  },

  /**
   * Manually trigger morning odds scrape (admin only)
   */
  async triggerMorningOdds() {
    const response = await fetch(`${API_BASE_URL}/trigger/morning`, {
      method: 'POST',
    });
    return response.json() as Promise<ScraperResponse<any>>;
  },

  /**
   * Manually trigger racing odds scrape (admin only)
   */
  async triggerRacingOdds() {
    const response = await fetch(`${API_BASE_URL}/trigger/racing`, {
      method: 'POST',
    });
    return response.json() as Promise<ScraperResponse<any>>;
  },

  /**
   * Manually scrape a specific race (admin only)
   */
  async scrapeRace(trackName: string, raceNumber: number, url: string) {
    const response = await fetch(`${API_BASE_URL}/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackName, raceNumber, url }),
    });
    return response.json() as Promise<ScraperResponse<any>>;
  },
};
```

Create `.env` for React:
```env
REACT_APP_SCRAPER_API=http://localhost:3001/api/scraper
```

### 4. Use in React Components

Example component using odds data:

```typescript
import { useEffect, useState } from 'react';
import { scraperApi } from '@/services/scraperApi';

export function OddsPanel({ trackName, raceNumber }: Props) {
  const [odds, setOdds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOdds = async () => {
      setLoading(true);
      try {
        const result = await scraperApi.getOdds(trackName, raceNumber);
        if (result.success && result.data) {
          setOdds(result.data);
        } else {
          setError(result.error || 'Failed to fetch odds');
        }
      } catch (err) {
        setError('Error fetching odds');
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
    // Refetch every 30 seconds during racing
    const interval = setInterval(fetchOdds, 30000);

    return () => clearInterval(interval);
  }, [trackName, raceNumber]);

  return (
    <div>
      {loading && <div>Loading odds...</div>}
      {error && <div className="error">{error}</div>}
      {odds.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Horse #</th>
              <th>Name</th>
              <th>Odds</th>
              <th>Morning Line</th>
            </tr>
          </thead>
          <tbody>
            {odds.map(horse => (
              <tr key={horse.id}>
                <td>{horse.horse_number}</td>
                <td>{horse.horse_name}</td>
                <td>{horse.win_odds}</td>
                <td>{horse.morning_line}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### 5. Real-Time Updates with Polling

```typescript
// Custom hook for auto-refreshing odds
export function useOdds(trackName: string, raceNumber: number, refreshInterval = 30000) {
  const [odds, setOdds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOdds = async () => {
      setLoading(true);
      try {
        const result = await scraperApi.getOdds(trackName, raceNumber);
        if (result.success && result.data) {
          setOdds(result.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
    const interval = setInterval(fetchOdds, refreshInterval);

    return () => clearInterval(interval);
  }, [trackName, raceNumber, refreshInterval]);

  return { odds, loading };
}
```

### 6. Admin Controls Component

```typescript
export function ScraperControls() {
  const [loading, setLoading] = useState(false);

  const handleTriggerMorning = async () => {
    setLoading(true);
    try {
      await scraperApi.triggerMorningOdds();
      toast.success('Morning odds scrape triggered');
    } catch (err) {
      toast.error('Failed to trigger morning scrape');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerRacing = async () => {
    setLoading(true);
    try {
      await scraperApi.triggerRacingOdds();
      toast.success('Racing odds scrape triggered');
    } catch (err) {
      toast.error('Failed to trigger racing scrape');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scraper-controls">
      <button onClick={handleTriggerMorning} disabled={loading}>
        Scrape Morning Odds
      </button>
      <button onClick={handleTriggerRacing} disabled={loading}>
        Update Racing Odds
      </button>
    </div>
  );
}
```

## Testing

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Get odds
curl http://localhost:3001/api/scraper/odds/GPM/6

# Get will-pays
curl http://localhost:3001/api/scraper/will-pays/GPM/6

# Get available races
curl http://localhost:3001/api/scraper/races/GPM/2025-12-20

# Get stats
curl http://localhost:3001/api/scraper/stats

# Trigger manual scrape
curl -X POST http://localhost:3001/api/scraper/manual \
  -H "Content-Type: application/json" \
  -d '{
    "trackName": "GPM",
    "raceNumber": 6,
    "url": "https://app.offtrackbetting.com/#/lobby/live-racing?programName=GPM&raceNumber=6"
  }'
```

## Cron Job Schedule Reference

| Schedule | Morning | Racing |
|----------|---------|--------|
| **Start Time** | 8:00 AM | 12:00 PM |
| **Frequency** | Once daily | Every 5 min |
| **Duration** | 15-30 min | Until 10:00 PM |
| **Purpose** | Entries, morning lines | Live odds updates |

### Customizing Schedules

Edit `server/.env`:

```env
# Get entries at 7:30 AM
MORNING_SCRAP_TIME=07:30

# Start updating odds at 11:30 AM
RACING_START_TIME=11:30

# Stop at 9:30 PM
RACING_END_TIME=21:30

# Update every 2 minutes instead of 5
RACING_SCRAP_INTERVAL=120
```

## Production Deployment

### Docker Setup

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f scraper-backend

# Stop
docker-compose down
```

### Environment Variables for Production

Update `.env`:
```env
NODE_ENV=production
GEMINI_API_KEY=<your-production-key>
SUPABASE_URL=<your-production-url>
SUPABASE_KEY=<your-production-key>
```

## Monitoring

### Check Scraper Success Rate

```sql
SELECT
  DATE(executed_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  ROUND(SUM(CASE WHEN success THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM scraper_runs
GROUP BY DATE(executed_at)
ORDER BY date DESC
LIMIT 30;
```

### Monitor Data Collection

```sql
SELECT
  track_name,
  COUNT(DISTINCT horse_number) as unique_horses,
  COUNT(*) as total_records,
  MAX(scraped_at) as last_update
FROM odds_data
WHERE race_date = CURRENT_DATE
GROUP BY track_name;
```

## Troubleshooting

### Backend Won't Start
```bash
# Check if port is already in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Try different port
SERVER_PORT=3002 npm run dev
```

### No Data Being Scraped
1. Check Gemini API key is valid
2. Verify website structure hasn't changed
3. Check browser logs: `npm run dev` with full output
4. Try manual scrape: `curl -X POST http://localhost:3001/api/scraper/manual ...`

### CORS Issues in React
Add to backend `.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

Update `server/src/index.ts`:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
```

## Next Steps

1. ✅ Install backend
2. ✅ Set up Supabase tables
3. ✅ Configure .env files
4. ✅ Test backend endpoints
5. ✅ Integrate with React frontend
6. ✅ Test data collection
7. ✅ Deploy to production

For detailed setup steps, see:
- Backend: [server/SETUP.md](./server/SETUP.md)
- Backend README: [server/README.md](./server/README.md)
