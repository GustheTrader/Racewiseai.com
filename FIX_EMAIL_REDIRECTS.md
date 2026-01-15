# 🔧 Fix Email Confirmation Redirects to Production Site

**Issue:** Email confirmation links redirect to localhost instead of www.racewiseai.com

**Solution:** Update your production Supabase project's authentication settings.

---

## 🎯 OPTION 1: Using Supabase Dashboard (Easiest)

### Step 1: Go to Your Project Settings

1. Open https://supabase.com/dashboard
2. Select your project: `bqvavkzgmznjfirgfyhd`
3. Go to **Authentication** → **URL Configuration**

### Step 2: Update the URLs

Set these values:

**Site URL:**
```
https://www.racewiseai.com
```

**Redirect URLs (comma-separated or one per line):**
```
https://www.racewiseai.com
https://www.racewiseai.com/auth/callback
https://racewiseai.com
https://racewiseai.com/auth/callback
http://localhost:5173
http://localhost:3000
```

### Step 3: Update Email Templates (Optional)

Go to **Authentication** → **Email Templates**

For each template (Confirm signup, Reset password, etc.), verify the redirect URL:

Change from:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

To (if not already):
```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup
```

### Step 4: Save Changes

Click **Save** at the bottom of each section.

---

## 🎯 OPTION 2: Using Supabase CLI (Advanced)

If you have your production project linked:

```bash
# Link to production (if not already linked)
supabase link --project-ref bqvavkzgmznjfirgfyhd

# Update auth config
supabase secrets set SITE_URL="https://www.racewiseai.com"
supabase secrets set ADDITIONAL_REDIRECT_URLS="https://www.racewiseai.com,https://racewiseai.com,http://localhost:5173,http://localhost:3000"
```

**Note:** CLI method may not work for all auth settings. Use dashboard for guaranteed success.

---

## ✅ VERIFY THE FIX

### Step 1: Test Email Confirmation

1. Create a new test account on www.racewiseai.com
2. Check the confirmation email
3. Click the confirmation link
4. **Expected:** You should be redirected to www.racewiseai.com (not localhost)

### Step 2: Test Password Reset

1. Click "Forgot Password" on www.racewiseai.com
2. Enter your email
3. Check the reset email
4. Click the reset link
5. **Expected:** You should be redirected to www.racewiseai.com

---

## 🔍 ADDITIONAL SETTINGS TO CHECK

### 1. Environment Variables in Your Frontend

Make sure your production build uses the correct Supabase URL:

**.env.production** (or **.env**):
```env
VITE_SUPABASE_URL=https://bqvavkzgmznjfirgfyhd.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Make sure these are NOT set to localhost
# VITE_SUPABASE_URL=http://localhost:54321  ❌ WRONG for production
```

### 2. Check Your Auth Callback Route

Make sure your app has a route to handle the callback.

**src/App.tsx** or your router should have:
```tsx
<Route path="/auth/callback" element={<AuthCallback />} />
```

**Example AuthCallback component:**
```tsx
// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the auth callback
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  return <div>Confirming your email...</div>;
}
```

---

## 🚨 TROUBLESHOOTING

### Problem: Still redirecting to localhost
**Solutions:**
1. Clear your browser cache and cookies
2. Wait 5-10 minutes for Supabase settings to propagate
3. Verify the Site URL in Supabase dashboard is correct
4. Check that you're testing on production (www.racewiseai.com), not localhost

### Problem: "Invalid redirect URL" error
**Solution:**
Make sure the redirect URL is in the **Redirect URLs** list in Supabase dashboard

### Problem: Email not arriving
**Solutions:**
1. Check spam folder
2. Verify SMTP settings in Supabase dashboard
3. Check Supabase logs for email sending errors

### Problem: "Token expired" error
**Solutions:**
1. Confirmation tokens expire after 24 hours
2. Request a new confirmation email
3. Check that your system clock is correct

---

## 📋 QUICK CHECKLIST

Production Supabase Settings:
- [ ] Site URL is `https://www.racewiseai.com`
- [ ] Redirect URLs include your production domain
- [ ] Email templates use correct callback path
- [ ] Changes are saved

Frontend Settings:
- [ ] `.env.production` has correct Supabase URL
- [ ] Auth callback route exists (`/auth/callback`)
- [ ] Production build is deployed with correct env vars

Testing:
- [ ] New signup redirects to production site
- [ ] Email confirmation works
- [ ] Password reset works
- [ ] No localhost URLs in emails

---

## 🎉 EXPECTED RESULT

After these changes:

**Before:**
```
Email link: http://localhost:3000/auth/confirm?token=...
```

**After:**
```
Email link: https://www.racewiseai.com/auth/callback?token=...
```

---

## 📞 NEED MORE HELP?

**Supabase Documentation:**
- Auth Configuration: https://supabase.com/docs/guides/auth/auth-helpers/auth-ui
- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates

**Common Issues:**
- If using a custom domain, make sure DNS is properly configured
- If using a deployment platform (Vercel, Netlify), verify environment variables are set

---

**Once you update the Site URL in production Supabase dashboard, email confirmation links will work correctly!** 🚀
