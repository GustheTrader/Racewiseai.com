# Production Setup - Command Reference

Copy-paste these commands in order. **Replace values in `{braces}`** with your actual values.

---

## 🔑 Step 1: Get Your Values

### 1.1: Gemini API Key
```bash
# Go to: https://aistudio.google.com/app/apikey
# Click "Get API Key"
# Copy and save it:

GEMINI_API_KEY=sk-proj-your_key_here
```

### 1.2: Supabase Project Details
```bash
# From Supabase Dashboard Settings

SUPABASE_PROJECT_ID=your_project_id_here
SUPABASE_URL=https://your_project_id.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_public_key_here
SUPABASE_ADMIN_EMAIL=your_email@example.com
```

---

## 🚀 Step 2: Install CLI Tools

```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version

# Install other dependencies
npm install

# Verify npm packages
npm list @supabase/supabase-js
```

---

## 🔐 Step 3: Supabase Authentication

```bash
# Login to Supabase (opens browser)
supabase login

# Verify login
supabase projects list

# Should show your project in the output
```

---

## 🔑 Step 4: Add API Key to Supabase

**Replace `{SUPABASE_PROJECT_ID}` with your actual project ID**

```bash
# Set the Gemini API key in Supabase secrets
supabase secrets set \
  GEMINI_API_KEY="{your_gemini_api_key_here}" \
  --project-id "{SUPABASE_PROJECT_ID}"

# Verify the secret was set
supabase secrets list --project-id "{SUPABASE_PROJECT_ID}"

# Output should show:
# GEMINI_API_KEY    ***hidden***
```

---

## 📦 Step 5: Deploy Edge Functions

**Replace `{SUPABASE_PROJECT_ID}` with your actual project ID**

```bash
# Deploy the first function (Gemini scraper)
supabase functions deploy scrape-with-gemini \
  --no-verify-jwt \
  --project-id "{SUPABASE_PROJECT_ID}"

# Deploy the second function (Data storage)
supabase functions deploy save-scraped-data \
  --no-verify-jwt \
  --project-id "{SUPABASE_PROJECT_ID}"

# Verify both functions deployed
supabase functions list --project-id "{SUPABASE_PROJECT_ID}"

# Output should show both functions with status "Ready"
```

---

## 📊 Step 6: Create Database Schema

**Copy entire SQL block and paste in Supabase SQL Editor**

Go to: `https://supabase.com/dashboard/project/{SUPABASE_PROJECT_ID}/sql/new`

```sql
-- Race cards table
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

-- Horses table
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

-- Betting pools table
CREATE TABLE IF NOT EXISTS betting_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  race_card_id UUID NOT NULL REFERENCES race_cards(id) ON DELETE CASCADE,
  pool_type TEXT NOT NULL,
  total_pool DECIMAL(15, 2),
  pool_count INTEGER,
  updated_at TIMESTAMP DEFAULT now(),
  captured_at TIMESTAMP DEFAULT now()
);

-- Scraper jobs table
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

-- Enable RLS
ALTER TABLE race_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_jobs ENABLE ROW LEVEL SECURITY;

-- Create read policies
CREATE POLICY "Public can read race_cards"
  ON race_cards FOR SELECT USING (true);

CREATE POLICY "Public can read horses"
  ON horses FOR SELECT USING (true);

CREATE POLICY "Public can read betting_pools"
  ON betting_pools FOR SELECT USING (true);

-- Create indexes
CREATE INDEX idx_race_cards_track_date ON race_cards(track_name, race_date);
CREATE INDEX idx_race_cards_scraped_at ON race_cards(scraped_at);
CREATE INDEX idx_horses_race_card_id ON horses(race_card_id);
```

**After pasting:**
1. Click "Run" to execute
2. You should see "Query OK"

---

## 🔧 Step 7: Update Local Environment

Edit `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID={SUPABASE_PROJECT_ID}
VITE_SUPABASE_PUBLISHABLE_KEY={SUPABASE_PUBLISHABLE_KEY}
VITE_SUPABASE_URL={SUPABASE_URL}

# Admin Configuration
VITE_ADMIN_EMAILS={SUPABASE_ADMIN_EMAIL}

# Do NOT add GEMINI_API_KEY here! It's in Supabase secrets.
```

---

## 🧪 Step 8: Local Testing

```bash
# Start development server
npm run dev

# In another terminal, navigate to:
# http://localhost:5173/scraper-dashboard

# Test with this URL:
https://www.offtrackbetting.com/#/lobby/live-racing

# Verify in database:
SELECT COUNT(*) as race_count FROM race_cards;
SELECT COUNT(*) as horse_count FROM horses;
```

---

## 📝 Step 9: Verify Everything

```bash
# Check function logs
supabase functions logs scrape-with-gemini \
  --project-id "{SUPABASE_PROJECT_ID}"

# Check database tables exist
# Go to: https://supabase.com/dashboard/project/{SUPABASE_PROJECT_ID}/editor
# You should see:
# - race_cards
# - horses
# - betting_pools
# - scraper_jobs

# Verify data was scraped
# Go to SQL Editor and run:
SELECT * FROM race_cards LIMIT 1;
SELECT * FROM horses LIMIT 5;
```

---

## 🏗️ Step 10: Build for Production

```bash
# Create production build
npm run build

# Verify build succeeded
ls -la dist/
du -sh dist/

# Test production build locally
npm run preview

# Navigate to: http://localhost:4173
```

---

## 🚀 Step 11: Deploy to Production

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod

# You'll be prompted for project settings
# Select "Use existing project" if prompted
```

### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=dist
```

### Option C: GitHub Pages

```bash
# Push to main branch
git add .
git commit -m "chore: production deployment"
git push origin main

# GitHub Actions will deploy automatically
# Check: https://github.com/YourUsername/Racewiseai.com/actions
```

---

## 📊 Step 12: Monitor in Production

```bash
# View function logs
supabase functions logs scrape-with-gemini \
  --project-id "{SUPABASE_PROJECT_ID}" \
  --tail

# View database statistics
# Go to SQL Editor and run:
SELECT
  'race_cards' as table_name,
  COUNT(*) as row_count,
  MAX(scraped_at) as last_update
FROM race_cards
UNION ALL
SELECT
  'horses',
  COUNT(*),
  NULL
FROM horses
UNION ALL
SELECT
  'betting_pools',
  COUNT(*),
  MAX(updated_at)
FROM betting_pools;
```

---

## 🔍 Verification Checklist

After deployment, verify everything works:

```bash
# 1. Check all tables exist
✓ race_cards
✓ horses
✓ betting_pools
✓ scraper_jobs

# 2. Verify edge functions deployed
supabase functions list --project-id "{SUPABASE_PROJECT_ID}"
✓ scrape-with-gemini
✓ save-scraped-data

# 3. Test scraper endpoint
curl -X POST \
  https://{SUPABASE_PROJECT_ID}.supabase.co/functions/v1/scrape-with-gemini \
  -H "Authorization: Bearer $(supabase auth users list --project-id {SUPABASE_PROJECT_ID} | head -1)" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.offtrackbetting.com/#/lobby/live-racing"}'

# 4. Verify data in database
SELECT COUNT(*) as races FROM race_cards;
SELECT COUNT(*) as horses FROM horses;

# 5. Check scraper logs
supabase functions logs scrape-with-gemini \
  --project-id "{SUPABASE_PROJECT_ID}" \
  --limit 10
```

---

## 🛠️ Useful Commands

```bash
# View edge function code
supabase functions show scrape-with-gemini \
  --project-id "{SUPABASE_PROJECT_ID}"

# Update edge function secret
supabase secrets set NEW_SECRET=value \
  --project-id "{SUPABASE_PROJECT_ID}"

# Delete old data (archiving)
DELETE FROM race_cards WHERE scraped_at < NOW() - INTERVAL '90 days';

# Check database size
SELECT
  pg_size_pretty(sum(pg_total_relation_size(schemaname||'.'||tablename)))
FROM pg_tables
WHERE schemaname = 'public';

# View recent scraper jobs
SELECT * FROM scraper_jobs ORDER BY started_at DESC LIMIT 10;

# See failed jobs
SELECT * FROM scraper_jobs WHERE status = 'FAILED' ORDER BY started_at DESC;
```

---

## 🚨 Troubleshooting Commands

```bash
# If functions won't deploy
supabase functions delete scrape-with-gemini \
  --project-id "{SUPABASE_PROJECT_ID}"
supabase functions deploy scrape-with-gemini \
  --no-verify-jwt \
  --project-id "{SUPABASE_PROJECT_ID}"

# If API key issues
supabase secrets list --project-id "{SUPABASE_PROJECT_ID}"
supabase secrets set GEMINI_API_KEY="{NEW_KEY}" \
  --project-id "{SUPABASE_PROJECT_ID}"

# If database issues - reset migrations
supabase migration down --project-id "{SUPABASE_PROJECT_ID}"
supabase migration up --project-id "{SUPABASE_PROJECT_ID}"

# View real-time function logs
supabase functions logs scrape-with-gemini \
  --project-id "{SUPABASE_PROJECT_ID}" \
  --tail

# Check function status
curl https://{SUPABASE_PROJECT_ID}.supabase.co/functions/v1/scrape-with-gemini \
  -H "Authorization: Bearer {YOUR_TOKEN}"
```

---

## 📋 Quick Reference

| Task | Command |
|------|---------|
| Deploy functions | `supabase functions deploy {name} --no-verify-jwt --project-id {id}` |
| List functions | `supabase functions list --project-id {id}` |
| View logs | `supabase functions logs {name} --project-id {id} --tail` |
| Set secret | `supabase secrets set KEY=value --project-id {id}` |
| List secrets | `supabase secrets list --project-id {id}` |
| Build app | `npm run build` |
| Test build | `npm run preview` |
| Deploy | `vercel --prod` or `netlify deploy --prod` |

---

## 📞 Need Help?

1. Check **PRODUCTION_SETUP.md** for detailed explanations
2. Check **SCRAPER_SETUP.md** for advanced features
3. Review edge function logs: `supabase functions logs`
4. Check Supabase dashboard for errors
5. View network tab in browser DevTools for API errors

---

**All set! Your production Gemini scraper is ready!** 🎉
