# RaceWise AI - Complete Data Workflow Guide

## Overview

This document outlines the complete data workflow from morning card scraping through live race data and race result collection.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                    MORNING WORKFLOW (Pre-Race)                        │
└──────────────────────────────────────────────────────────────────────┘

1. SCRAPE MORNING CARDS (6-9 AM)
   ├─ Source: OTB Website / Racing Digest PDFs
   ├─ Extractor: Gemini API 2.0 Flash
   ├─ Data: Track, race number, horses, jockey, trainer, morning line
   └─ Output: Stored in race_cards & horses tables

2. HANDICAPPING ANALYSIS
   ├─ Input: Raw horse data
   ├─ Process: Ensemble model calculation
   │  ├─ Fire Speed Figures (20%)
   │  ├─ CatBoost Component (15.4%)
   │  ├─ LightGBM Component (11%)
   │  ├─ Jockey Win Power (12%)
   │  ├─ Trainer Win Power (12%)
   │  ├─ HC 20 Longshot Logic (12%)
   │  ├─ Consensus Rating (6.6%)
   │  ├─ RNN Sequence (6.6%)
   │  └─ XGBoost Factor (4.4%)
   └─ Output: model_score, win_probability, model_odds

3. DASHBOARD PREVIEW
   ├─ Display: Morning odds, rankings, predictions
   ├─ Export: CSV / XML reports
   └─ Betting: Prepare exotic bet slips

┌──────────────────────────────────────────────────────────────────────┐
│                    LIVE WORKFLOW (Race Time)                          │
└──────────────────────────────────────────────────────────────────────┘

4. LIVE ODDS TRACKING (During Racing Hours)
   ├─ Job Type: "odds"
   ├─ Frequency: Every 30-60 seconds (configurable)
   ├─ Source: OTB Live Odds
   ├─ Data: Current win/place/show odds per horse
   └─ Storage: odds_data table (snapshot history)

5. EXOTIC WILL-PAYS COLLECTION
   ├─ Job Type: "will_pays"
   ├─ Frequency: Every 2-5 minutes
   ├─ Data: Exacta, Trifecta, Superfecta payouts
   ├─ Carryover: Tracked separately
   └─ Storage: exotic_will_pays table

6. REAL-TIME DASHBOARD
   ├─ Updates: Every 30 seconds
   ├─ Displays: Live odds changes, will-pays
   ├─ Alerts: Sharp money movement detection
   └─ Recommendations: AI-powered betting suggestions

┌──────────────────────────────────────────────────────────────────────┐
│                    RESULTS WORKFLOW (Post-Race)                       │
└──────────────────────────────────────────────────────────────────────┘

7. COLLECT RACE RESULTS (After Each Race)
   ├─ Job Type: "results"
   ├─ Trigger: Automatic when race ends
   ├─ Source: OTB Results Page
   ├─ Data:
   │  ├─ Winning horse & odds
   │  ├─ Place/Show winners
   │  ├─ Exotic payouts (exacta, trifecta, superfecta)
   │  ├─ Pool totals
   │  └─ Race conditions
   └─ Storage: race_results table

8. RESULTS ANALYSIS
   ├─ Model Validation: Compare predictions vs. actual results
   ├─ Performance Metrics: Win rate, ROI by track/race type
   ├─ Feedback Loop: Improve model weights based on results
   └─ Historical Archive: Full race history for analysis

9. DASHBOARD RESULTS VIEW
   ├─ Summary: Winners, payouts, pool analysis
   ├─ Details: Win/Place/Show results per race
   ├─ Payouts: Exotic payout breakdown
   └─ Carryover: Track carryover pools for next racing day

## Job Scheduling & Timing

### Job Types

| Job Type | Frequency | Data Collected | Start Time |
|----------|-----------|-----------------|-----------|
| `entries` | 9-11 AM | Morning card entries | Before racing |
| `odds` | Every 30-60s | Current odds updates | Race time to post |
| `will_pays` | Every 2-5 min | Exotic payouts | Race time to post |
| `results` | After each race | Final race results | Post-race |

### Track Racing Schedule

```typescript
TRACK_SCHEDULE = {
  "CHURCHILL DOWNS": ["Thursday", "Friday", "Saturday", "Sunday"],
  "BELMONT PARK": ["Thursday", "Friday", "Saturday", "Sunday"],
  "AQUEDUCT": ["Friday", "Saturday", "Sunday"],
  "GULFSTREAM": ["Thursday", "Friday", "Saturday", "Sunday"],
  "DEL MAR": ["Friday", "Saturday", "Sunday"],
  "KEENELAND": ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "KENTUCKY DOWNS": ["Saturday", "Sunday"],
  "OAKLAWN PARK": ["Friday", "Saturday", "Sunday"],
  "PIMLICO": ["Friday", "Saturday", "Sunday"],
  "LOS ALAMITOS-DAY": ["Saturday", "Sunday"],
  "LOS ALAMITOS-NIGHT": ["Friday", "Saturday"],
  "SARATOGA": ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "SANTA ANITA": ["Friday", "Saturday", "Sunday"]
};
```

## Database Tables

### race_cards
Stores master race information
```sql
- id (UUID)
- track_name (string)
- race_date (date)
- race_number (int)
- race_time, post_time (time)
- race_type, distance, surface, conditions (string)
- purse (string)
- scraped_at (timestamp)
```

### horses
Stores horse entry data
```sql
- id (UUID)
- race_card_id (FK → race_cards)
- program_number (int)
- horse_name (string)
- jockey_name, trainer_name (string)
- weight (int)
- morning_line (string)
- post_position (int)
```

### betting_pools
Stores pool information
```sql
- id (UUID)
- race_card_id (FK → race_cards)
- pool_type (enum: WIN, PLACE, SHOW, EXACTA, TRIFECTA, SUPERFECTA)
- total_pool (decimal)
- pool_count (int)
- captured_at (timestamp)
```

### odds_data
Stores odds snapshots (historical tracking)
```sql
- id (UUID)
- track_name, race_number, race_date (composite key)
- horse_number, horse_name (string)
- win_odds, place_odds, show_odds (decimal)
- pool_data (JSON)
- scraped_at (timestamp)
```

### exotic_will_pays
Stores exotic payout information
```sql
- id (UUID)
- track_name, race_number, race_date (composite key)
- wager_type (enum: EXACTA, TRIFECTA, SUPERFECTA)
- combination (string - e.g., "2-4")
- payout (decimal)
- is_carryover (bool)
- carryover_amount (decimal)
- scraped_at (timestamp)
```

### race_results
Stores final race results
```sql
- id (UUID)
- track_name, race_number, race_date (composite key)
- results_data (JSON) - Flexible structure containing:
  - winning_horse, winning_program, winning_odds
  - place_horse, place_odds
  - show_horse, show_odds
  - exacta/trifecta/superfecta payouts
  - pool_totals, carryover
- source_url (string)
- created_at, updated_at (timestamp)
```

### scrape_jobs
Configuration for automated jobs
```sql
- id (UUID)
- url (string)
- track_name (string)
- job_type (enum: odds, will_pays, results, entries)
- interval_seconds (int: 30, 60, 120, 300, 600, 1800, 3600)
- is_active (bool)
- status (enum: pending, running, completed, failed)
- next_run_at (timestamp) - CRITICAL for scheduling
- last_run_at (timestamp)
- retry_count (int)
- max_retries (int, default 3)
- error_message (string)
- created_at, updated_at (timestamp)
```

## Job Execution Flow

### Background Job Runner

The `run-scrape-jobs` edge function is the orchestrator:

```typescript
1. Query `scrape_jobs` where:
   - is_active = true
   - next_run_at <= NOW()

2. For each pending job:
   a. Update status to "running"
   b. Call appropriate scraper based on job_type
   c. Wait for completion
   d. Update next_run_at = NOW() + interval_seconds
   e. Reset retry_count on success

3. On failure:
   a. If retry_count < max_retries:
      - Schedule retry with exponential backoff
      - backoff = 2^retry_count * 60 seconds
   b. Else:
      - Mark job as "failed"
      - Log error message

4. Return execution summary
```

### Retry Logic

Failed jobs are automatically retried with exponential backoff:

```
Retry 1: 1 minute later (2^0 * 60)
Retry 2: 2 minutes later (2^1 * 60)
Retry 3: 4 minutes later (2^2 * 60)
After 3 retries: Job marked as failed, manual intervention required
```

## Environment Variables Required

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Gemini AI (for scraping)
GEMINI_API_KEY=your-gemini-api-key

# OTB Login (if needed)
OTB_USERNAME=your-username
OTB_PASSWORD=your-password
```

## Cron Job Configuration

### Option 1: Supabase pg_cron (Recommended)

Install and enable pg_cron in Supabase:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Run background job scheduler every minute
SELECT cron.schedule('run-scrape-jobs-every-minute', '* * * * *',
  'SELECT net.http_post(
    url := current_setting(''app.settings.supabase_url'') || ''/functions/v1/run-scrape-jobs'',
    headers := jsonb_build_object(
      ''Authorization'', ''Bearer '' || current_setting(''app.settings.supabase_key''),
      ''Content-Type'', ''application/json''
    ),
    body := ''{}''::jsonb
  )'
);

-- Run every 5 minutes (adjust frequency as needed)
SELECT cron.schedule('run-scrape-jobs-every-5-min', '*/5 * * * *',
  'SELECT net.http_post(...)'
);
```

### Option 2: External Scheduler (e.g., node-cron, Apache Airflow)

```typescript
// Using node-cron
import cron from 'node-cron';

// Run background job scheduler every minute
cron.schedule('* * * * *', async () => {
  await fetch(`${SUPABASE_URL}/functions/v1/run-scrape-jobs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
});
```

### Option 3: GitHub Actions Workflow

```yaml
name: Scrape Jobs Scheduler
on:
  schedule:
    - cron: '* * * * *'  # Every minute
    - cron: '*/5 * * * *' # Every 5 minutes

jobs:
  run-scraper:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scrape jobs
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_KEY }}" \
            -H "Content-Type: application/json" \
            "${{ secrets.SUPABASE_URL }}/functions/v1/run-scrape-jobs"
```

## API Endpoints

### Run Scrape Jobs
```
POST /functions/v1/run-scrape-jobs
Authorization: Bearer <ANON_KEY>
Content-Type: application/json

Body: {
  "force_run": false  // Optional: true to run all jobs regardless of next_run_at
}

Response: {
  "status": "ok",
  "jobs_executed": 5,
  "success_count": 5,
  "failed_count": 0,
  "results": [
    {
      "job_id": "uuid",
      "status": "success|failed|skipped",
      "duration_ms": 1234,
      "records_scraped": 12,
      "timestamp": "2024-01-02T10:30:00Z"
    }
  ]
}
```

### Scrape Race Results
```
POST /functions/v1/scrape-race-results
Authorization: Bearer <ANON_KEY>
Content-Type: application/json

Body: {
  "url": "https://app.offtrackbetting.com/...",
  "track_name": "CHURCHILL DOWNS"
}

Response: {
  "status": "ok",
  "records_scraped": 8,
  "results": [...]
}
```

## Dashboard Usage

### Data Scraper Tab
- **Purpose**: View current scraping jobs and status
- **Actions**:
  - Create new scraping jobs
  - Run jobs manually
  - Toggle job active/inactive
  - Monitor real-time status

### Data Toolbox Tab
- **Purpose**: Parse and process race cards
- **Features**:
  - Upload morning cards / racing digests
  - Handicapping analysis with ensemble model
  - Export CSV/XML reports
  - View rankings and race details

### Race Results Tab
- **Purpose**: View and analyze completed race results
- **Features**:
  - Filter by date and track
  - Summary statistics (total races, pools, payouts)
  - Detailed race results with odds
  - Payout breakdown (win/place/show/exotic)
  - Pool analysis and carryover tracking

## Monitoring & Troubleshooting

### Check Job Status
```sql
SELECT id, track_name, job_type, status, next_run_at, last_run_at, error_message
FROM scrape_jobs
WHERE is_active = true
ORDER BY next_run_at;
```

### View Recent Scraping Audit
```sql
SELECT track_name, race_date, status, races_scraped, horses_scraped, duration_ms, error_message
FROM scraper_jobs
ORDER BY created_at DESC
LIMIT 20;
```

### Monitor Job Execution Logs
Check Supabase function logs in the dashboard or via the Supabase CLI:
```bash
supabase functions logs run-scrape-jobs
```

## Performance Optimization

1. **Use Composite Indexes**:
   ```sql
   CREATE INDEX idx_scrape_jobs_schedule ON scrape_jobs(is_active, next_run_at);
   CREATE INDEX idx_odds_data_lookup ON odds_data(track_name, race_date, horse_number);
   CREATE INDEX idx_race_results_lookup ON race_results(track_name, race_date);
   ```

2. **Archive Old Data**:
   - Move race results older than 90 days to archive table
   - Delete odds_data snapshots older than 30 days
   - Reduces query time on active tables

3. **Connection Pooling**:
   - Configure Supabase connection pool
   - Set appropriate pool size based on concurrent jobs

4. **Batch Requests**:
   - Group multiple horses into single database transaction
   - Reduce network round-trips

## Future Enhancements

1. **Real-time WebSocket Updates**
   - Push live odds to frontend via WebSocket
   - Replace 30-second polling with real-time events

2. **Model Retraining Pipeline**
   - Automated model retraining based on race results
   - A/B testing for ensemble weights

3. **Exotic Bet Optimization**
   - AI-powered exotic bet construction
   - Payout projection based on pool movements

4. **Multi-Source Integration**
   - Track API integrations (equinix, TRD)
   - Alternative odds sources for arbitrage detection

5. **Mobile App**
   - Native iOS/Android app
   - Push notifications for sharp money movement
   - One-tap bet placement
