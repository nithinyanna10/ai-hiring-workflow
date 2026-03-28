# AI Hiring Workflow

Production-style monorepo scaffold for an AI-powered hiring workflow application.

## Workspace Layout

- `apps/web`: Next.js App Router frontend and API routes
- `packages/shared`: Cross-package types, schemas, constants, and helpers
- `packages/ai-engine`: AI client and evaluation scaffolding
- `packages/workflow-engine`: Hiring workflow orchestration scaffolding
- `docs`: Project documentation placeholders
- `scripts`: Repository automation placeholders

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm --filter web exec prisma db push   # or migrate deploy
pnpm db:seed                            # upserts open roles from lib/db/job-seed-data.ts
pnpm dev
```

Re-run **`pnpm db:seed`** after adding or editing jobs in `apps/web/lib/db/job-seed-data.ts` so the careers page shows them.

The web dev server listens on **http://localhost:4730** (not 3000) so it stays clear of common localhost conflicts; keep `NEXT_PUBLIC_APP_URL` in `.env` in sync.

The Prisma datasource is configured for PostgreSQL and is ready to point at Supabase.

## AI Enrichment Notes

- Resume extraction uses a local fallback extractor by default and can optionally use parser libraries if installed.
- Candidate research enrichment is synthesis only. It uses parsed resume data plus provided public profile URLs, but it does not scrape live profile content.
- The current implementation stores recruiter-facing research results in a related `ApplicationResearch` record and mirrors the brief plus discrepancy flags onto `Application` for fast access.

## Slack onboarding

After **OFFER_SIGNED**, the web app triggers a **Slack workspace invite** (mock or Slack Web API). When the welcome phase completes, status moves to **ONBOARDED**. See `docs/architecture.md` and `docs/edge-cases.md`.
