import { ActorType, ApplicationStatus } from "@prisma/client";

import { db } from "../db";
import { getSlackProvider } from "../slack/get-slack-provider";
import { ONBOARDING_ACTIVITY, ONBOARDING_EVENT_TYPES } from "./constants";

function isSuccessfulInvitePayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }
  return (payload as { status?: string }).status === "sent";
}

/**
 * Sends a Slack workspace invite and moves the application to ONBOARDING when successful.
 * Idempotent: skips if a prior invite onboarding event already recorded status "sent".
 * Runs after the offer signature transaction commits — invite failures do not roll back signing.
 */
export async function orchestrateSlackWorkspaceInviteAfterOfferSigned(
  applicationId: string,
): Promise<
  | { ok: true; phase: "already_sent" | "invited" | "skipped_wrong_status"; inviteId?: string }
  | { ok: false; error: string }
> {
  const priorInvite = await db.onboardingEvent.findFirst({
    where: {
      applicationId,
      eventType: ONBOARDING_EVENT_TYPES.SLACK_WORKSPACE_INVITE,
    },
    orderBy: { createdAt: "desc" },
  });

  if (priorInvite && isSuccessfulInvitePayload(priorInvite.payloadJson)) {
    return { ok: true, phase: "already_sent" };
  }

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      currentStatus: true,
      candidateId: true,
      jobId: true,
      candidate: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!application) {
    return { ok: false, error: "Application not found." };
  }

  if (application.currentStatus !== ApplicationStatus.OFFER_SIGNED) {
    return { ok: true, phase: "skipped_wrong_status" };
  }

  let slack;
  try {
    slack = getSlackProvider();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Slack provider misconfigured.";
    await db.activityEvent.create({
      data: {
        applicationId,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.SYSTEM,
        eventType: ONBOARDING_ACTIVITY.SLACK_INVITE_FAILED,
        note: "Slack provider could not be initialized.",
        payloadJson: { message },
      },
    });
    return { ok: false, error: message };
  }

  const invite = await slack.sendWorkspaceInvite({
    applicationId,
    candidateEmail: application.candidate.email,
    candidateFirstName: application.candidate.firstName,
    candidateLastName: application.candidate.lastName,
  });

  if (!invite.ok) {
    await db.$transaction(async (tx) => {
      await tx.onboardingEvent.create({
        data: {
          applicationId,
          eventType: ONBOARDING_EVENT_TYPES.SLACK_WORKSPACE_INVITE,
          title: "Slack workspace invite",
          description: invite.message,
          payloadJson: {
            status: "failed",
            errorCode: invite.errorCode,
            message: invite.message,
            provider: slack.providerName,
          },
        },
      });

      await tx.activityEvent.create({
        data: {
          applicationId,
          candidateId: application.candidateId,
          jobId: application.jobId,
          actorType: ActorType.SYSTEM,
          eventType: ONBOARDING_ACTIVITY.SLACK_INVITE_FAILED,
          note: "Slack workspace invite failed; status left at OFFER_SIGNED for retry.",
          payloadJson: {
            errorCode: invite.errorCode,
            message: invite.message,
            provider: slack.providerName,
          },
        },
      });
    });

    return { ok: false, error: invite.message };
  }

  await db.$transaction(async (tx) => {
    await tx.onboardingEvent.create({
      data: {
        applicationId,
        eventType: ONBOARDING_EVENT_TYPES.SLACK_WORKSPACE_INVITE,
        title: "Slack workspace invite",
        description: "Workspace invite issued to candidate email.",
        payloadJson: {
          status: "sent",
          inviteId: invite.inviteId,
          externalRef: invite.externalRef ?? null,
          provider: slack.providerName,
        },
        completedAt: new Date(),
      },
    });

    await tx.application.update({
      where: { id: applicationId },
      data: { currentStatus: ApplicationStatus.ONBOARDING },
    });

    await tx.candidateStatusHistory.create({
      data: {
        applicationId,
        candidateId: application.candidateId,
        fromStatus: ApplicationStatus.OFFER_SIGNED,
        toStatus: ApplicationStatus.ONBOARDING,
        actorType: ActorType.SYSTEM,
        note: "Slack workspace invite sent; candidate onboarding started.",
      },
    });

    await tx.activityEvent.create({
      data: {
        applicationId,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.SYSTEM,
        eventType: ONBOARDING_ACTIVITY.SLACK_INVITE_SENT,
        note: "Slack workspace invite sent successfully.",
        payloadJson: {
          inviteId: invite.inviteId,
          provider: slack.providerName,
        },
      },
    });
  });

  return { ok: true, phase: "invited", inviteId: invite.inviteId };
}
