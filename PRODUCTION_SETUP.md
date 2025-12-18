# Production Gemini Scraper Setup Guide

Complete production deployment checklist with secure API management.

## 📋 Pre-Flight Checklist

- [ ] Supabase project created and accessible
- [ ] Admin access to Supabase dashboard
- [ ] Google account for Gemini API
- [ ] Local environment configured
- [ ] Git ready for deployment

---

## **Phase 1: Secure Gemini API Key Setup (5 min)**

### Step 1.1: Create Gemini API Key

```bash
# Go to Google AI Studio
https://aistudio.google.com/app/apikey

# Steps:
1. Click "Get API Key"
2. Click "Create API Key in new project"
3. Copy the generated key
4. Store it securely (we'll use it next)

# Save it temporarily:
GEMINI_API_KEY=your_api_key_here_copy_this
```

### Step 1.2: Understand API Key Security

**NEVER commit API keys to git!**

We'll store it in:
- ✅ Supabase Secrets (for edge functions)
- ✅ Local .env file (for development)
- ✅ Environment variables (for deployment)

---

## **Phase 2: Supabase Configuration (10 min)**

### Step 2.1: Add API Key to Supabase Secrets

```bash
# Login to Supabase Dashboard
https://supabase.com/dashboard

# Navigate to:
Your Project → Settings → Edge Functions → Secrets

# Click "New secret"
Name: GEMINI_API_KEY
Value: (paste your API key here)
Click "Add secret"
```

**Verification:**
```bash
# List secrets (CLI)
supabase secrets list

# Should show:
GEMINI_API_KEY    (appears as hidden for security)
```

### Step 2.2: Configure Project Environment

Create `.env.production` file:

```bash
# Supabase Production
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=https://your_project_id.supabase.co

# Gemini (store in Supabase secrets, NOT here!)
# GEMINI_API_KEY is configured in Supabase Edge Function Secrets

# Admin Configuration
VITE_ADMIN_EMAILS=your_admin_email@example.com

# API Configuration
VITE_API_BASE_URL=https://your_project_id.supabase.co

# Feature Flags
VITE_ENABLE_ANALYTICS=true
```

### Step 2.3: Verify Supabase Connection

```bash
# Test Supabase connection
supabase status

# You should see:
✓ Connected to project: your_project_id
✓ API URL: https://your_project_id.supabase.co
✓ Database: Connected
✓ Auth: Enabled
✓ Storage: Enabled
```

---

## **Phase 3: Deploy Edge Functions (15 min)**

### Step 3.1: Install Supabase CLI

```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version
```

### Step 3.2: Login to Supabase

```bash
# Interactive login
supabase login

# You'll be prompted to:
1. Open browser (login to supabase.com)
2. Generate access token
3. Paste token in terminal

# Verify login
supabase projects list
```

### Step 3.3: Deploy Functions

Deploy the two edge functions one by one:

```bash
# 1. Deploy scraper function (fetches and extracts data)
supabase functions deploy scrape-with-gemini \
  --no-verify-jwt \
  --project-id your_project_id

# Expected output:
✓ Function deployed successfully
✓ Function URL: https://your_project_id.supabase.co/functions/v1/scrape-with-gemini

# 2. Deploy storage function (saves to database)
supabase functions deploy save-scraped-data \
  --no-verify-jwt \
  --project-id your_project_id

# Expected output:
✓ Function deployed successfully
✓ Function URL: https://your_project_id.supabase.co/functions/v1/save-scraped-data
```

### Step 3.4: Verify Functions Deployed

```bash
# List deployed functions
supabase functions list

# You should see:
✓ scrape-with-gemini
✓ save-scraped-data

# Check function status
curl -X GET \
  https://your_project_id.supabase.co/functions/v1/scrape-with-gemini \
  -H "Authorization: Bearer your_token"
```

---

## **Phase 4: Database Migration (5 min)**

### Step 4.1: Run Database Schema

```bash
# In Supabase Dashboard → SQL Editor

# Copy and paste the entire SQL from:
# File: supabase/migrations/20251218_create_race_scraping_schema.sql

# Then click "Run" to execute

# Verify tables created:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

# Should show:
- race_cards
- horses
- betting_pools
- scraper_jobs
```

### Step 4.2: Verify Schema

```sql
-- Check race_cards table
\d race_cards

-- Check constraints and indexes
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'race_cards';
```

---

## **Phase 5: Local Testing (10 min)**

### Step 5.1: Update Local Environment

Update `.env` file:

```bash
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_key
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_ADMIN_EMAILS=your_email@example.com
VITE_DEV_EMAIL=dev@example.com
VITE_DEV_PASSWORD=secure_dev_password_here
```

### Step 5.2: Start Development Server

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Navigate to:
http://localhost:5173/scraper-dashboard
```

### Step 5.3: Test Authentication

```bash
# Steps:
1. Go to http://localhost:5173/auth
2. Login with your email
3. Verify you can access /scraper-dashboard (admin only)
```

---

## **Phase 6: End-to-End Testing (15 min)**

### Test 1: Basic Scraping

```bash
# Steps:
1. Open http://localhost:5173/scraper-dashboard
2. Paste test URL:
   https://www.offtrackbetting.com/#/lobby/live-racing

3. Click "🚀 Scrape Race Data"

# Expected result:
✅ Preview data appears
✅ Shows track name, race number, horses
✅ Data saves to database

# Check database:
SELECT * FROM race_cards ORDER BY scraped_at DESC LIMIT 5;
```

### Test 2: Multiple Races

```bash
# Test different track URLs:
- https://www.offtrackbetting.com/#/lobby/live-racing?programName=belmont-park
- https://www.offtrackbetting.com/#/lobby/live-racing?programName=churchill-downs
- https://www.offtrackbetting.com/#/lobby/live-racing?programName=keeneland

# Verify all save successfully
SELECT COUNT(*) as total_races FROM race_cards;
SELECT COUNT(*) as total_horses FROM horses;
```

### Test 3: Data Integrity

```sql
-- Check data consistency
SELECT
  r.track_name,
  r.race_date,
  r.race_number,
  COUNT(h.id) as horse_count,
  COUNT(DISTINCT b.pool_type) as pool_types
FROM race_cards r
LEFT JOIN horses h ON r.id = h.race_card_id
LEFT JOIN betting_pools b ON r.id = b.race_card_id
GROUP BY r.id, r.track_name, r.race_date, r.race_number
ORDER BY r.scraped_at DESC;
```

### Test 4: Error Handling

```bash
# Test error scenarios:

# 1. Invalid URL
URL: https://invalid-domain.com/page
Expected: Error message "Only offtrackbetting.com URLs are allowed"

# 2. Invalid parameters
Missing URL field
Expected: Error message "URL is required"

# 3. Unauthorized access
Remove auth token
Expected: 401 Unauthorized error
```

---

## **Phase 7: Production Hardening (10 min)**

### Step 7.1: Enable RLS (Row Level Security)

```sql
-- Enable RLS on all tables
ALTER TABLE race_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_jobs ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Public can read race_cards"
  ON race_cards FOR SELECT
  USING (true);

CREATE POLICY "Public can read horses"
  ON horses FOR SELECT
  USING (true);

CREATE POLICY "Public can read betting_pools"
  ON betting_pools FOR SELECT
  USING (true);

-- Restrict scraper_jobs to admins
CREATE POLICY "Only admins read scraper_jobs"
  ON scraper_jobs FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### Step 7.2: Configure CORS

In Supabase Dashboard → Settings → CORS:

```
Allowed origins:
- http://localhost:5173 (development)
- http://localhost:3000 (alternative)
- https://racewiseai.com (production)
- https://www.racewiseai.com (with www)
- https://app.racewiseai.com (app subdomain)
```

### Step 7.3: Monitor Edge Functions

```bash
# View function logs
supabase functions logs scrape-with-gemini --project-id your_project_id

# View real-time logs
supabase functions logs scrape-with-gemini \
  --project-id your_project_id \
  --tail
```

---

## **Phase 8: Production Deployment (5 min)**

### Step 8.1: Build for Production

```bash
# Create production build
npm run build

# Verify build succeeded
ls -la dist/

# Test build locally
npm run preview
```

### Step 8.2: Deploy to Hosting

Choose one:

**Option A: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option C: GitHub Pages**
```bash
git add .
git commit -m "chore: production build"
git push origin main
# GitHub Actions will deploy automatically
```

### Step 8.3: Verify Production

```bash
# Test production URL
curl -X POST https://your_project_id.supabase.co/functions/v1/scrape-with-gemini \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.offtrackbetting.com/#/lobby/live-racing"}'

# Expected: JSON response with extracted data
```

---

## **Phase 9: Monitoring & Logging (Setup)**

### Step 9.1: Create Monitoring Dashboard

```sql
-- Create monitoring view
CREATE VIEW scraper_statistics AS
SELECT
  DATE_TRUNC('day', started_at) as date,
  status,
  COUNT(*) as job_count,
  AVG(duration_ms) as avg_duration_ms,
  SUM(races_scraped) as total_races,
  SUM(horses_scraped) as total_horses
FROM scraper_jobs
GROUP BY DATE_TRUNC('day', started_at), status
ORDER BY date DESC;

-- View stats
SELECT * FROM scraper_statistics;
```

### Step 9.2: Setup Alerts

In Supabase Dashboard → Database → Webhooks:

Create webhook for failed jobs:
```
Trigger: INSERT on scraper_jobs
Condition: status = 'FAILED'
Webhook URL: your-alert-service.com/webhook
```

---

## **Checklist: Production Deployment**

- [ ] Gemini API key created and secured
- [ ] API key added to Supabase secrets
- [ ] Edge functions deployed successfully
- [ ] Database schema created and verified
- [ ] RLS policies enabled
- [ ] CORS configured correctly
- [ ] Local testing passed all scenarios
- [ ] Production build created
- [ ] Application deployed to production
- [ ] Edge functions logs monitored
- [ ] Monitoring dashboard created
- [ ] Backup strategy configured

---

## **🚨 Security Checklist**

- [ ] API keys never committed to git
- [ ] Supabase JWT authentication enabled
- [ ] CORS restricted to known domains
- [ ] Database RLS policies enabled
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose internals
- [ ] Rate limiting implemented
- [ ] Secrets rotated regularly
- [ ] Access logs monitored
- [ ] Backup enabled in Supabase

---

## **📊 Production Performance Targets**

| Metric | Target | Expected |
|--------|--------|----------|
| Scrape Time | <15s | 5-10s |
| API Latency | <500ms | 100-200ms |
| Database Write | <1s | 200-500ms |
| Uptime | 99.9% | >99.9% |
| Cost/Month | <$50 | $5-15 |

---

## **🆘 Production Troubleshooting**

### Issue: Edge functions timeout

**Solution:**
```bash
# Increase timeout in function config
supabase functions deploy scrape-with-gemini \
  --timeout 60 \
  --no-verify-jwt
```

### Issue: API key fails

**Solution:**
```bash
# Verify secret exists
supabase secrets list

# Redeploy functions
supabase functions deploy scrape-with-gemini --no-verify-jwt
supabase functions deploy save-scraped-data --no-verify-jwt
```

### Issue: Database quota exceeded

**Solution:**
```sql
-- Archive old data
DELETE FROM race_cards WHERE scraped_at < NOW() - INTERVAL '90 days';

-- Check database size
SELECT
  sum(pg_total_relation_size(schemaname||'.'||tablename))::bigint / 1024 / 1024 as size_mb
FROM pg_tables;
```

---

## **📞 Support Resources**

- Supabase Docs: https://supabase.com/docs
- Edge Functions: https://supabase.com/docs/guides/functions
- Gemini API: https://ai.google.dev
- Community: https://github.com/GustheTrader/Racewiseai.com/discussions

---

**Production Setup Complete!** 🎉

Next: Setup automated scheduled scraping (optional)
