import { ActorType, ApplicationStatus, SignatureStatus } from "@prisma/client";

import { db } from "../../db";
import { sendAdminOfferSignedAlertIfConfigured } from "../../email/send-admin-offer-signed-alert";
import { ONBOARDING_ACTIVITY } from "../../onboarding/constants";
import { orchestrateSlackWorkspaceInviteAfterOfferSigned } from "../../onboarding/orchestrate-slack-invite";
import type { OfferSignatureProvider } from "./provider";
import { MockOfferSignatureProvider } from "./providers/mock-offer-signature-provider";
import type { OfferReviewDetail } from "./types";

function getOfferSignatureProvider(): OfferSignatureProvider {
  return new MockOfferSignatureProvider();
}

export async function getOfferReviewDetail(
  signatureToken: string,
): Promise<OfferReviewDetail | null> {
  const offer = await db.offer.findUnique({
    where: { signatureToken },
    select: {
      applicationId: true,
      title: true,
      startDate: true,
      baseSalary: true,
      equity: true,
      bonus: true,
      managerName: true,
      customTerms: true,
      offerText: true,
      signatureStatus: true,
      signatureProvider: true,
      signedAt: true,
      application: {
        select: {
          candidate: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!offer) {
    return null;
  }

  return {
    applicationId: offer.applicationId,
    candidateName: `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`.trim(),
    roleTitle: offer.title,
    startDate: offer.startDate,
    baseSalary: offer.baseSalary?.toString() ?? null,
    equity: offer.equity?.toString() ?? null,
    bonus: offer.bonus?.toString() ?? null,
    managerName: offer.managerName,
    customTerms: offer.customTerms,
    offerText: offer.offerText,
    signatureStatus: offer.signatureStatus,
    signatureProvider: offer.signatureProvider,
    signedAt: offer.signedAt,
  };
}

export async function createMockSigningSession(signatureToken: string) {
  const offer = await db.offer.findUnique({
    where: { signatureToken },
    select: {
      id: true,
      applicationId: true,
      signatureToken: true,
      signatureStatus: true,
      application: {
        select: {
          candidateId: true,
          candidate: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      title: true,
    },
  });

  if (!offer || !offer.signatureToken) {
    return {
      ok: false as const,
      errorMessage: "Offer signing link is not available.",
    };
  }

  if (offer.signatureStatus === SignatureStatus.SIGNED) {
    return {
      ok: true as const,
      signingUrl: `/offer/${offer.signatureToken}/signed`,
    };
  }

  const provider = getOfferSignatureProvider();
  const session = await provider.createSigningSession({
    signatureToken: offer.signatureToken,
    offerId: offer.id,
    applicationId: offer.applicationId,
    candidateName:
      `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`.trim(),
    roleTitle: offer.title,
  });

  await db.$transaction(async (tx) => {
    await tx.offer.update({
      where: { id: offer.id },
      data: {
        signatureProvider: session.providerName,
        signatureStatus:
          offer.signatureStatus === SignatureStatus.DRAFT
            ? SignatureStatus.PENDING
            : offer.signatureStatus,
      },
    });

    await tx.activityEvent.create({
      data: {
        applicationId: offer.applicationId,
        candidateId: offer.application.candidateId,
        actorType: ActorType.CANDIDATE,
        eventType: "offer.signing_session_created",
        note: "Candidate initiated the offer signing flow.",
        payloadJson: {
          provider: session.providerName,
          signatureStatus:
            offer.signatureStatus === SignatureStatus.DRAFT
              ? SignatureStatus.PENDING
              : offer.signatureStatus,
        },
      },
    });
  });

  return {
    ok: true as const,
    signingUrl: session.signingUrl,
  };
}

export async function completeOfferSignature(
  signatureToken: string,
  signerIp: string | null,
) {
  const offer = await db.offer.findUnique({
    where: { signatureToken },
    select: {
      id: true,
      applicationId: true,
      signatureStatus: true,
      title: true,
      application: {
        select: {
          candidateId: true,
          currentStatus: true,
          jobId: true,
          candidate: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          job: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!offer) {
    return {
      ok: false as const,
      errorMessage: "Offer signing link is invalid.",
    };
  }

  if (offer.signatureStatus === SignatureStatus.SIGNED) {
    return {
      ok: true as const,
    };
  }

  const provider = getOfferSignatureProvider();
  const completion = await provider.completeSigning({
    signatureToken,
    signerIp,
  });
  const nextStatus = ApplicationStatus.OFFER_SIGNED;
  const shouldWriteStatusHistory = offer.application.currentStatus !== nextStatus;

  await db.$transaction(async (tx) => {
    await tx.offer.update({
      where: { id: offer.id },
      data: {
        signatureProvider: completion.providerName,
        signatureStatus: completion.signatureStatus,
        signedAt: completion.completedAt,
        signerIp,
      },
    });

    await tx.application.update({
      where: { id: offer.applicationId },
      data: {
        currentStatus: nextStatus,
      },
    });

    if (shouldWriteStatusHistory) {
      await tx.candidateStatusHistory.create({
        data: {
          applicationId: offer.applicationId,
          candidateId: offer.application.candidateId,
          fromStatus: offer.application.currentStatus,
          toStatus: nextStatus,
          actorType: ActorType.CANDIDATE,
          note: "Candidate signed the offer.",
        },
      });
    }

    await tx.activityEvent.create({
      data: {
        applicationId: offer.applicationId,
        candidateId: offer.application.candidateId,
        jobId: offer.application.jobId,
        actorType: ActorType.CANDIDATE,
        eventType: "offer.signed",
        note: "Candidate completed the offer signature flow.",
        payloadJson: {
          signatureStatus: completion.signatureStatus,
          signerIp,
          signedAt: completion.completedAt?.toISOString() ?? null,
          provider: completion.providerName,
        },
      },
    });
  });

  try {
    await sendAdminOfferSignedAlertIfConfigured({
      applicationId: offer.applicationId,
      candidateName:
        `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`.trim(),
      roleTitle: offer.title ?? offer.application.job.title,
    });
  } catch {
    /* alert is best-effort */
  }

  try {
    await orchestrateSlackWorkspaceInviteAfterOfferSigned(offer.applicationId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    await db.activityEvent.create({
      data: {
        applicationId: offer.applicationId,
        candidateId: offer.application.candidateId,
        jobId: offer.application.jobId,
        actorType: ActorType.SYSTEM,
        eventType: ONBOARDING_ACTIVITY.SLACK_INVITE_HOOK_EXCEPTION,
        note: "Unexpected error while starting Slack onboarding invite after offer signature.",
        payloadJson: { message },
      },
    });
  }

  return {
    ok: true as const,
  };
}
