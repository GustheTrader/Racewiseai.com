# 🎯 Step-by-Step Execution Guide

Your setup is customized for:
- **Project ID:** `bqvavkzgmznjfirgfyhd`
- **Gemini API Key:** Configured securely

Follow these steps in order. Each takes 2-5 minutes.

---

## ✅ Step 1: Login to Supabase (2 min)

```bash
# Terminal 1
supabase login

# You'll be prompted to:
# 1. Open browser (to supabase.com)
# 2. Generate access token
# 3. Copy and paste token in terminal

# Verify login worked
supabase projects list

# Should show your project:
# bqvavkzgmznjfirgfyhd | racewiseai | us-east-1 | active
```

**Status:** ✅ Once you see your project in the list

---

## ✅ Step 2: Add Gemini API Key (1 min)

```bash
# Terminal 1 (same session)
supabase secrets set GEMINI_API_KEY="AIzaSyDCKIQgEx1fK_EBOtSMrBVSjfKJdYZvFd4" \
  --project-id "bqvavkzgmznjfirgfyhd"

# Verify it was added
supabase secrets list --project-id "bqvavkzgmznjfirgfyhd"

# Should show:
# GEMINI_API_KEY    ***hidden***
```

**Status:** ✅ When you see GEMINI_API_KEY in the list

---

## ✅ Step 3: Deploy First Edge Function (2 min)

```bash
# Terminal 1
supabase functions deploy scrape-with-gemini \
  --no-verify-jwt \
  --project-id "bqvavkzgmznjfirgfyhd"

# Wait for completion, you should see:
# ✓ Function scrape-with-gemini deployed successfully
# ✓ Function URL: https://bqvavkzgmznjfirgfyhd.supabase.co/functions/v1/scrape-with-gemini
```

**Status:** ✅ When you see "deployed successfully"

---

## ✅ Step 4: Deploy Second Edge Function (2 min)

```bash
# Terminal 1
supabase functions deploy save-scraped-data \
  --no-verify-jwt \
  --project-id "bqvavkzgmznjfirgfyhd"

# Wait for completion, you should see:
# ✓ Function save-scraped-data deployed successfully
# ✓ Function URL: https://bqvavkzgmznjfirgfyhd.supabase.co/functions/v1/save-scraped-data
```

**Status:** ✅ When you see "deployed successfully"

---

## ✅ Step 5: Verify Functions Deployed (1 min)

```bash
# Terminal 1
supabase functions list --project-id "bqvavkzgmznjfirgfyhd"

# Should show both:
# scrape-with-gemini        Ready
# save-scraped-data         Ready
```

**Status:** ✅ When both show "Ready"

---

## ✅ Step 6: Create Database Tables (3 min)

**Open this link in your browser:**
```
https://supabase.com/dashboard/project/bqvavkzgmznjfirgfyhd/sql/new
```

**Steps:**
1. You'll see a SQL editor with a blank query
2. Copy the entire SQL block from `YOUR_SETUP_COMMANDS.md` (the big SQL section)
3. Paste it into the SQL editor
4. Click the blue "Run" button (top right)
5. Wait for "Query OK" message

**Status:** ✅ When you see "Query OK"

---

## ✅ Step 7: Verify Database Tables (1 min)

**In the same Supabase SQL editor, run:**

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Should show:**
```
table_name
-----------
race_cards
horses
betting_pools
scraper_jobs
```

**Status:** ✅ When you see all 4 tables

---

## ✅ Step 8: Update Your .env File (1 min)

**Edit `.env` file in your project root:**

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=bqvavkzgmznjfirgfyhd
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdmF2a3pnbXpuamZpcmdmeWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzODE0NjMsImV4cCI6MjA2MTk1NzQ2M30.s6ZPJNjQpcNC6_CRUKA4g2yFJUEbxikQbApx1o_lLCs
VITE_SUPABASE_URL=https://bqvavkzgmznjfirgfyhd.supabase.co

# Admin Configuration (update with your email)
VITE_ADMIN_EMAILS=your_email@example.com
```

**Do NOT add GEMINI_API_KEY here!** It's in Supabase secrets.

**Status:** ✅ When .env file is saved

---

## ✅ Step 9: Install Dependencies (3 min)

```bash
# Terminal 1
npm install

# Wait for "added X packages" message
```

**Status:** ✅ When npm completes

---

## ✅ Step 10: Start Development Server (2 min)

```bash
# Terminal 1
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

**Status:** ✅ When you see the dev server running

---

## ✅ Step 11: Test the Scraper (5 min)

**In your browser:**

```
http://localhost:5173/scraper-dashboard
```

**You should see:**
- Login screen (if not logged in)
- Scraper panel with input field
- Races display area

**To test:**
1. Log in with your email
2. Make sure you're an admin (check `/admin` page)
3. Go back to `/scraper-dashboard`
4. Paste this URL: `https://www.offtrackbetting.com/#/lobby/live-racing`
5. Click "🚀 Scrape Race Data"
6. Watch the magic happen! 🎉

**Expected result:**
- Data extraction in progress...
- Preview shows: track name, races, horses
- Data saved message
- Races appear in "Scraped Races Database"

**Status:** ✅ When you see data extracted and saved

---

## ✅ Step 12: Verify Data in Database (2 min)

**In Supabase SQL Editor, run:**

```sql
SELECT * FROM race_cards ORDER BY scraped_at DESC LIMIT 1;
SELECT COUNT(*) as total_races FROM race_cards;
SELECT COUNT(*) as total_horses FROM horses;
```

**Should show:**
- At least 1 race card
- Multiple horses
- Betting pool data

**Status:** ✅ When you see data in the database

---

## 🎉 Congratulations!

You've successfully:
- ✅ Configured Gemini API securely
- ✅ Deployed edge functions
- ✅ Created database schema
- ✅ Tested the scraper
- ✅ Verified data storage

---

## 📊 Next: Production Deployment (Optional)

When ready to deploy to production:

```bash
# Build production version
npm run build

# Deploy to Vercel, Netlify, or GitHub Pages
vercel --prod

# Or view production preview locally
npm run preview
```

---

## 🆘 Stuck Somewhere?

### Supabase login issues
```bash
# Re-authenticate
supabase logout
supabase login
```

### Function deployment failed
```bash
# Check logs
supabase functions logs scrape-with-gemini \
  --project-id "bqvavkzgmznjfirgfyhd"

# Redeploy
supabase functions deploy scrape-with-gemini \
  --no-verify-jwt \
  --project-id "bqvavkzgmznjfirgfyhd"
```

### Database issues
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check table structure
\d race_cards

-- Check record count
SELECT COUNT(*) FROM race_cards;
```

### Scraper returns "no data"
```bash
# Check edge function logs in real-time
supabase functions logs scrape-with-gemini \
  --project-id "bqvavkzgmznjfirgfyhd" \
  --tail

# Try different URL
# Some race pages might need JavaScript rendering
```

### Permission denied errors
```bash
# Ensure you're authenticated
supabase projects list

# Ensure .env has correct project ID
echo $VITE_SUPABASE_PROJECT_ID
```

---

## 📞 Important Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/bqvavkzgmznjfirgfyhd
- **Your SQL Editor**: https://supabase.com/dashboard/project/bqvavkzgmznjfirgfyhd/sql
- **Your Tables**: https://supabase.com/dashboard/project/bqvavkzgmznjfirgfyhd/editor
- **Gemini API Docs**: https://ai.google.dev

---

**Ready to start? Begin with Step 1 above!** 🚀
