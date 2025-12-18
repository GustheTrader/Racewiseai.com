# Gemini 3.0 Flash Web Scraper Setup Guide

This guide walks you through setting up the AI-powered web scraper that uses Google's Gemini 2.0 Flash model to extract race data from Off-Track Betting websites.

## Overview

The scraper system has three main components:

1. **Scraper Edge Function** (`scrape-with-gemini`) - Uses Gemini to extract data from HTML
2. **Data Storage Function** (`save-scraped-data`) - Saves extracted data to Supabase
3. **Dashboard UI** - Components to trigger scraping and view results

## Prerequisites

- Supabase account and project set up
- Google Gemini API key (from Google AI Studio)
- Your RaceWiseAI application running locally or deployed

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key for your project
4. Save this key - you'll need it in the next step

⚠️ **Security Note**: Never commit API keys to version control!

## Step 2: Configure Environment Variables

### Local Development

Add to your `.env` file:

```bash
# Gemini API Key (required for scraping)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase credentials (already configured)
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_SUPABASE_URL=https://your_project.supabase.co
```

### Production (Supabase)

1. Go to your **Supabase Dashboard**
2. Navigate to **Settings → Edge Functions → Secrets**
3. Add a new secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key

## Step 3: Set Up Database Schema

Run the migration to create the necessary tables:

```bash
# Use Supabase CLI
supabase migration up

# Or manually run the SQL in Supabase SQL Editor:
# File: supabase/migrations/20251218_create_race_scraping_schema.sql
```

This creates:
- `race_cards` - Main race data
- `horses` - Individual horse information
- `betting_pools` - Betting pool data
- `scraper_jobs` - Scraper execution logs

## Step 4: Deploy Edge Functions

### Option A: Using Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Deploy edge functions
supabase functions deploy scrape-with-gemini --no-verify-jwt
supabase functions deploy save-scraped-data --no-verify-jwt
```

### Option B: Using Supabase Dashboard

1. Go to **Functions** in your Supabase Dashboard
2. Click **"Create a new function"**
3. Choose the function name and deployment type
4. Paste the code from the corresponding TypeScript file

**Function Details:**

- **scrape-with-gemini**: Extracts race data from Off-Track Betting pages using Gemini
- **save-scraped-data**: Saves extracted data to Supabase database

## Step 5: Add Components to Dashboard

### Import Components

```typescript
// In your dashboard page or component
import GeminiScraperPanel from '@/components/GeminiScraperPanel';
import ScrapedRacesDisplay from '@/components/ScrapedRacesDisplay';
```

### Add to Dashboard Layout

```typescript
export default function DataDashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Scraper Panel - Left Column */}
      <div>
        <GeminiScraperPanel />
      </div>

      {/* Races Display - Right Column */}
      <div>
        <ScrapedRacesDisplay />
      </div>
    </div>
  );
}
```

## Step 6: Testing the Scraper

### Test URL Examples

Use these Off-Track Betting URLs to test:

```
https://www.offtrackbetting.com/races
https://www.offtrackbetting.com/races/belmont-park
https://www.offtrackbetting.com/#/lobby/live-racing
```

### Manual Testing Steps

1. Open your dashboard
2. Scroll to the "Gemini Powered Scraper" panel
3. Enter an Off-Track Betting URL
4. Click "🚀 Scrape Race Data"
5. Wait for the scraper to complete
6. View the extracted data in the preview
7. Check the "Scraped Races Database" section to see saved data

### Expected Output

```json
{
  "track_name": "Belmont Park",
  "race_date": "2024-12-18",
  "race_number": 5,
  "race_time": "14:30",
  "post_time": "14:45",
  "distance": "1 1/16 miles",
  "surface": "Dirt",
  "conditions": "Fast",
  "horses": [
    {
      "program_number": 1,
      "horse_name": "Speed Racer",
      "jockey_name": "John Smith",
      "trainer_name": "Jane Doe",
      "post_position": 3,
      "morning_line": "5-2",
      "weight": 122,
      "age": 4
    }
  ],
  "betting_pools": [
    {
      "pool_type": "WIN",
      "total_pool": 150000
    }
  ]
}
```

## Step 7: Scheduled Scraping (Optional)

To automatically scrape data at regular intervals:

### Option A: Supabase Cron Jobs

Create a new edge function that triggers the scraper:

```typescript
// supabase/functions/daily-scraper/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Trigger scraping for multiple tracks
  const tracks = [
    'https://www.offtrackbetting.com/#/lobby/live-racing?programName=belmont-park',
    'https://www.offtrackbetting.com/#/lobby/live-racing?programName=churchill-downs',
  ];

  for (const url of tracks) {
    await fetch('https://your-project.supabase.co/functions/v1/scrape-with-gemini', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

Deploy with Cron:

```bash
supabase functions deploy daily-scraper --no-verify-jwt
# Then configure the cron schedule in Supabase Dashboard
```

### Option B: External Service

Use a service like:
- **GitHub Actions** - Free, runs on schedule
- **n8n** - Visual workflow automation
- **Make** (Integromat) - No-code automation
- **AWS Lambda** - Serverless execution

Example GitHub Action:

```yaml
name: Daily Race Scraper
on:
  schedule:
    - cron: '0 8 * * *'  # Run daily at 8 AM

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Scrape races
        run: |
          curl -X POST https://your-project.supabase.co/functions/v1/scrape-with-gemini \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"url":"https://www.offtrackbetting.com/#/lobby/live-racing"}'
```

## Troubleshooting

### Issue: "Gemini API key not configured"

**Solution**: Make sure your `GEMINI_API_KEY` environment variable is set in Supabase edge function secrets.

### Issue: "Failed to fetch page"

**Solution**:
- Check if the URL is accessible and valid
- Off-Track Betting might be blocking the request
- Try a different race page URL

### Issue: "Unauthorized" error

**Solution**:
- Make sure you're logged in to your RaceWiseAI account
- Check that your session is still valid
- Try logging out and back in

### Issue: Data not being saved

**Solution**:
- Check Supabase database connection
- Verify that the `race_cards` table exists
- Check edge function logs for errors

### Issue: Poor data extraction

**Solution**:
- Gemini works best with clean, structured HTML
- If the webpage has heavy JavaScript, consider waiting for page load
- Try a different race page URL

## Performance Optimization

### Rate Limiting

To avoid hitting API limits:

```typescript
// Add delays between requests
await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
```

### Batch Scraping

For multiple races:

```typescript
const urls = [
  'https://www.offtrackbetting.com/...',
  'https://www.offtrackbetting.com/...',
];

for (const url of urls) {
  await scrapeUrl(url);
  await delay(5000); // Respect rate limits
}
```

## API Rate Limits

**Gemini 2.0 Flash**:
- Free tier: 1,500 requests per minute
- Paid: Up to 10,000 requests per minute

**Supabase**:
- Database: Standard limits (see docs)
- Edge Functions: 60 concurrent connections

## Security Best Practices

1. ✅ Store API keys in environment variables
2. ✅ Use HTTPS only in production
3. ✅ Validate all input URLs
4. ✅ Sanitize extracted data
5. ✅ Implement rate limiting
6. ✅ Monitor scraper job logs
7. ✅ Use RLS policies for database access
8. ✅ Rotate API keys regularly

## Monitoring & Logging

Check scraper job logs:

```sql
-- View recent scraper jobs
SELECT * FROM scraper_jobs
ORDER BY started_at DESC
LIMIT 20;

-- View failed jobs
SELECT * FROM scraper_jobs
WHERE status = 'FAILED'
ORDER BY started_at DESC;

-- Get statistics
SELECT
  status,
  COUNT(*) as count,
  AVG(duration_ms) as avg_duration
FROM scraper_jobs
GROUP BY status;
```

## Advanced Usage

### Custom Data Processing

Modify the `save-scraped-data` function to:
- Calculate odds movements
- Identify sharp money movements
- Generate alerts on specific conditions
- Update ML models with live data

### Integration with ML Models

```typescript
// After saving data, trigger your ML analysis
const { data: raceCard } = await supabase
  .from('race_cards')
  .select()
  .eq('id', savedRaceId)
  .single();

// Send to your ML model
await fetch('https://your-ml-api.com/predict', {
  method: 'POST',
  body: JSON.stringify(raceCard),
});
```

## Cost Estimation

**Monthly costs** (approximate):

- **Gemini API**: $1-5 (depending on request volume)
- **Supabase**: $25-50 (free tier: $0)
- **Edge Functions**: $2-10 per 1M invocations
- **Total**: ~$30-65/month for moderate usage

## Support & Resources

- [Gemini API Docs](https://ai.google.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [GitHub Issues](https://github.com/GustheTrader/Racewiseai.com/issues)

---

**Last Updated**: December 18, 2024
**Version**: 1.0.0
