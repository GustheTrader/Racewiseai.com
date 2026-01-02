# Cron Job Configuration for Morning Report

## Overview

The morning report workflow generates daily reports at 8 AM PST identifying which racing tracks are running and automatically creating scraping jobs for each track.

## Edge Function: `morning-report`

**Location**: `/supabase/functions/morning-report/index.ts`

**Trigger**: Daily at 8 AM PST (Pacific Standard Time)

**Responsibilities**:
1. Identifies which tracks are running today based on `TRACK_SCHEDULE`
2. Creates morning scraping jobs (`entries` type) for each running track
3. Stores report in `admin_reports` table
4. Returns summary with tracks running and jobs created count

## Track Schedule

The following tracks are configured in the morning report:

```
CHURCHILL DOWNS     - Thu, Fri, Sat, Sun
BELMONT PARK        - Thu, Fri, Sat, Sun
AQUEDUCT            - Fri, Sat, Sun
GULFSTREAM          - Thu, Fri, Sat, Sun
DEL MAR             - Fri, Sat, Sun
KEENELAND           - Wed, Thu, Fri, Sat, Sun
KENTUCKY DOWNS      - Sat, Sun
OAKLAWN PARK        - Fri, Sat, Sun
PIMLICO             - Fri, Sat, Sun
LOS ALAMITOS-DAY    - Sat, Sun
LOS ALAMITOS-NIGHT  - Fri, Sat
SARATOGA            - Wed, Thu, Fri, Sat, Sun
SANTA ANITA         - Fri, Sat, Sun
```

## Setup Instructions

### Option 1: Using GitHub Actions (Recommended)

Create `.github/workflows/morning-report.yml`:

```yaml
name: Morning Report - 8 AM PST

on:
  schedule:
    # 8 AM PST = 4 PM UTC (during PST)
    # 8 AM PDT = 3 PM UTC (during PDT)
    - cron: '0 16 * * *'  # 4 PM UTC (8 AM PST)

jobs:
  morning-report:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Morning Report
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "x-cron-job: true" \
            -H "x-cron-signature: ${{ secrets.CRON_JOB_SECRET }}" \
            -H "Content-Type: application/json" \
            https://app.racewiseai.com/functions/v1/morning-report
```

### Option 2: Using Supabase pg_cron

If using Supabase with pg_cron enabled:

```sql
-- Create cron job to call the morning report edge function every day at 8 AM PST
SELECT cron.schedule(
  'daily-morning-report',
  '0 8 * * *',  -- Every day at 8 AM (in database timezone)
  $$
  SELECT
    net.http_post(
      url:='https://app.racewiseai.com/functions/v1/morning-report',
      headers:=jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_key'),
        'x-cron-job', 'true',
        'x-cron-signature', current_setting('app.cron_secret'),
        'Content-Type', 'application/json'
      ),
      body:='{}'::jsonb
    );
  $$
);
```

### Option 3: Using External Service (EasyCron, cron-job.org, etc.)

1. Sign up for a free cron service like [cron-job.org](https://cron-job.org)
2. Create a new cron job with:
   - **URL**: `https://app.racewiseai.com/functions/v1/morning-report`
   - **Method**: POST
   - **Headers**:
     ```
     Authorization: Bearer <YOUR_SUPABASE_ANON_KEY>
     x-cron-job: true
     x-cron-signature: <YOUR_CRON_JOB_SECRET>
     Content-Type: application/json
     ```
   - **Body**: `{}`
   - **Schedule**: Daily at 8 AM PST (adjust for your timezone)

## Environment Variables Required

In Supabase Edge Function settings, ensure these variables are configured:

```
SUPABASE_URL           - Your Supabase project URL
SUPABASE_ANON_KEY      - Anonymous key for Supabase access
CRON_JOB_SECRET        - Secret key for cron signature verification
```

## Testing the Morning Report

### Manual Test via cURL

```bash
# Test without signature (will fail)
curl -X POST https://app.racewiseai.com/functions/v1/morning-report

# Test with proper auth
curl -X POST \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  https://app.racewiseai.com/functions/v1/morning-report
```

### Test Within Valid Time Window

The function only executes between 8 AM and 9 AM PST. Outside this window, it returns:

```json
{
  "status": "skipped",
  "reason": "Outside of 8 AM PST execution window",
  "currentHourPST": 14
}
```

To test outside this window, temporarily modify the time check in the edge function.

### Check Reports in Database

```sql
-- View all morning reports
SELECT * FROM admin_reports
WHERE report_type = 'morning_report'
ORDER BY report_date DESC;

-- Check today's report
SELECT content, tracks_running, jobs_created
FROM admin_reports
WHERE report_type = 'morning_report'
AND report_date = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 1;
```

## Monitoring

### Check Edge Function Logs

```bash
supabase functions logs morning-report --level info
```

### Set Up Alerts

Monitor these events in Supabase:

1. **Failed Executions**: Check function logs for errors
2. **Job Creation Failures**: Monitor `scrape_jobs` table for missing entries
3. **Report Storage Failures**: Check `admin_reports` table for gaps in dates

### Example Monitoring Query

```sql
-- Alert if no report generated today
SELECT
  CURRENT_DATE as expected_date,
  MAX(report_date) as last_report_date,
  CASE
    WHEN MAX(report_date) < CURRENT_DATE THEN 'ALERT: Missing today report'
    ELSE 'OK'
  END as status
FROM admin_reports
WHERE report_type = 'morning_report';
```

## Timezone Handling

The morning report uses PST (Pacific Standard Time) for execution:

```typescript
const pstTime = new Date(
  now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
);
const hourPST = pstTime.getHours();

// Only execute between 8 AM and 9 AM PST
if (hourPST < 8 || hourPST >= 9) {
  return { status: "skipped", reason: "Outside of 8 AM PST execution window" };
}
```

**Important**: This automatically handles DST transitions. During PDT (Pacific Daylight Time), the function still runs at 8 AM local time.

## Troubleshooting

### Issue: Function returns 403 Unauthorized

**Cause**: Invalid CRON_JOB_SECRET

**Fix**: Ensure the secret matches in both the cron scheduler and Supabase environment variables.

### Issue: Function returns 401 Unauthorized

**Cause**: Missing or invalid Bearer token

**Fix**: Ensure `SUPABASE_ANON_KEY` is properly set in the cron scheduler headers.

### Issue: No jobs created even though function succeeds

**Cause**: No tracks scheduled for that day of the week, or database inserts failing

**Fix**:
1. Check the day of week matches `TRACK_SCHEDULE`
2. Verify `scrape_jobs` table has write permissions
3. Check for duplicate job constraints

### Issue: Wrong time execution

**Cause**: Timezone conversion issues

**Fix**: The function correctly uses `America/Los_Angeles` timezone. If still wrong:
1. Check server timezone settings
2. Verify cron scheduler is sending requests at correct UTC time
3. Add logging to check `pstTime.toISOString()` output

## Performance Metrics

Expected execution time: **2-5 seconds**

The function should:
1. Check 13 tracks against schedule
2. Query for existing jobs (typically 5-13 lookups)
3. Create new jobs (typically 0-13 inserts)
4. Store report in database
5. Return summary

Monitor query performance if executions exceed 10 seconds.

## Future Enhancements

1. **Configurable Track Schedule**: Move `TRACK_SCHEDULE` to database for dynamic updates
2. **Email Notifications**: Send daily report to admin users
3. **Parallel Job Creation**: Use Promise.all() for faster job creation
4. **Historical Reports**: Archive old reports for trend analysis
5. **Escalation Jobs**: Create additional job types (live-odds, results) based on race times
