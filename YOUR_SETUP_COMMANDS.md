# Your Production Setup Commands

**Project ID:** `bqvavkzgmznjfirgfyhd`
**Gemini API Key:** Configured securely

---

## ⚠️ SECURITY NOTE

Your Gemini API key is extremely sensitive. We're NOT storing it in .env or git.

It will be stored ONLY in Supabase Edge Function Secrets (encrypted).

---

## 🔑 Step 1: Add Gemini API Key to Supabase

**Copy and run this command:**

```bash
supabase secrets set GEMINI_API_KEY="AIzaSyDCKIQgEx1fK_EBOtSMrBVSjfKJdYZvFd4" \
  --project-id "bqvavkzgmznjfirgfyhd"
```

**Verify it was set:**

```bash
supabase secrets list --project-id "bqvavkzgmznjfirgfyhd"
```

You should see:
```
GEMINI_API_KEY    ***hidden***
```

---

## 🚀 Step 2: Deploy Edge Functions

**Function 1: Scraper**

```bash
supabase functions deploy scrape-with-gemini \
  --no-verify-jwt \
  --project-id "bqvavkzgmznjfirgfyhd"
```

**Expected output:**
```
✓ Function deployed successfully
✓ Function URL: https://bqvavkzgmznjfirgfyhd.supabase.co/functions/v1/scrape-with-gemini
```

**Function 2: Data Storage**

```bash
supabase functions deploy save-scraped-data \
  --no-verify-jwt \
  --project-id "bqvavkzgmznjfirgfyhd"
```

**Expected output:**
```
✓ Function deployed successfully
✓ Function URL: https://bqvavkzgmznjfirgfyhd.supabase.co/functions/v1/save-scraped-data
```

**Verify both deployed:**

```bash
supabase functions list --project-id "bqvavkzgmznjfirgfyhd"
```

Should show both functions with status `Ready`

---

## 📊 Step 3: Create Database Schema

**Go to Supabase SQL Editor:**
```
https://supabase.com/dashboard/project/bqvavkzgmznjfirgfyhd/sql/new
```

**Copy and paste this entire SQL block:**

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

-- Enable Row Level Security
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

-- Create indexes for performance
CREATE INDEX idx_race_cards_track_date ON race_cards(track_name, race_date);
CREATE INDEX idx_race_cards_scraped_at ON race_cards(scraped_at);
CREATE INDEX idx_horses_race_card_id ON horses(race_card_id);
CREATE INDEX idx_betting_pools_race_card_id ON betting_pools(race_card_id);
CREATE INDEX idx_scraper_jobs_status ON scraper_jobs(status);
```

**Click "Run"** - You should see "Query OK"

---

## 🔧 Step 4: Update Environment Configuration

**Edit your `.env` file:**

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=bqvavkzgmznjfirgfyhd
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmF2a3pnbXpuamZpcmdmeWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE0NjMsImV4cCI6MjA2MTk1NzQ2M30.s6ZPJNjQpcNC6_CRUKA4g2yFJUEbxikQbApx1o_lLCs
VITE_SUPABASE_URL=https://bqvavkzgmznjfirgfyhd.supabase.co

# Admin Configuration
VITE_ADMIN_EMAILS=your_email@example.com

# NOTE: GEMINI_API_KEY is stored in Supabase secrets, NOT here!
```

---

## 🧪 Step 5: Local Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Navigate to:
http://localhost:5173/scraper-dashboard
```

**Test the scraper:**

1. Paste this URL: `https://www.offtrackbetting.com/#/lobby/live-racing`
2. Click "🚀 Scrape Race Data"
3. Watch the AI extract data in real-time
4. Check the preview
5. Data should be saved to your database

---

## ✅ Step 6: Verify Everything Works

**Check functions deployed:**

```bash
supabase functions list --project-id "bqvavkzgmznjfirgfyhd"
```

**Check database tables:**

Go to: `https://supabase.com/dashboard/project/bqvavkzgmznjfirgfyhd/editor`

You should see:
- ✓ race_cards
- ✓ horses
- ✓ betting_pools
- ✓ scraper_jobs

**Check data in database:**

In Supabase SQL Editor:

```sql
SELECT COUNT(*) as races FROM race_cards;
SELECT COUNT(*) as horses FROM horses;
SELECT * FROM race_cards ORDER BY scraped_at DESC LIMIT 1;
```

---

## 🚀 Step 7: Build for Production

```bash
# Create production build
npm run build

# Test production build locally
npm run preview

# Navigate to: http://localhost:4173
```

---

## 📊 Step 8: Monitor Your Scraper

**View edge function logs:**

```bash
supabase functions logs scrape-with-gemini \
  --project-id "bqvavkzgmznjfirgfyhd" \
  --tail
```

**View database statistics:**

In Supabase SQL Editor:

```sql
SELECT
  track_name,
  COUNT(*) as race_count,
  MAX(scraped_at) as last_scraped
FROM race_cards
GROUP BY track_name
ORDER BY last_scraped DESC;
```

---

## 📋 Troubleshooting

**"API key not configured"**
→ Run Step 1 again to set the secret

**"Function deployment failed"**
→ Make sure you're logged in: `supabase login`

**"Database connection failed"**
→ Check project URL is correct

**"No data extracted"**
→ Check function logs: `supabase functions logs scrape-with-gemini --tail`

---

## 🎯 Summary of Your Setup

| Item | Value |
|------|-------|
| Project ID | `bqvavkzgmznjfirgfyhd` |
| Gemini API | Configured ✓ |
| Project URL | `https://bqvavkzgmznjfirgfyhd.supabase.co` |
| Scraper Function | Ready to deploy |
| Database | Ready to create |
| Dashboard | `/scraper-dashboard` |

---

## ✨ What's Next After This?

1. ✅ **Step 1**: Setup API and database (you are here)
2. ⏭️ **Step 2**: Test the scraper locally
3. ⏭️ **Step 3**: Deploy to production
4. ⏭️ **Step 4**: Set up automated scheduling (optional)
5. ⏭️ **Step 5**: Build custom analysis tools

---

**Ready to go?** Execute the commands above in order! 🚀
