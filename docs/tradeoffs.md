# Tradeoffs

Deliberate shortcuts and mocked integrations in this codebase, and why they exist.

## 1. Mock Slack by default (`SLACK_PROVIDER=mock`)

**What:** The mock provider never calls Slack; it returns synthetic invite IDs and pretends welcome and HR posts succeeded.

**Why:** Engineers can run the full status transition **OFFER_SIGNED → ONBOARDING → ONBOARDED** without workspace tokens, paid Slack tiers, or compliance review for automated invites. Production enables `slack_api` with explicit env configuration.

## 2. Slack “real” provider posts welcome to a channel, not a true DM

**What:** `SlackApiProvider.sendCandidateWelcome` uses `chat.postMessage` to `SLACK_WELCOME_CHANNEL_ID` instead of opening a member DM, which requires the user to exist and often additional OAuth scopes.

**Why:** Workspace invites and member IDs vary by Slack product edition. A channel post is a **portable stub** that proves API wiring; swapping in `conversations.open` + DM is a scoped follow-up.

## 3. Template fallback when Claude is unavailable

**What:** If `CLAUDE_API_KEY` is unset, onboarding welcome copy uses `buildTemplateOnboardingWelcome` instead of the structured Claude evaluator.

**Why:** Keeps **demo and CI** paths green without secrets. Product teams still get AI-quality copy when keys are configured; the activity log records `source: "template"` vs `"claude"` for transparency.

## 4. Admin “simulate Slack join” instead of a live membership webhook

**What:** Completing the welcome phase can be triggered from the admin candidate page while status is **ONBOARDING**, simulating “user joined” for demos.

**Why:** Wiring Slack Events API verification, retries, and idempotency keys is substantial. The button **exercises the same business logic** a future `member_joined_channel` or SCIM-driven job would call.
