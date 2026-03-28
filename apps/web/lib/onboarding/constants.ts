/** OnboardingEvent.eventType values for Slack-driven onboarding. */
export const ONBOARDING_EVENT_TYPES = {
  SLACK_WORKSPACE_INVITE: "slack.workspace_invite",
  SLACK_WELCOME_COMPLETED: "slack.welcome_completed",
} as const;

/** ActivityEvent.eventType values (audit + retries). */
export const ONBOARDING_ACTIVITY = {
  SLACK_INVITE_SENT: "onboarding.slack_invite_sent",
  SLACK_INVITE_FAILED: "onboarding.slack_invite_failed",
  /** Uncaught exception in post-signature invite hook (outside orchestration). */
  SLACK_INVITE_HOOK_EXCEPTION: "onboarding.slack_invite_hook_exception",
  SLACK_JOIN_SIMULATED: "onboarding.slack_join_simulated",
  WELCOME_GENERATED: "onboarding.welcome_generated",
  WELCOME_DELIVERED: "onboarding.welcome_delivered",
  WELCOME_FAILED: "onboarding.welcome_failed",
  HR_NOTIFICATION_SENT: "onboarding.hr_notification_sent",
  HR_NOTIFICATION_FAILED: "onboarding.hr_notification_failed",
  STATUS_ONBOARDED: "onboarding.status_onboarded",
} as const;
