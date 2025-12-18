# 🚀 Quick Start: Gemini Web Scraper

Get the AI-powered scraper running in **5 minutes**!

## Prerequisites

✅ RaceWiseAI application running
✅ Supabase account with project
✅ Google Gemini API key (free)

## 5-Minute Setup

### 1. Get Your Gemini API Key (2 min)

```bash
# Go to Google AI Studio
https://aistudio.google.com/app/apikey

# Click "Get API Key" and create one
# Copy the key - you'll use it next
```

### 2. Add Environment Variable (1 min)

Add to your `.env` file:

```bash
GEMINI_API_KEY=your_api_key_here
```

Or in **Supabase → Settings → Edge Functions → Secrets** (for production):
- Key: `GEMINI_API_KEY`
- Value: Your API key

### 3. Run Database Migration (1 min)

In **Supabase SQL Editor**, run:

```sql
-- Create tables for race data
CREATE TABLE IF NOT EXISTS race_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  race_number INTEGER NOT NULL,
  race_time TIME,
  post_time TIME,
  race_type TEXT,
  distance TEXT,
  surface TEXT,
  conditions TEXT,
  purse TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  source_url TEXT,
  scraped_at TIMESTAMP DEFAULT now(),
  UNIQUE(track_name, race_date, race_number)
);

CREATE TABLE IF NOT EXISTS horses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  race_card_id UUID NOT NULL REFERENCES race_cards(id) ON DELETE CASCADE,
  program_number INTEGER NOT NULL,
  horse_name TEXT NOT NULL,
  jockey_name TEXT,
  trainer_name TEXT,
  post_position INTEGER,
  morning_line TEXT,
  win_odds DECIMAL(10, 2),
  place_odds DECIMAL(10, 2),
  show_odds DECIMAL(10, 2),
  weight INTEGER,
  age INTEGER,
  recent_form TEXT,
  last_race_date DATE,
  last_race_result TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS betting_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  race_card_id UUID NOT NULL REFERENCES race_cards(id) ON DELETE CASCADE,
  pool_type TEXT NOT NULL,
  total_pool DECIMAL(15, 2),
  pool_count INTEGER,
  updated_at TIMESTAMP DEFAULT now(),
  captured_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scraper_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  status TEXT NOT NULL,
  races_scraped INTEGER,
  horses_scraped INTEGER,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  duration_ms INTEGER
);

ALTER TABLE race_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read race cards"
  ON race_cards FOR SELECT USING (true);

CREATE POLICY "Users can read horses"
  ON horses FOR SELECT USING (true);

CREATE POLICY "Users can read betting pools"
  ON betting_pools FOR SELECT USING (true);
```

### 4. Deploy Edge Functions (1 min)

Using **Supabase CLI**:

```bash
# Login to Supabase
supabase login

# Deploy the functions
supabase functions deploy scrape-with-gemini --no-verify-jwt
supabase functions deploy save-scraped-data --no-verify-jwt
```

### 5. Use the Scraper! (Done! 🎉)

Visit: **`/scraper-dashboard`** (admin only)

Or add to any page:

```typescript
import GeminiScraperPanel from '@/components/GeminiScraperPanel';
import ScrapedRacesDisplay from '@/components/ScrapedRacesDisplay';

export default function MyPage() {
  return (
    <>
      <GeminiScraperPanel />
      <ScrapedRacesDisplay />
    </>
  );
}
```

## Test It

1. Open the scraper panel
2. Paste an Off-Track Betting URL:
   ```
   https://www.offtrackbetting.com/#/lobby/live-racing
   ```
3. Click **"🚀 Scrape Race Data"**
4. Watch the data get extracted and saved!

## Example URLs to Test

- `https://www.offtrackbetting.com/`
- `https://www.offtrackbetting.com/#/lobby/live-racing`
- `https://www.offtrackbetting.com/#/lobby/live-racing?programName=belmont-park`
- `https://www.offtrackbetting.com/#/lobby/live-racing?programName=churchill-downs`

## What Gets Extracted

✅ Race information (date, time, distance, surface)
✅ Horse names and details (jockey, trainer, weight)
✅ Betting odds (ML odds, current odds)
✅ Betting pools (Win, Place, Show, Exacta, etc.)
✅ Track and race conditions

## Troubleshooting

**"API key not configured"**
→ Check your `GEMINI_API_KEY` in .env or Supabase secrets

**"Unauthorized" error**
→ Make sure you're logged in to RaceWiseAI

**"No data extracted"**
→ Try a different URL or check the page structure

**Rate limit hit**
→ Wait a few seconds before scraping again

## Data Flow

```
Off-Track Betting Website
         ↓
   (Gemini AI extracts data)
         ↓
   JSON with race/horse info
         ↓
   (Saved to Supabase)
         ↓
   Displayed in dashboard
         ↓
   Ready for analysis!
```

## Cost

- **Gemini API**: $0-5/month (free for moderate use)
- **Supabase**: $0-50/month (free tier available)
- **Total**: Usually $0-10/month

## Next Steps

1. ✅ Set up scheduled scraping (see `SCRAPER_SETUP.md`)
2. ✅ Integrate with your ML models
3. ✅ Create alerts for sharp movements
4. ✅ Build custom analysis dashboards

## Full Documentation

See [`SCRAPER_SETUP.md`](./SCRAPER_SETUP.md) for complete setup, troubleshooting, and advanced usage.

---

**Questions?** Check the documentation or open an issue on GitHub.
