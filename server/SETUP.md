# Setup Guide for RaceWise Scraper Backend

This guide walks you through setting up the complete scraper backend with Gemini 3.0 Flash, Puppeteer, and cron jobs.

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key" → "Create API key in new project"
3. Copy the API key
4. Save it in your `.env` file as `GEMINI_API_KEY`

## Step 2: Set Up Supabase Database

### Create Tables

Run these SQL queries in your Supabase SQL Editor:

```sql
-- Odds Data Table
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

-- Exotic Will-Pays Table
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
CREATE INDEX idx_willpay_wager ON exotic_will_pays(wager_type);

-- Scraper Runs Log
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
CREATE INDEX idx_runs_success ON scraper_runs(success);

-- Enable Row Level Security (optional)
ALTER TABLE odds_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE exotic_will_pays ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_runs ENABLE ROW LEVEL SECURITY;
```

### Get Supabase Credentials

1. Open your Supabase project
2. Go to Settings → API
3. Copy:
   - Project URL → `SUPABASE_URL`
   - Project API Key (service_role) → `SUPABASE_KEY` (use service role for full access)

## Step 3: Environment Configuration

1. **Create server/.env file:**
```bash
cd server
cp .env.example .env
```

2. **Fill in your credentials:**
```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key_here

# Admin Configuration
ADMIN_EMAILS=your_email@example.com

# Server
SERVER_PORT=3001

# Cron Schedules
MORNING_SCRAP_TIME=08:00
RACING_START_TIME=12:00
RACING_END_TIME=22:00
RACING_SCRAP_INTERVAL=300

# Node
NODE_ENV=production
```

### Schedule Configuration Explained

- **MORNING_SCRAP_TIME** (08:00): When to scrape morning entries/morning lines
  - Adjust based on when morning lines are released
  - Example: 07:30 for early starts

- **RACING_START_TIME** (12:00): When to start scraping live odds
  - Adjust to when first race typically starts
  - Most tracks: 12:00 PM or 1:00 PM

- **RACING_END_TIME** (22:00): When to stop scraping
  - Adjust to when last race finishes
  - Most tracks: 9:00 PM or 10:00 PM

- **RACING_SCRAP_INTERVAL** (300): Update odds every N seconds
  - 60 = Update every minute (fast)
  - 300 = Update every 5 minutes (balanced)
  - 600 = Update every 10 minutes (slow)

## Step 4: Installation & Testing

### Local Development

```bash
# Install dependencies
npm install

# Development mode (auto-reload)
npm run dev

# In another terminal, test the API
curl http://localhost:3001/health
```

### Build for Production

```bash
# Compile TypeScript
npm run build

# Run production version
npm start
```

### Manual Testing

```bash
# Test single race scrape
npm run scrape

# Or use curl to trigger a scrape
curl -X POST http://localhost:3001/api/scraper/manual \
  -H "Content-Type: application/json" \
  -d '{
    "trackName": "GPM",
    "raceNumber": 6,
    "url": "https://app.offtrackbetting.com/#/lobby/live-racing?programName=GPM&raceNumber=6"
  }'
```

## Step 5: Docker Deployment (Optional)

### Build Docker Image

```bash
# Build the Docker image
docker build -f server/Dockerfile -t racewise-scraper .

# Test locally
docker run -d \
  -e GEMINI_API_KEY=your_key \
  -e SUPABASE_URL=https://your_project.supabase.co \
  -e SUPABASE_KEY=your_key \
  -p 3001:3001 \
  racewise-scraper
```

### Using Docker Compose

```bash
# Create .env file in root directory
cp server/.env.example .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f scraper-backend

# Stop services
docker-compose down
```

## Step 6: Connect React Frontend

Update your React frontend to use the backend API:

```typescript
// src/services/scraperApi.ts
export const scraperApi = {
  getOdds: (trackName: string, raceNumber: number) =>
    fetch(`http://localhost:3001/api/scraper/odds/${trackName}/${raceNumber}`).then(r => r.json()),

  getWillPays: (trackName: string, raceNumber: number) =>
    fetch(`http://localhost:3001/api/scraper/will-pays/${trackName}/${raceNumber}`).then(r => r.json()),

  getRaces: (trackName: string, date: string) =>
    fetch(`http://localhost:3001/api/scraper/races/${trackName}/${date}`).then(r => r.json()),

  getStats: () =>
    fetch(`http://localhost:3001/api/scraper/stats`).then(r => r.json()),

  triggerMorningOdds: () =>
    fetch(`http://localhost:3001/api/scraper/trigger/morning`, { method: 'POST' }).then(r => r.json()),

  triggerRacingOdds: () =>
    fetch(`http://localhost:3001/api/scraper/trigger/racing`, { method: 'POST' }).then(r => r.json()),
};
```

## Step 7: Monitoring & Logging

### Check Scraper Runs
```sql
-- See all scraper runs in the last 24 hours
SELECT * FROM scraper_runs
WHERE executed_at > NOW() - INTERVAL '24 hours'
ORDER BY executed_at DESC;

-- Success rate
SELECT
  COUNT(*) as total_runs,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  ROUND(SUM(CASE WHEN success THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM scraper_runs;

-- Records collected today
SELECT
  track_name,
  COUNT(*) as total_horses,
  COUNT(DISTINCT horse_number) as unique_horses
FROM odds_data
WHERE race_date = CURRENT_DATE
GROUP BY track_name
ORDER BY total_horses DESC;
```

### Check Logs

```bash
# If running with Docker
docker-compose logs -f scraper-backend

# If running locally
# Logs appear in console with [INFO], [ERROR], [WARN] prefixes
```

## Step 8: Common Issues & Solutions

### Issue: "ENOENT: no such file or directory, open '.env'"
**Solution:** Create `.env` file in server directory with correct configuration

### Issue: "Puppeteer: Failed to download Chromium"
**Solution:**
```bash
# Install system dependencies
sudo apt-get install chromium-browser

# Or set environment variable
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Issue: "Invalid API Key" from Gemini
**Solution:**
1. Verify API key is correct in .env
2. Ensure Gemini API is enabled in Google Cloud project
3. Check API key hasn't been revoked

### Issue: Cron jobs not running
**Solution:**
1. Check SERVER_PORT isn't already in use
2. Verify time format is HH:MM (24-hour)
3. Check system timezone matches your expected times
4. Restart the server: `npm run dev`

## Production Checklist

- [ ] Set `NODE_ENV=production` in .env
- [ ] Use Supabase service_role key (not anon key)
- [ ] Enable Row Level Security on Supabase tables
- [ ] Set up proper logging (centralized logging service)
- [ ] Configure CORS to only allow your frontend domain
- [ ] Set up SSL/HTTPS for production
- [ ] Create database backups
- [ ] Monitor API error rates and performance
- [ ] Set up alerts for failed scrapes
- [ ] Document any custom track/race configurations

## Next Steps

1. Test the scraper with a single race
2. Monitor the logs to ensure it's working
3. Adjust cron schedules based on actual racing times
4. Connect your React frontend to the API
5. Deploy to production (Docker recommended)

For more details, see [README.md](./README.md)
