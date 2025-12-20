# RaceWise Scraper Backend

A Node.js backend service powered by Gemini 3.0 Flash and Puppeteer to scrape horse racing odds, horses, and payouts from off-track betting websites. Features automated cron jobs for morning and racing day schedules.

## Features

- 🤖 **Gemini 3.0 Flash Vision API** for intelligent data extraction
- 📸 **Puppeteer** for rendering single-page applications and capturing screenshots
- 🔄 **Node Cron** for scheduled scraping tasks
- 🗄️ **Supabase** integration for data storage
- 🚀 **Express.js** REST API for querying scraped data
- 📋 **TypeScript** for type safety

## Prerequisites

- Node.js 18+ and npm
- Google Generative AI API key (Gemini)
- Supabase project with configured tables
- Puppeteer dependencies (Chrome/Chromium)

## Installation

1. **Clone and setup:**
```bash
cd server
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
GEMINI_API_KEY=your_api_key_here
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_KEY=your_key_here
MORNING_SCRAP_TIME=08:00
RACING_START_TIME=12:00
RACING_END_TIME=22:00
RACING_SCRAP_INTERVAL=300
```

3. **Build TypeScript:**
```bash
npm run build
```

## Running

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Manual Scraping
```bash
npm run scrape
```

## API Endpoints

### Get Latest Odds
```bash
GET /api/scraper/odds/:trackName/:raceNumber
```
Example: `GET /api/scraper/odds/GPM/6`

### Get Will-Pays
```bash
GET /api/scraper/will-pays/:trackName/:raceNumber
```
Example: `GET /api/scraper/will-pays/GPM/6`

### Get Available Races
```bash
GET /api/scraper/races/:trackName/:date
```
Example: `GET /api/scraper/races/GPM/2025-12-20`

### Get Statistics
```bash
GET /api/scraper/stats
```

### Trigger Morning Scrape (Admin)
```bash
POST /api/scraper/trigger/morning
```

### Trigger Racing Scrape (Admin)
```bash
POST /api/scraper/trigger/racing
```

### Manual Scrape (Admin)
```bash
POST /api/scraper/manual
Content-Type: application/json

{
  "trackName": "GPM",
  "raceNumber": 6,
  "url": "https://app.offtrackbetting.com/#/lobby/live-racing?programName=GPM&raceNumber=6"
}
```

## Cron Schedules

### Morning Odds Collection
- **Time:** 8:00 AM daily (configurable via `MORNING_SCRAP_TIME`)
- **Purpose:** Scrapes entries and morning line odds before racing starts
- **Tracks:** Configurable list of tracks (GPM, SARATOGA, BELMONT, etc.)

### Racing Day Odds Updates
- **Time:** 12:00 PM - 10:00 PM daily (configurable)
- **Interval:** Every 5 minutes (configurable via `RACING_SCRAP_INTERVAL`)
- **Purpose:** Updates odds continuously during live racing

## Database Schema

### odds_data table
```sql
- id (UUID)
- track_name (TEXT)
- race_number (INT)
- race_date (DATE)
- horse_number (INT)
- horse_name (TEXT)
- win_odds (TEXT)
- morning_line (TEXT)
- post_position (INT)
- jockey (TEXT)
- trainer (TEXT)
- pool_data (JSONB)
- scraped_at (TIMESTAMP)
```

### exotic_will_pays table
```sql
- id (UUID)
- track_name (TEXT)
- race_number (INT)
- race_date (DATE)
- wager_type (TEXT)
- combination (TEXT)
- payout (NUMERIC)
- is_carryover (BOOLEAN)
- carryover_amount (NUMERIC)
- scraped_at (TIMESTAMP)
```

### scraper_runs table
```sql
- id (UUID)
- track_name (TEXT)
- race_number (INT)
- success (BOOLEAN)
- error_message (TEXT)
- horses_scraped (INT)
- will_pays_scraped (INT)
- executed_at (TIMESTAMP)
```

## Docker Deployment

```bash
# Build image
docker build -t racewise-scraper .

# Run container
docker run -d \
  -e GEMINI_API_KEY=your_key \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_KEY=your_key \
  -p 3001:3001 \
  racewise-scraper
```

## Configuration

All settings are controlled via environment variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| GEMINI_API_KEY | - | Google Generative AI API key |
| SUPABASE_URL | - | Supabase project URL |
| SUPABASE_KEY | - | Supabase API key |
| SERVER_PORT | 3001 | Express server port |
| MORNING_SCRAP_TIME | 08:00 | Morning scrape time (HH:MM) |
| RACING_START_TIME | 12:00 | Racing scrape start time |
| RACING_END_TIME | 22:00 | Racing scrape end time |
| RACING_SCRAP_INTERVAL | 300 | Interval in seconds |
| ADMIN_EMAILS | - | Comma-separated admin emails |

## Error Handling

The scraper includes robust error handling:
- Screenshots are captured even if parsing fails
- Failed races are logged and recorded in `scraper_runs`
- Timeouts are handled gracefully
- Browser crashes are managed with cleanup

## Performance Tips

1. **Adjust scrape intervals** based on your needs:
   - Fast updates: 60-120 seconds
   - Medium updates: 300 seconds (5 min)
   - Slow updates: 600+ seconds

2. **Limit tracks** to only active ones to reduce load

3. **Monitor logs** for failed scrapes and adjust selectors as needed

4. **Use a dedicated server** for production deployments

## Troubleshooting

### "Browser not initialized" error
- Ensure Puppeteer is properly installed
- Check that Chrome/Chromium dependencies are available

### No data being scraped
- Verify Gemini API key is valid
- Check that the target website hasn't changed structure
- Review Gemini extraction prompts in `geminiScraper.ts`

### Cron jobs not running
- Verify timezone settings match your system
- Check server logs for scheduling errors
- Ensure NODE_ENV is not blocking job execution

### Database connection errors
- Verify Supabase credentials
- Ensure database tables exist and are properly configured
- Check network connectivity to Supabase

## Future Enhancements

- [ ] WebSocket support for real-time odds updates
- [ ] Multiple track support with dynamic configuration
- [ ] Advanced error recovery with exponential backoff
- [ ] Metrics and monitoring dashboard
- [ ] Cache layer for frequently accessed data
- [ ] Batch processing for multiple races
- [ ] Integration with racing calendars

## License

MIT
