# AI prompts (OpenAI)

All structured LLM calls use **`OpenAIClient`** with the **Responses API** (`generateStructuredObject`) and JSON schema outputs.

## What runs on OpenAI

- **Resume parsing** — Extract `StructuredResume` from text (`prompts/resume-parsing.ts`, `parseResumeWithAI`).
- **Resume screening** — Score and narrative fit vs job (`prompts/resume-screening.ts`, `screenResumeWithAI`).
- **Candidate research** — Synthesis from resume + supplied links (`getResumeScreeningProvider()` supplies the same client).
- **Offer drafting** — Structured offer generation (`offers/service.ts` uses `OpenAIClient` directly).
- **Onboarding welcome** — Short personalized Slack welcome (`prompts/onboarding-welcome.ts`, `generateOnboardingWelcomeWithAI`).

## Configuration

- Set **`OPENAI_API_KEY`** for any of the above. **`OPENAI_MODEL`** is optional (see `apps/web/lib/env.ts` defaults in `.env.example`).
- Onboarding welcome **degrades** to a template message if `OPENAI_API_KEY` is absent, so Slack onboarding can still be demonstrated end-to-end.

See `apps/web/lib/screening/providers.ts` and `apps/web/lib/onboarding/resolve-welcome-message.ts` for wiring.
