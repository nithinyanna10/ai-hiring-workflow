# Architecture

## System design

The product is a **pnpm + Turborepo** monorepo. The **Next.js App Router** app (`apps/web`) owns HTTP routes, server actions, Prisma persistence, and integration orchestration. Shared **domain contracts** and the **`SlackProvider` interface** live in `@hiring-workflow/shared`. Prompting, JSON evaluators, and vendor clients live in `@hiring-workflow/ai-engine`. Lightweight workflow scaffolding lives in `@hiring-workflow/workflow-engine`.

Candidate-facing surfaces (careers, apply, offer signing, scheduling) and admin tools share one database and write to the same **`ActivityEvent`** audit stream.

## Application status flow (hiring → onboarding)

`ApplicationStatus` in Prisma models the pipeline. A representative happy path:

1. **APPLIED** — application submitted.
2. Screening and review stages (**SCREENED**, **SHORTLISTED**, interview states, offer states) as implemented today.
3. **OFFER_SIGNED** — candidate completes signature; the offer module commits status and emits `offer.signed`.
4. **ONBOARDING** — after a **successful Slack workspace invite**, the system transitions here and records `slack.workspace_invite` in **`OnboardingEvent`**.
5. **ONBOARDED** — after the **welcome phase** (AI message, Slack delivery, HR notification) completes without fatal errors.

Invite delivery and welcome delivery are **separate services** so operators can retry failures independently (see `orchestrate-slack-invite` vs `complete-slack-welcome`).

## Providers

| Concern | Pattern |
|--------|---------|
| Offer signature | `OfferSignatureProvider` + mock implementation |
| Slack | `SlackProvider` in shared; **`MockSlackProvider`** (no network) vs **`SlackApiProvider`** (real `fetch` to Slack Web API) selected by `SLACK_PROVIDER` |
| Resume AI | OpenAI / Claude clients behind `AIProvider` |

Provider factories read **environment** in the web app and return a concrete class. This keeps orchestration **testable** and avoids scattering `fetch` calls and env access across business logic.

## Why Next.js + Prisma + provider abstractions

- **Next.js** gives colocated UI, server actions, and route handlers with a single deployment unit suitable for hiring tools that mix public and admin flows.
- **Prisma** models rich relational data (applications, offers, slots, onboarding rows) with migrations and type-safe queries—critical for auditable hiring state.
- **Provider interfaces** isolate third-party volatility (Slack API changes, e-sign vendors, LLM APIs) behind small seams so mocks power local development and CI while production swaps implementations via configuration.
