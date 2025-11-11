# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Next.js App Router (TypeScript), Supabase (Postgres + Auth), Vitest, ESLint (flat config), Tailwind CSS.
- Core concept: evidence chain. All generated outputs reference source facts via IDs. Critical files implementing this are read-only: lib/prompt-templates.ts, lib/validators.ts, lib/few-shot-examples.ts.

Commands
- Install deps: npm install
- Dev server (Turbopack): npm run dev
- Build: npm run build
- Start (after build): npm start
- Lint: npm run lint
  - With fixes: npm run lint -- --fix
- Typecheck: npm run typecheck
- Format: npm run format
  - Check only: npm run format:check
- Tests (Vitest):
  - All tests: npm test
  - Evidence-chain only: npm run test:evidence
  - UI test runner: npm run test:ui
  - Run a specific file: npm test -- tests/api/flows.test.ts
  - Run by test name: npm test -- -t "Value prop variations must have sourceFactIds"
  - Coverage: npm test -- --coverage

Environment and setup
- Create local env: cp .env.example .env.local and fill values noted in README.md (Supabase project URL and publishable key, OPENAI_API_KEY, optional Firecrawl, NEXT_PUBLIC_DEMO_MODE_ENABLED).
- Tests do not require real keys; vitest setup (tests/setup.ts) stubs env and global fetch.

High-level architecture
- App structure (Next.js App Router):
  - app/layout.tsx sets global fonts/theme via next-themes. app/page.tsx renders the marketing landing experience. Auth pages live under app/auth/.
  - Components under components/ include the “design studio” UI, landing page sections, and shadcn/ui primitives in components/ui/.
- API routes (server actions under app/api/):
  - Core flow CRUD: app/api/flows/route.ts (list/create), app/api/flows/[id]/route.ts (get/update/delete), and restore at app/api/flows/[id]/restore/route.ts. Uses Supabase on the server (lib/supabase/server.ts) and respects demo mode via NEXT_PUBLIC_DEMO_MODE_ENABLED.
    - Data model: table name used in code is positioning_flows. Soft deletes set archived_at; restore clears it. Metadata merges and tracks regeneration counts.
  - Generation endpoints: analyze-website, generate-icps, generate-value-prop, generate-one-time-email, generate-email-sequence, generate-linkedin-outreach; export endpoints under app/api/export/*.
  - Chat streaming: app/api/chat/route.ts streams OpenAI responses with a 40s timeout and text/event-stream response headers.
- Supabase clients:
  - Server: lib/supabase/server.ts creates a per-request client using cookies(); do not reuse globally (see comment). Client: lib/supabase/client.ts for browser usage.
- Frontend data client: lib/flows-client.ts is a thin wrapper around /api/flows endpoints for list/get/create/update/delete/restore.
- Evidence-chain data contracts (Zod): lib/validators.ts
  - FactsJSONSchema requires each fact to include an evidence string.
  - ICP, Value Proposition, Email, and LinkedIn schemas carry optional sourceFactIds/evidence arrays; tests assert presence for primary paths.
- Prompting architecture: lib/prompt-templates.ts implements a 3-layer (system/developer/user) prompt design and enforces structured, evidence-based outputs. Few-shot examples live in lib/few-shot-examples.ts.

Testing focus
- Evidence chain is critical. Run npm run test:evidence before merging. See tests/evidence-chain/* for UI and contract tests and README.md for manual verification SQL/flows.
- Integration tests for flows are in tests/api/flows.test.ts and exercise create/list/get/update/soft-delete/restore and unique constraints.

Linting and config
- ESLint flat config is in eslint.config.mjs using next/core-web-vitals and next/typescript. Lint via npm run lint; typecheck via npm run typecheck.

Demo mode
- When NEXT_PUBLIC_DEMO_MODE_ENABLED=true, flows APIs allow unauthenticated access to demo flows (see app/api/flows/*). app/page.tsx renders the landing directly (see DEMO_MODE.md).

Notes for agents
- Do not modify “critical” evidence-chain files (see above) unless explicitly asked. Changes tend to cascade through validators, prompts, and tests.
- If you adjust schemas in lib/validators.ts, update prompt outputs and tests accordingly to keep evidence chain intact.
- If flows table/columns change, update both API route queries (positioning_flows) and any SQL in docs.
