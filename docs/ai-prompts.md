# AI prompts (where OpenAI vs Claude)

## OpenAI (`OpenAIClient` / Responses API)

- **Resume parsing** — Structured extraction from resume text into `StructuredResume` (`parseResumeWithAI`, prompts under `prompts/resume-parsing.ts`).
- **Rationale:** Parsing is a **high-structure, format-heavy** task; the scaffold standardizes on OpenAI’s JSON schema style for this step (see `apps/web` screening providers).

## Claude (`ClaudeClient` / Messages API)

- **Resume screening** — Scoring and narrative fit vs job description (`prompts/resume-screening.ts`, `screenResumeWithAI`).
- **Candidate research** — Synthesis from resume + supplied links (no live scraping).
- **Offer generation** — Structured offer drafting helpers.
- **Onboarding welcome** — Short personalized Slack welcome (`prompts/onboarding-welcome.ts`, `generateOnboardingWelcomeWithAI`).
- **Rationale:** Screening and prose-heavy evaluations benefit from Claude in this project’s default wiring; onboarding welcome follows the same client for **consistent recruiter-facing tone** when keys are present.

## When keys are missing

- Screening paths typically **require** configured keys for their flows.
- Onboarding welcome **degrades** to a template message if `CLAUDE_API_KEY` is absent, so Slack onboarding can still be demonstrated end-to-end.

See `apps/web/lib/screening/providers.ts` and `apps/web/lib/onboarding/resolve-welcome-message.ts` for the live wiring.
