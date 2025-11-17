# Quick Supabase Setup - TL;DR

## 🚀 Fast Track (5 minutes)

### 1. Run the SQL Script

1. Open Supabase Dashboard → **SQL Editor** → **New Query**
2. Copy entire contents of `setup-supabase.sql`
3. Paste and click **Run**
4. Wait for success message

### 2. Configure Auth

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Go to **Authentication** → **URL Configuration**
4. Set Site URL: `http://localhost:3000`
5. Add Redirect URL: `http://localhost:3000/**`

### 3. Get Your Credentials

1. Go to **Settings** → **API**
2. Copy **Project URL** and **anon public key**
3. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   OPENAI_API_KEY=your-openai-key
   NEXT_PUBLIC_DEMO_MODE_ENABLED=true
   ```

### 4. Restart & Test

```bash
npm run dev
```

Visit `http://localhost:3000` and try analyzing a website!

## ✅ Verify Setup

Run in Supabase SQL Editor:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'positioning_%';
```

Should show 6 tables.

## 📚 Full Guide

See `SUPABASE_SETUP_GUIDE.md` for detailed instructions.

## 🐛 Quick Fixes

**Tables not found?** → Re-run `setup-supabase.sql`  
**Auth errors?** → Enable demo mode in `.env.local`  
**Connection issues?** → Check Supabase project is active  

---

**Ready to go?** Just run the SQL script and update your `.env.local`!
