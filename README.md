# AI Hiring Workflow

Production-style monorepo for an **end-to-end AI-augmented hiring pipeline** (careers → apply → screening → scheduling → offer → Slack onboarding). Built as a take-home–style prototype: functionality and systems thinking over pixel polish.

### Niural “AI Product Operator” take-home submission

If you are submitting this repo for that assignment, start here:

- **[docs/NIURAL-TAKE-HOME-SUBMISSION.md](./docs/NIURAL-TAKE-HOME-SUBMISSION.md)** — Phase-by-phase coverage vs the brief, deliverable checklist, email subject/recipients, and pointers to architecture / edge cases / trade-offs.
- Record your **Loom (10–15 min)** using **[docs/loom-script.md](./docs/loom-script.md)** as a guide; paste the link in your submission email.

---

## Workspace Layout

- `apps/web`: Next.js App Router frontend and API routes
- `packages/shared`: Cross-package types, schemas, constants, and helpers
- `packages/ai-engine`: AI client and evaluation scaffolding
- `packages/workflow-engine`: Hiring workflow orchestration scaffolding
- `docs`: Project documentation placeholders
- `scripts`: Repository automation placeholders

## Quick Start

Start Postgres for this repo (dedicated host port **54329**, avoids Docker conflicts with Supabase on **54322**):

```bash
docker compose up -d
```

Then:

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

The Prisma datasource targets PostgreSQL. Default `.env.example` matches `docker compose` above; you can point `DATABASE_URL` at any Postgres (including cloud) if you prefer.

If you see **`Database hiring_workflow does not exist`**, Postgres is reachable but that database name is missing on the host/port in `DATABASE_URL`. Start the container (`docker compose up -d`), confirm `DATABASE_URL` uses port **54329** (not an old **54322** URL), then run `pnpm --filter web exec prisma db push` from the repo root.

## AI Enrichment Notes

- Resume extraction uses a local fallback extractor by default and can optionally use parser libraries if installed.
- Candidate research enrichment is synthesis only. It uses parsed resume data plus provided public profile URLs, but it does not scrape live profile content.
- The current implementation stores recruiter-facing research results in a related `ApplicationResearch` record and mirrors the brief plus discrepancy flags onto `Application` for fast access.

## Slack onboarding

After **OFFER_SIGNED**, the web app triggers a **Slack workspace invite** (mock or Slack Web API). When the welcome phase completes, status moves to **ONBOARDED**. See `docs/architecture.md` and `docs/edge-cases.md`.
