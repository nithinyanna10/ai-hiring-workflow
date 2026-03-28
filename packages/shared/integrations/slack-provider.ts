/**
 * Slack integration contract for workspace onboarding (invite, welcome, HR ping).
 * Implementations live in the web app; this package holds the shared interface only.
 */
export type SlackWorkspaceInviteInput = {
  applicationId: string;
  candidateEmail: string;
  candidateFirstName: string;
  candidateLastName: string;
};

export type SlackWorkspaceInviteFailure = {
  ok: false;
  errorCode: string;
  message: string;
};

export type SlackWorkspaceInviteSuccess = {
  ok: true;
  inviteId: string;
  externalRef?: string;
};

export type SlackWorkspaceInviteResult = SlackWorkspaceInviteSuccess | SlackWorkspaceInviteFailure;

export type SlackCandidateWelcomeInput = {
  applicationId: string;
  inviteId: string;
  candidateEmail: string;
  message: string;
};

export type SlackHrOnboardingNotificationInput = {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  team: string;
  summaryLines: string[];
};

export interface SlackProvider {
  readonly providerName: string;

  sendWorkspaceInvite(input: SlackWorkspaceInviteInput): Promise<SlackWorkspaceInviteResult>;

  sendCandidateWelcome(
    input: SlackCandidateWelcomeInput,
  ): Promise<{ ok: true } | { ok: false; message: string }>;

  notifyHrOnboarding(
    input: SlackHrOnboardingNotificationInput,
  ): Promise<{ ok: true } | { ok: false; message: string }>;
}
