# Flowtusk Deployment Guide

This guide walks you through deploying Flowtusk to production with Supabase + Vercel.

## Prerequisites

- Supabase account ([supabase.com](https://supabase.com))
- Vercel account ([vercel.com](https://vercel.com))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))
- Optional: Firecrawl API key ([firecrawl.dev](https://firecrawl.dev))

## Step 1: Create Supabase Project

1. Go to [database.new](https://database.new) or your Supabase dashboard
2. Click "New Project"
3. Choose organization, name project, and set database password
4. Wait for project to finish initializing (~2 minutes)

## Step 2: Run Database Migrations

1. Go to your Supabase project → **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_flows_table.sql`
4. Click "Run" to execute the migration
5. Repeat for `supabase/migrations/002_update_existing_tables.sql`
6. Verify tables created: Go to **Table Editor** → should see `flows`, `landing_pages`, `leads` tables

## Step 3: Verify RLS Policies

1. In Supabase, go to **Authentication** → **Policies**
2. Verify RLS is enabled on all tables:
   - `flows` - should have 5-6 policies
   - `landing_pages` - should have 4-5 policies
   - `leads` - should have 1-2 policies
3. Test policy: Try querying flows table without auth (should fail)

## Step 4: Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **Publishable key** (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
3. Save these for Step 6

## Step 5: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
4. Click "Deploy" (will fail initially - this is expected)

### Option B: Deploy via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## Step 6: Set Environment Variables

In Vercel dashboard → Your Project → **Settings** → **Environment Variables**, add:

```env
# Supabase (from Step 4)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...

# Optional: Firecrawl
FIRECRAWL_API_KEY=fc-...
FIRECRAWL_ENABLED=false

# Optional: Demo Mode
NEXT_PUBLIC_DEMO_MODE_ENABLED=false
```

**Important**: Set these for "Production", "Preview", and "Development" environments

## Step 7: Redeploy

After adding environment variables:

1. Go to **Deployments**
2. Find the latest deployment
3. Click **•••** → **Redeploy**
4. Check "Use existing Build Cache" → **Redeploy**

## Step 8: Post-Deployment Verification

### Test Auth Flow

1. Go to your deployed URL
2. Click "Sign Up"
3. Create new account (check email for confirmation)
4. Verify you can log in
5. Verify you're redirected to `/app` after login

### Test Flow Creation

1. Click "New Flow"
2. Paste a website URL (e.g., `https://stripe.com`)
3. Wait for analysis to complete
4. Verify facts_json is populated
5. Generate ICPs → verify evidence field is present
6. Refresh page → verify state persists (from DB, not localStorage)

### Test Evidence Chain

Open browser console and run:

```javascript
// After generating ICPs
console.log('ICPs:', JSON.parse(localStorage.getItem('last_icps_response')))
// Should see evidence: ["fact-1", "fact-2", ...] in each ICP
```

Or query Supabase directly:

```sql
-- In Supabase SQL Editor
SELECT 
  id, 
  title, 
  jsonb_pretty(facts_json->'facts') as facts_with_evidence,
  jsonb_pretty(selected_icp->'evidence') as icp_evidence
FROM flows
WHERE user_id = 'your-user-id'
LIMIT 1;
```

### Test Performance

- Initial load: < 2s
- Flow switch: < 500ms
- Auto-save: Check network tab, should debounce (~2s after last change)

## Step 9: Set Up Monitoring (Recommended)

### Enable Vercel Analytics

1. Go to **Analytics** in Vercel dashboard
2. Enable **Web Analytics**
3. Monitor Core Web Vitals

### Enable Supabase Logs

1. Go to Supabase → **Logs**
2. Monitor:
   - API logs for errors
   - Postgres logs for slow queries
   - Auth logs for signup/login issues

### Set Up Alerts

Add webhook for critical errors:

```bash
# In Vercel: Settings → Integrations → Notifications
# Add Slack/Discord webhook for deployment failures
```

## Step 10: Performance Optimization

### Enable Vercel Edge Config (Optional)

For faster API responses:

```bash
vercel env add EDGE_CONFIG
# Follow prompts to create Edge Config
```

### Enable Database Connection Pooling

In Supabase → **Database** → **Connection Pooling**:
- Enable **Transaction Mode**
- Use pooling connection string in production

## Rollback Procedure

If deployment fails:

1. Go to Vercel → **Deployments**
2. Find last working deployment
3. Click **•••** → **Promote to Production**

If database migration fails:

1. Go to Supabase → **SQL Editor**
2. Run rollback script (if provided)
3. Or manually revert changes

## Environment-Specific Settings

### Production

```env
NODE_ENV=production
NEXT_PUBLIC_DEMO_MODE_ENABLED=false
FIRECRAWL_ENABLED=true  # If you have API key
```

### Staging

```env
NODE_ENV=production
NEXT_PUBLIC_DEMO_MODE_ENABLED=true  # Allow testing without auth
FIRECRAWL_ENABLED=false  # Save costs
```

### Development

```env
NODE_ENV=development
NEXT_PUBLIC_DEMO_MODE_ENABLED=true
FIRECRAWL_ENABLED=false
```

## Common Issues

### Issue: "Failed to fetch flows"

**Cause**: RLS policies not set correctly

**Fix**:
1. Verify user is authenticated
2. Check RLS policies in Supabase
3. Verify `user_id` column exists on flows table

### Issue: "Unauthorized" errors

**Cause**: Middleware not configured properly

**Fix**:
1. Check `middleware.ts` is at project root
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is set
3. Check middleware config matcher

### Issue: Evidence chain missing

**Cause**: Old migration or prompt templates changed

**Fix**:
1. DO NOT change `lib/prompt-templates.ts`
2. Re-run evidence validation tests
3. Check API responses include `evidence` and `sourceFactIds`

### Issue: Slow performance

**Cause**: Database queries or API timeouts

**Fix**:
1. Enable connection pooling in Supabase
2. Check indexes are created (see migration SQL)
3. Monitor Supabase **Database** → **Performance**

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Environment variables set in Vercel (not in code)
- [ ] Supabase **Auth** → **Policies** configured
- [ ] API routes validate user auth
- [ ] No exposed API keys in client code
- [ ] CORS configured properly (if needed)

## Scaling Considerations

As your user base grows:

1. **Database**: Upgrade Supabase plan for more connections
2. **Vercel**: Enable **Pro** plan for better performance
3. **OpenAI**: Monitor usage, consider caching responses
4. **CDN**: Enable Vercel Edge Network for global performance

## Support

- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Flowtusk: See README.md for local development

## Next Steps

After successful deployment:

1. Test with real users (beta group)
2. Monitor error rates and performance
3. Set up feedback collection
4. Review dropoff analytics: Query `flow_dropoff_analytics` view
5. Iterate on high-dropoff steps
