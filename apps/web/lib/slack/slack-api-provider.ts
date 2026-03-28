import type {
  SlackCandidateWelcomeInput,
  SlackHrOnboardingNotificationInput,
  SlackProvider,
  SlackWorkspaceInviteInput,
  SlackWorkspaceInviteResult,
} from "@hiring-workflow/shared";

import { env } from "../env";

type SlackApiOkResponse = {
  ok?: boolean;
  error?: string;
  needed?: string;
  user_id?: string;
  ts?: string;
  channel?: string;
};

/**
 * Slack Web API–backed implementation. Many orgs need Enterprise Grid for admin invites;
 * this class is a real HTTP stub you can extend as tokens and scopes are provisioned.
 */
export class SlackApiProvider implements SlackProvider {
  readonly providerName = "slack-web-api";

  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async postApi(method: string, body: Record<string, unknown>): Promise<SlackApiOkResponse> {
    const response = await fetch(`https://slack.com/api/${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { ok: false, error: `http_${response.status}` };
    }

    return (await response.json()) as SlackApiOkResponse;
  }

  async sendWorkspaceInvite(input: SlackWorkspaceInviteInput): Promise<SlackWorkspaceInviteResult> {
    if (!env.SLACK_TEAM_ID) {
      return {
        ok: false,
        errorCode: "missing_team_id",
        message:
          "SLACK_TEAM_ID is required for admin.users.invite. Set it for your workspace or use SLACK_PROVIDER=mock.",
      };
    }

    const payload = await this.postApi("admin.users.invite", {
      email: input.candidateEmail,
      team_id: env.SLACK_TEAM_ID,
      real_name: `${input.candidateFirstName} ${input.candidateLastName}`.trim(),
    });

    if (!payload.ok) {
      return {
        ok: false,
        errorCode: payload.error ?? "slack_api_error",
        message: `Slack admin.users.invite failed: ${payload.error ?? "unknown"}${payload.needed ? ` (needs: ${payload.needed})` : ""}`,
      };
    }

    return {
      ok: true,
      inviteId: `slack-invite-${input.applicationId}`,
      externalRef: payload.user_id ?? undefined,
    };
  }

  async sendCandidateWelcome(input: SlackCandidateWelcomeInput) {
    const channel = env.SLACK_WELCOME_CHANNEL_ID;
    if (!channel) {
      return {
        ok: false as const,
        message:
          "SLACK_WELCOME_CHANNEL_ID is not set; configure a channel for welcome posts or use mock provider.",
      };
    }

    const text = [`Welcome <mailto:${input.candidateEmail}|new hire>`, "", input.message].join("\n");
    const payload = await this.postApi("chat.postMessage", {
      channel,
      text: `${text}\n\n_ref application=${input.applicationId} invite=${input.inviteId}_`,
    });

    if (!payload.ok) {
      return {
        ok: false as const,
        message: `chat.postMessage failed: ${payload.error ?? "unknown"}`,
      };
    }

    return { ok: true as const };
  }

  async notifyHrOnboarding(input: SlackHrOnboardingNotificationInput) {
    const channel = env.SLACK_HR_CHANNEL_ID;
    if (!channel) {
      return {
        ok: false as const,
        message: "SLACK_HR_CHANNEL_ID is not set.",
      };
    }

    const text = [
      ":white_check_mark: *Onboarding complete*",
      `*Candidate:* ${input.candidateName}`,
      `*Role:* ${input.jobTitle} (${input.team})`,
      `*Application:* \`${input.applicationId}\``,
      "",
      ...input.summaryLines.map((line) => `• ${line}`),
    ].join("\n");

    const payload = await this.postApi("chat.postMessage", { channel, text });

    if (!payload.ok) {
      return {
        ok: false as const,
        message: `HR chat.postMessage failed: ${payload.error ?? "unknown"}`,
      };
    }

    return { ok: true as const };
  }
}
