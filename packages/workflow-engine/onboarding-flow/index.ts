export function createOnboardingFlow() {
  return {
    name: "onboarding-flow",
    steps: [
      "slack-workspace-invite",
      "slack-join-or-simulate",
      "ai-welcome-message",
      "hr-slack-notification",
      "status-onboarded",
    ],
  };
}
