# Niural — AI Product Operator Take-Home (Submission Companion)

**Suggested email subject:** `AI Product Operator Assignment- [Your Name]`  
**Send to:** nirajan@niural.com & rabin@niural.com  
**Repo:** attach your GitHub link (public or invite collaborators).

This document maps the official brief (“Build an End-to-End AI-Powered Candidate Onboarding System”) to **this repository**. It is written for reviewers: what works, what is mocked, and where to look in code and docs.

---

## 1. Working prototype (local)

```bash
docker compose up -d
pnpm install
cp .env.example .env   # configure OPENAI_API_KEY, DATABASE_URL, etc. — see README
pnpm prisma:generate
pnpm --filter web exec prisma db push
pnpm db:seed
pnpm dev
```

- **App URL:** `http://localhost:4730` (see `apps/web` `dev` script).
- **Postgres:** dedicated Docker Compose service on host port **54329** (see root `docker-compose.yml`).

---

## 2. Phase-by-phase coverage

| Phase | Module (brief) | Implemented in this repo | Notes |
|-------|----------------|---------------------------|--------|
| **01** | Career portal & applications | **Yes** | Careers + job detail + apply form; ≥3 jobs via seed; duplicate email+role blocked; PDF/DOCX + size validation; closed/paused role rejected on submit; confirmation email (mock or Resend). |
| **02A** | Admin dashboard & candidate table | **Yes** | Filters (role, **pipeline stage buckets**, exact status, dates); table; candidate detail; manual override with note; dashboard metrics + funnel; **offers awaiting signature** card. |
| **02B** | AI resume screening | **Yes** | Extract → parse (prompt + optional keyword enrichment pass) → score vs JD; strengths/gaps/rationale; **confidence + score-based routing** (auto-shortlist vs manual-review queue vs screened only). Research runs after auto-shortlist path. |
| **02C** | Candidate research | **Partial / honest** | **Synthesis from resume + URLs** (no live LinkedIn/X/GitHub scraping). Discrepancy flags + brief stored; **admin shows `sourceLinksJson`** (LinkedIn / GitHub / portfolio references). See `orchestrate-candidate-research`. |
| **03** | Calendar orchestration | **Simplified** | **Tokenized candidate scheduling link**, `InterviewSlot` with **HELD** + holds; **email to candidate** when slots are generated (flow `scheduling_slots_offered`); **manual “48h-style” reminder** on scheduling page (`scheduling_followup_nudge`). **Not** full Google Calendar OAuth. |
| **04** | AI notetaker | **Mock ingestion** | `Interview.transcriptText` + `notetakerProvider` + summary; **admin “Simulate notetaker (mock)”** attaches Fireflies-style demo content; activity `interview.mock_notetaker_ingested`. |
| **05** | Offer generation & e-sign | **Yes (mock signing path)** | AI offer draft; stored offer text; **mock e-sign**; **optional `ADMIN_ALERT_EMAIL`** on sign + activity `offer.signed`; production would use DocuSign/PandaDoc webhooks. |
| **06** | Slack onboarding | **Yes (mock or API)** | After offer signed: invite orchestration + AI welcome copy + HR notification; `SLACK_PROVIDER` mock vs real API. |

---

## 3. Required deliverables (checklist)

| # | Deliverable | Where |
|---|-------------|--------|
| 1 | Working prototype | This repo + **README.md** Quick Start |
| 2 | **Loom (10–15 min)** | **You record** — use `docs/loom-script.md` as a talk track; paste the Loom URL in your submission email and optionally in README |
| 3 | README / architecture | **README.md**, **docs/architecture.md**, **docs/ai-prompts.md** |
| 4 | Edge cases (top 5+) | **docs/edge-cases.md** (and screening/scheduling sections in architecture) |
| 5 | Assumptions & trade-offs | **docs/tradeoffs.md** |

---

## 4. Top edge cases (brief — full detail in `docs/edge-cases.md`)

1. **Duplicate application** — Same email + same role returns a clear error; no double rows (`@@unique` on candidate+job).
2. **Invalid resume / closed role** — Server-side Zod validation; role re-checked at submit time.
3. **Scheduling / slot holds** — Slots have statuses (e.g. HELD, CONFIRMED); candidate link is token-based; see scheduling docs and Prisma `InterviewSlot`.
4. **Resend / email sandbox** — Mock provider + dev “Mock emails” panel; Resend 403 can fall back to mock so flows don’t hard-fail locally.
5. **Offer sign / Slack idempotency** — Signing and Slack invite paths guard against duplicate side effects (see `docs/edge-cases.md`).

---

## 5. Deliberate trade-offs (summary — full in `docs/tradeoffs.md`)

1. **Research** — No live social scraping; AI synthesis from structured resume + provided URLs (faster, safer demo; real product would add compliant APIs/cache).
2. **Calendar** — In-app slot model vs full Google Calendar two-way sync in the prototype window.
3. **E-sign & notetaker** — Mock signing and transcript placeholder to ship an end-to-end **demonstrable** pipeline without production vendor accounts.

---

## 6. AI & tooling transparency

- **LLM:** OpenAI (configurable model via `OPENAI_MODEL`) for parsing, screening, offer draft, onboarding welcome copy, research synthesis — see `packages/ai-engine` and `docs/ai-prompts.md`.
- **Build assist:** Cursor / AI-assisted editing for speed; human review of architecture, prompts, and trade-offs.
- **Evaluation:** Prompts use structured outputs + repair passes where implemented.

---

## 7. What we would add with more time

- Live **Google Calendar** availability + tentative holds + webhooks.
- **Notetaker** vendor (Fireflies/Fathom/etc.) with API or webhook ingestion.
- **DocuSign/PandaDoc** production signing + webhook-driven status.
- Live **LinkedIn/GitHub** integrations with compliant API keys and rate limits.

---

## 8. Extra initiative (beyond minimum)

- Dedicated **Postgres** via Docker (port **54329**) to avoid clashing with other local stacks.
- **Confidence + score routing** for shortlist vs manual review (not threshold-only).
- **Mock email preview panel** in development for demo storytelling.
- **Activity timeline** and **funnel metrics** on admin surfaces.

---

*Happy vibe coding — good luck with submission.*
