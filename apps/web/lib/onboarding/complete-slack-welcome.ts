import { ActorType, ApplicationStatus } from "@prisma/client";

import { db } from "../db";
import { getSlackProvider } from "../slack/get-slack-provider";
import { ONBOARDING_ACTIVITY, ONBOARDING_EVENT_TYPES } from "./constants";
import { resolveOnboardingWelcomeMessage } from "./resolve-welcome-message";

function isSuccessfulInvitePayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }
  return (payload as { status?: string }).status === "sent";
}

function isCompletedWelcomePayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }
  return (payload as { status?: string }).status === "completed";
}

export type CompleteSlackWelcomeInput = {
  applicationId: string;
  /** When true, records a join simulation activity (admin / test harness). */
  simulatedJoin?: boolean;
};

/**
 * Post-invite phase: personalized welcome (AI or template), Slack delivery, HR notification,
 * status ONBOARDED. Invite and welcome are separate so this can be retried without re-sending the invite.
 */
export async function completeSlackOnboardingWelcome(input: CompleteSlackWelcomeInput): Promise<
  | { ok: true; phase: "already_onboarded" | "welcome_completed" }
  | { ok: false; error: string }
> {
  const application = await db.application.findUnique({
    where: { id: input.applicationId },
    select: {
      id: true,
      currentStatus: true,
      candidateId: true,
      jobId: true,
      candidate: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      job: {
        select: {
          title: true,
          team: true,
        },
      },
      offer: {
        select: {
          managerName: true,
        },
      },
    },
  });

  if (!application) {
    return { ok: false, error: "Application not found." };
  }

  if (application.currentStatus === ApplicationStatus.ONBOARDED) {
    return { ok: true, phase: "already_onboarded" };
  }

  const welcomeDone = await db.onboardingEvent.findFirst({
    where: {
      applicationId: input.applicationId,
      eventType: ONBOARDING_EVENT_TYPES.SLACK_WELCOME_COMPLETED,
    },
    orderBy: { createdAt: "desc" },
  });

  if (welcomeDone && isCompletedWelcomePayload(welcomeDone.payloadJson)) {
    return { ok: true, phase: "already_onboarded" };
  }

  if (application.currentStatus !== ApplicationStatus.ONBOARDING) {
    return {
      ok: false,
      error: `Application must be ONBOARDING before welcome (current: ${application.currentStatus}).`,
    };
  }

  const inviteRecord = await db.onboardingEvent.findFirst({
    where: {
      applicationId: input.applicationId,
      eventType: ONBOARDING_EVENT_TYPES.SLACK_WORKSPACE_INVITE,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!inviteRecord || !isSuccessfulInvitePayload(inviteRecord.payloadJson)) {
    return { ok: false, error: "No successful Slack invite found for this application." };
  }

  const invitePayload = inviteRecord.payloadJson as { inviteId?: string };
  const inviteId = invitePayload.inviteId ?? `unknown-${application.id}`;

  let slack;
  try {
    slack = getSlackProvider();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Slack provider misconfigured.";
    return { ok: false, error: message };
  }

  const { message: welcomeMessage, source } = await resolveOnboardingWelcomeMessage({
    firstName: application.candidate.firstName,
    jobTitle: application.job.title,
    team: application.job.team,
    managerName: application.offer?.managerName ?? null,
  });

  await db.activityEvent.create({
    data: {
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      actorType: ActorType.AI_AGENT,
      eventType: ONBOARDING_ACTIVITY.WELCOME_GENERATED,
      note: `Onboarding welcome message generated (${source}).`,
      payloadJson: {
        source,
        preview: welcomeMessage.slice(0, 280),
      },
    },
  });

  if (input.simulatedJoin) {
    await db.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.ADMIN,
        eventType: ONBOARDING_ACTIVITY.SLACK_JOIN_SIMULATED,
        note: "Slack workspace join simulated for onboarding welcome flow.",
        payloadJson: { inviteId },
      },
    });
  }

  const welcomeResult = await slack.sendCandidateWelcome({
    applicationId: application.id,
    inviteId,
    candidateEmail: application.candidate.email,
    message: welcomeMessage,
  });

  if (!welcomeResult.ok) {
    await db.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.SYSTEM,
        eventType: ONBOARDING_ACTIVITY.WELCOME_FAILED,
        note: welcomeResult.message,
        payloadJson: { inviteId },
      },
    });
    return { ok: false, error: welcomeResult.message };
  }

  await db.activityEvent.create({
    data: {
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      actorType: ActorType.SYSTEM,
      eventType: ONBOARDING_ACTIVITY.WELCOME_DELIVERED,
      note: "Candidate welcome posted to Slack.",
      payloadJson: { inviteId, provider: slack.providerName },
    },
  });

  const candidateName =
    `${application.candidate.firstName} ${application.candidate.lastName}`.trim();
  const hrSummary = [
    `Welcome message source: ${source}`,
    `Invite id: ${inviteId}`,
    input.simulatedJoin ? "Join was simulated in admin." : "Join detected via welcome completion path.",
  ];

  const hrResult = await slack.notifyHrOnboarding({
    applicationId: application.id,
    candidateName,
    jobTitle: application.job.title,
    team: application.job.team,
    summaryLines: hrSummary,
  });

  if (!hrResult.ok) {
    await db.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.SYSTEM,
        eventType: ONBOARDING_ACTIVITY.HR_NOTIFICATION_FAILED,
        note: hrResult.message,
        payloadJson: {},
      },
    });
    return { ok: false, error: hrResult.message };
  }

  await db.activityEvent.create({
    data: {
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.jobId,
      actorType: ActorType.SYSTEM,
      eventType: ONBOARDING_ACTIVITY.HR_NOTIFICATION_SENT,
      note: "Internal HR/admin Slack notification sent.",
      payloadJson: { provider: slack.providerName },
    },
  });

  await db.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: application.id },
      data: { currentStatus: ApplicationStatus.ONBOARDED },
    });

    await tx.candidateStatusHistory.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        fromStatus: ApplicationStatus.ONBOARDING,
        toStatus: ApplicationStatus.ONBOARDED,
        actorType: input.simulatedJoin ? ActorType.ADMIN : ActorType.SYSTEM,
        note: input.simulatedJoin
          ? "Admin simulated Slack join; onboarding welcome completed."
          : "Slack onboarding welcome completed.",
      },
    });

    await tx.onboardingEvent.create({
      data: {
        applicationId: application.id,
        eventType: ONBOARDING_EVENT_TYPES.SLACK_WELCOME_COMPLETED,
        title: "Slack onboarding welcome",
        description: "Welcome delivered and HR notified.",
        payloadJson: {
          status: "completed",
          inviteId,
          welcomeSource: source,
          simulatedJoin: Boolean(input.simulatedJoin),
        },
        completedAt: new Date(),
      },
    });

    await tx.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.SYSTEM,
        eventType: ONBOARDING_ACTIVITY.STATUS_ONBOARDED,
        note: "Application status set to ONBOARDED.",
        payloadJson: { fromStatus: ApplicationStatus.ONBOARDING, toStatus: ApplicationStatus.ONBOARDED },
      },
    });
  });

  return { ok: true, phase: "welcome_completed" };
}
