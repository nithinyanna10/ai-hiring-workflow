import type {
  SlackCandidateWelcomeInput,
  SlackHrOnboardingNotificationInput,
  SlackProvider,
  SlackWorkspaceInviteInput,
  SlackWorkspaceInviteResult,
} from "@hiring-workflow/shared";

/**
 * Deterministic Slack substitute for local and CI. Does not call the network.
 */
export class MockSlackProvider implements SlackProvider {
  readonly providerName = "mock-slack";

  async sendWorkspaceInvite(input: SlackWorkspaceInviteInput): Promise<SlackWorkspaceInviteResult> {
    return {
      ok: true,
      inviteId: `mock-invite-${input.applicationId}`,
      externalRef: `mock-ref-${input.candidateEmail}`,
    };
  }

  async sendCandidateWelcome(input: SlackCandidateWelcomeInput) {
    void input;
    return { ok: true as const };
  }

  async notifyHrOnboarding(input: SlackHrOnboardingNotificationInput) {
    void input;
    return { ok: true as const };
  }
}
