# Deployment Guide

This guide covers deploying Flowtusk to production with Vercel and Supabase.

## Prerequisites

- Supabase account and project
- Vercel account
- OpenAI API key
- (Optional) Firecrawl API key

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [database.new](https://database.new/)
2. Create a new project
3. Wait for the project to initialize (~2 minutes)

### 1.2 Run Migrations

1. Go to your project's SQL Editor
2. Copy and paste the contents of `supabase/migrations/001_flows_table.sql`
3. Click "Run"
4. Verify the `flows` table was created in the Table Editor
5. Repeat for `supabase/migrations/002_update_existing_tables.sql`

### 1.3 Verify RLS Policies

In the SQL Editor, run:

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('flows', 'landing_pages', 'leads');
```

You should see multiple policies for each table.

### 1.4 Get API Credentials

1. Go to Project Settings → API
2. Copy your:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon/public` key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

## Step 2: Vercel Deployment

### 2.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the repository containing Flowtusk

### 2.2 Configure Environment Variables

In the Vercel project settings, add these environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Optional: Firecrawl
FIRECRAWL_API_KEY=your-firecrawl-key
FIRECRAWL_ENABLED=false

# Optional: Demo Mode
NEXT_PUBLIC_DEMO_MODE_ENABLED=false

# Environment
NODE_ENV=production
```

### 2.3 Deploy

1. Click "Deploy"
2. Wait for the build to complete (~3-5 minutes)
3. Click on the deployment URL to test

## Step 3: Post-Deployment Verification

### 3.1 Test Auth Flow

1. Visit your deployment URL
2. Click "Sign Up"
3. Create a test account
4. Verify you receive a confirmation email
5. Confirm your email
6. Log in with the test account

### 3.2 Test Flow Creation

1. Create a new flow
2. Paste a website URL (e.g., https://stripe.com)
3. Wait for analysis to complete
4. Verify facts_json is populated
5. Generate ICPs
6. Check that evidence fields are present

### 3.3 Verify Database

In Supabase SQL Editor:

```sql
-- Check if flows are being created
SELECT id, title, user_id, step, created_at
FROM public.flows
ORDER BY created_at DESC
LIMIT 10;

-- Verify evidence chain
SELECT 
  id, 
  title,
  facts_json IS NOT NULL as has_facts,
  selected_icp IS NOT NULL as has_icp,
  step
FROM public.flows
WHERE user_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

### 3.4 Test Evidence Chain

1. In a flow, generate value propositions
2. Check the API response in browser DevTools → Network
3. Verify `sourceFactIds` are present in the response
4. In Supabase SQL Editor:

```sql
SELECT 
  id,
  title,
  facts_json->'facts'->0->'id' as first_fact_id,
  selected_icp->'evidence' as icp_evidence
FROM public.flows
WHERE facts_json IS NOT NULL
LIMIT 5;
```

## Step 4: Monitoring

### 4.1 Set Up Error Tracking

In Vercel:
1. Go to Project Settings → Integrations
2. Add Sentry or LogRocket (recommended)
3. Configure error tracking

### 4.2 Monitor Database Performance

In Supabase:
1. Go to Database → Performance
2. Monitor query performance
3. Check index usage

### 4.3 Set Up Alerts

Create a Vercel monitor for:
- Deployment failures
- High error rates
- Slow API responses

## Step 5: Scaling Considerations

### 5.1 Database Optimization

If you expect high traffic:

```sql
-- Add additional indexes
CREATE INDEX CONCURRENTLY flows_step_created_idx 
ON public.flows(step, created_at DESC) 
WHERE archived_at IS NULL;

-- Enable connection pooling in Supabase
-- Go to Project Settings → Database → Connection Pooling
```

### 5.2 API Rate Limiting

Consider adding rate limiting for API routes:

```typescript
// middleware.ts
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }
  // ... rest of middleware
}
```

### 5.3 Caching Strategy

Enable caching for static assets:

```typescript
// next.config.ts
const config = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
};
```

## Rollback Procedure

If you need to rollback a deployment:

### Quick Rollback

1. In Vercel Dashboard, go to Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

### Database Rollback

If you need to rollback migrations:

```sql
-- List all migrations
SELECT * FROM supabase_migrations.schema_migrations;

-- Rollback is not automatic, you'll need to manually revert
-- Example: Drop the flows table (CAUTION: DATA LOSS)
DROP TABLE IF EXISTS public.flows CASCADE;
```

**Note:** Always backup your database before major changes!

## Troubleshooting

### Issue: "Failed to fetch flows"

**Solution:**
1. Check Vercel logs for errors
2. Verify environment variables are set
3. Check Supabase RLS policies
4. Ensure user is authenticated

### Issue: "Evidence chain missing"

**Solution:**
1. Check if facts_json is being saved:
   ```sql
   SELECT id, title, facts_json IS NOT NULL as has_facts
   FROM public.flows
   ORDER BY created_at DESC
   LIMIT 10;
   ```
2. If null, check API route logs
3. Verify OpenAI API key is valid
4. Check prompt templates are not modified

### Issue: "Duplicate title error"

**Solution:**
1. This is expected behavior (unique constraint)
2. User should choose a different title
3. Or delete/archive the existing flow with that title

### Issue: "Demo flows not expiring"

**Solution:**
1. Set up a cron job to call `/api/demo/flows` with DELETE method
2. Or manually run in SQL Editor:
   ```sql
   DELETE FROM public.flows
   WHERE user_id IS NULL
   AND created_at < NOW() - INTERVAL '24 hours';
   ```

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] RLS policies are enabled and tested
- [ ] API routes require authentication
- [ ] CORS is properly configured
- [ ] Rate limiting is in place (recommended)
- [ ] Error messages don't leak sensitive data
- [ ] Supabase connection is using SSL
- [ ] OpenAI API key is not exposed client-side

## Performance Benchmarks

Target metrics:
- Initial page load: < 2s
- Flow creation: < 500ms
- Website analysis: < 30s
- ICP generation: < 10s
- Value prop generation: < 10s
- Flow switching: < 300ms

Monitor these in Vercel Analytics and Supabase Performance tabs.

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Review this guide's Troubleshooting section
4. Check GitHub issues

