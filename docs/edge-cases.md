# Edge cases

How important boundary conditions are handled in the current design.

1. **Duplicate offer signature completion** — Early return when the offer is already `SIGNED`; Slack invite orchestration runs only on the path that completes signing in this session, avoiding double invites on idempotent retries of the same handler.

2. **Slack invite already succeeded** — `orchestrateSlackWorkspaceInviteAfterOfferSigned` checks the latest `slack.workspace_invite` onboarding row for `payload.status === "sent"` and exits without calling Slack again.

3. **Invite fails (API error, missing token)** — Status stays **OFFER_SIGNED**; a failed onboarding row and `onboarding.slack_invite_failed` activity are written. Operators can fix configuration and retry without touching the welcome phase.

4. **Welcome phase run before ONBOARDING** — `completeSlackOnboardingWelcome` rejects unless `currentStatus === ONBOARDING`, preventing welcome/HR notifications without a recorded successful invite.

5. **Missing successful invite record** — Even if status were inconsistent, welcome requires a prior onboarding event with `status: "sent"` in payload; otherwise the function returns an error.

6. **Welcome or HR Slack step fails** — Status remains **ONBOARDING**; `onboarding.welcome_failed` or `onboarding.hr_notification_failed` is logged. Retry only the welcome flow—invite is not repeated.

7. **Idempotent welcome completion** — If `slack.welcome_completed` already has `status: "completed"` or the application is **ONBOARDED**, the welcome handler returns success without duplicating messages or notifications.

8. **Uncaught exception in post-signature invite hook** — Wrapped in `try/catch`; signing transaction is never rolled back. `onboarding.slack_invite_hook_exception` records the failure for investigation.

9. **No `CLAUDE_API_KEY` for welcome copy** — `resolveOnboardingWelcomeMessage` falls back to a deterministic template so onboarding can still complete in dev/CI.

10. **`SLACK_PROVIDER=slack_api` without `SLACK_BOT_TOKEN`** — Factory throws; invite orchestration catches provider initialization errors and logs `onboarding.slack_invite_failed` with a clear message.

11. **Slack API provider: missing `SLACK_TEAM_ID` for invites** — `admin.users.invite` is not called; structured failure returned (many workspaces need Grid / admin scopes).

12. **Application without an offer row for manager name** — Welcome prompt uses `managerName: null`; AI/template omits invented manager details per prompt rules.
