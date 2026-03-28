# Loom walkthrough script (10–15 minutes)

Use this as a spoken outline while screen-recording the AI hiring workflow demo.

---

**0:00–1:00 — Intro**  
Briefly state what the app is: an AI-assisted hiring scaffold with public apply flows, admin review, interviews, offers, and **Slack-backed onboarding** after an offer is signed. Mention the monorepo layout: Next.js app, Prisma, shared Slack interface, AI package.

**1:00–3:00 — Environment and docs**  
Open the repo root `README.md` and `.env.example`. Point out `DATABASE_URL`, AI keys, and **`SLACK_PROVIDER=mock`** for local demos. Mention that `docs/architecture.md` explains status flow and providers.

**3:00–6:00 — Candidate journey (high level)**  
In the browser, walk through **careers → job → apply** (or describe it if data is thin). Explain that applications land in **admin → candidates** with statuses and an **activity log** backed by `ActivityEvent`.

**6:00–9:00 — Offer signed → Slack invite**  
Open an application that can reach **OFFER_SIGNED** (or describe the mock signing flow). Explain that on signature commit, the app calls **`orchestrateSlackWorkspaceInviteAfterOfferSigned`**: Slack invite is attempted, **`OnboardingEvent`** records `slack.workspace_invite`, and on success status moves to **ONBOARDING**. Show the activity log entries (`onboarding.slack_invite_sent` or failure types).

**9:00–12:00 — Welcome phase (simulate join)**  
On the candidate admin page with status **ONBOARDING**, show the **Slack onboarding** card. Click **Simulate Slack join & complete welcome**. Explain that this is the stand-in for a real “user joined workspace” signal. Walk through what runs: **AI or template welcome**, mock or real Slack post, **HR notification**, then status **ONBOARDED**—each step logged in the activity log.

**12:00–14:00 — Retry story**  
Return to `docs/edge-cases.md` or explain verbally: invite failure leaves **OFFER_SIGNED**; welcome failure leaves **ONBOARDING**; retries are independent. This is why the architecture separates the two modules.

**14:00–15:00 — Closing**  
Summarize: **Next.js + Prisma** for product velocity, **provider interfaces** for Slack and e-sign, **Claude** for welcome copy when configured. Invite viewers to read `docs/tradeoffs.md` for mocks vs production Slack.

---

**Tips:** Keep a terminal tab with `pnpm dev` visible; optionally show `docs/ai-prompts.md` when mentioning OpenAI vs Claude.
