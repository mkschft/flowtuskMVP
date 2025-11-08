# Flowtusk - Find Who You're Selling To

> Paste your website URL. Get customer clarity. Export ready-to-use templates—emails, landing pages, LinkedIn, pitch decks—rooted in real customer insights. All in 15 minutes.

## Features

- **Evidence-Based Generation**: All AI outputs cite specific facts from your website (sourceFactIds evidence chain)
- **Persistent Flows**: All work saved to Supabase, accessible from any device
- **ICP Discovery**: Generate 3 detailed Ideal Customer Profiles with personas
- **Value Proposition Builder**: Create customizable, variation-tested value props
- **Content Export**: Email sequences, LinkedIn content, PDF, Google Slides
- **Analytics**: Track dropoff points, completion times, and regeneration patterns
- **Demo Mode**: Optional guest access with auto-migration on signup

## Tech Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: OpenAI GPT-4o + GPT-4o-mini with structured outputs
- **Deployment**: Vercel
- **Scraping**: Jina AI Reader (fallback: Firecrawl)

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
git clone https://github.com/your-org/flowtusk.git
cd flowtuskMVP
npm install
```

### 2. Set Up Supabase

1. Create a project at [database.new](https://database.new/)
2. Run the migrations in SQL Editor:
   - Copy contents of `supabase/migrations/001_flows_table.sql` and run
   - Copy contents of `supabase/migrations/002_update_existing_tables.sql` and run
3. Verify tables exist: `flows`, `landing_pages`, `leads`

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase (from Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Optional
FIRECRAWL_API_KEY=
FIRECRAWL_ENABLED=false
NEXT_PUBLIC_DEMO_MODE_ENABLED=false
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── flows/          # Flow CRUD operations
│   │   ├── analyze-website/ # Website scraping + facts extraction
│   │   ├── generate-icps/   # ICP generation
│   │   ├── generate-value-prop/ # Value prop creation
│   │   └── generate-*-email/ # Email generation
│   ├── app/                # Main app UI (chat interface)
│   └── auth/               # Auth pages (login, signup, etc.)
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── ErrorBoundary.tsx   # Error handling
│   ├── LoadingSkeleton.tsx # Loading states
│   └── ...                 # Feature components
├── lib/
│   ├── prompt-templates.ts  # 🔒 NEVER TOUCH - Evidence-based prompts
│   ├── flows-client.ts      # DB operations wrapper
│   ├── migrate-local-to-db.ts # localStorage → DB migration
│   ├── validators.ts        # JSON schema validation
│   └── supabase/           # Supabase clients
├── supabase/
│   └── migrations/         # Database migrations
├── DEPLOYMENT.md           # Production deployment guide
└── TESTING.md              # Comprehensive testing checklist
```

## Critical Files (NEVER MODIFY)

These files contain the evidence chain logic that makes Flowtusk unique:

- `lib/prompt-templates.ts` - 3-layer prompt architecture
- `lib/validators.ts` - Evidence chain validation
- `lib/few-shot-examples.ts` - Prompt examples

Any changes to these files risk breaking the evidence chain.

## Development

### Run Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Evidence chain validation (CRITICAL)
npm run test:evidence
```

### Linting & Type Checking

```bash
npm run lint
npm run typecheck
```

### Database Migrations

When adding new tables or columns:

1. Create a new migration file in `supabase/migrations/`
2. Test locally
3. Run in production Supabase SQL Editor
4. Document in `DEPLOYMENT.md`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick deploy:

1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy
5. Run migrations in Supabase

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

Before any deployment, verify:

- [ ] All auth flows work
- [ ] Flow CRUD operations persist to DB
- [ ] Evidence chain intact (sourceFactIds present)
- [ ] No console errors
- [ ] Page refresh preserves state

## Evidence Chain Verification

The evidence chain is Flowtusk's competitive advantage. Verify it's working:

```sql
-- Check evidence in DB
SELECT 
  id,
  title,
  facts_json->'facts'->0->'evidence' as fact_evidence,
  selected_icp->'evidence' as icp_evidence
FROM public.flows
WHERE facts_json IS NOT NULL
LIMIT 5;
```

All flows should have evidence fields populated.

## Architecture

### Data Flow

1. **User pastes URL** → `/api/analyze-website`
2. **Scrape with Jina** → Extract facts with GPT-4o
3. **Save facts_json** → Supabase (with evidence fields)
4. **Generate ICPs** → GPT-4o-mini using facts (evidence tracked)
5. **User selects ICP** → Saved to DB
6. **Generate value props** → References facts via sourceFactIds
7. **Generate emails** → Cites sourceFactIds
8. **Export** → All formats include evidence

### Evidence Chain

Every AI-generated output includes:

```json
{
  "variations": [
    {
      "id": "benefit-first",
      "text": "Cut tax prep time by 40%...",
      "sourceFactIds": ["fact-3", "fact-7"]  // ← CRITICAL
    }
  ]
}
```

This allows:
- Transparency (show users where claims come from)
- Debugging (trace back to source facts)
- Analytics (which facts are most useful)
- Trust (verifiable, not hallucinated)

## Performance Targets

- Initial page load: < 2s
- Flow creation: < 500ms
- Website analysis: < 30s
- ICP generation: < 10s
- Flow switching: < 300ms

Monitor in Vercel Analytics.

## Security

- RLS (Row Level Security) enabled on all tables
- Users can only access their own flows
- API routes require authentication
- Environment variables never exposed client-side
- Rate limiting recommended for production

## Troubleshooting

### "Failed to fetch flows"

**Check:**
1. User is logged in
2. RLS policies are active
3. Environment variables are set
4. Supabase is not paused

### "Evidence chain missing"

**Check:**
1. `lib/prompt-templates.ts` is unmodified
2. Facts JSON has evidence fields
3. API responses include sourceFactIds
4. Run `npm run test:evidence`

### "Duplicate title error"

**Expected behavior** - unique constraint working correctly.
User should choose a different title or delete existing flow.

## Contributing

1. Create feature branch from `main`
2. Make changes (never touch `lib/prompt-templates.ts`)
3. Run `npm run test:evidence` (must pass)
4. Create PR
5. CI checks must pass
6. Deploy to staging
7. Verify evidence chain
8. Merge to main

## License

Proprietary - All rights reserved

## Support

For issues or questions:
- Check [TESTING.md](./TESTING.md) troubleshooting section
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Check Vercel logs for runtime errors
- Query Supabase for data issues
