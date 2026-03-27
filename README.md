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
pnpm dev
```

The Prisma datasource is configured for PostgreSQL and is ready to point at Supabase.

## AI Enrichment Notes

- Resume extraction uses a local fallback extractor by default and can optionally use parser libraries if installed.
- Candidate research enrichment is synthesis only. It uses parsed resume data plus provided public profile URLs, but it does not scrape live profile content.
- The current implementation stores recruiter-facing research results in a related `ApplicationResearch` record and mirrors the brief plus discrepancy flags onto `Application` for fast access.
