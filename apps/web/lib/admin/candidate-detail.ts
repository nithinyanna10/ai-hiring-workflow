import { ActorType, ApplicationStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { db } from "../db";
import { env } from "../env";
import { extractParseMeta } from "../resume/enrich-parsed-resume";
import type { AdminCandidateDetail } from "../../types";

const adminOverrideSchema = z.object({
  applicationId: z.string().trim().min(1),
  targetStatus: z.enum([ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED]),
  note: z
    .string()
    .trim()
    .min(10, "Add a note with at least 10 characters for an override."),
});

export type AdminOverrideInput = z.infer<typeof adminOverrideSchema>;

export type AdminOverrideState = {
  errorMessage?: string;
  successMessage?: string;
};

function jsonArrayToStrings(value: Prisma.JsonValue | null) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseResearchSourceLinks(
  json: Prisma.JsonValue | null | undefined,
): AdminCandidateDetail["researchSourceLinks"] {
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return null;
  }

  const o = json as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : null);

  return {
    linkedinUrl: str("linkedinUrl"),
    githubUrl: str("githubUrl"),
    portfolioUrl: str("portfolioUrl"),
  };
}

export async function getAdminCandidateDetail(
  applicationId: string,
): Promise<AdminCandidateDetail | null> {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      currentStatus: true,
      submittedAt: true,
      reviewedAt: true,
      resumeFileUrl: true,
      researchSummary: true,
      parsedResumeJson: true,
      aiScreenScore: true,
      aiScreenSummary: true,
      aiStrengthsJson: true,
      aiGapsJson: true,
      candidate: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          linkedinUrl: true,
          portfolioUrl: true,
          phone: true,
        },
      },
      job: {
        select: {
          title: true,
          slug: true,
          team: true,
          location: true,
          workModel: true,
          level: true,
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          actorType: true,
          note: true,
          createdAt: true,
        },
      },
      activityEvents: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          eventType: true,
          actorType: true,
          note: true,
          payloadJson: true,
          createdAt: true,
        },
      },
      interviewSlots: {
        orderBy: { startTime: "asc" },
        take: 16,
        select: {
          startTime: true,
          endTime: true,
          slotStatus: true,
          holdExpiresAt: true,
        },
      },
      offer: {
        select: {
          offerText: true,
          updatedAt: true,
          signatureStatus: true,
        },
      },
      researchProfile: {
        select: {
          sourceLinksJson: true,
        },
      },
      interviews: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          transcriptText: true,
          feedbackSummary: true,
          notetakerProvider: true,
          completedAt: true,
          interviewSlot: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    return null;
  }

  const screenedEvent = application.activityEvents.find(
    (e) => e.eventType === "application.screened",
  );
  const screenedPayload = screenedEvent?.payloadJson as
    | {
        recommendation?: string;
        confidenceLevel?: string;
        threshold?: number;
        decisionPath?: string;
      }
    | null
    | undefined;

  const offerText = application.offer?.offerText;
  const offerPreview =
    application.offer && (offerText || application.offer.updatedAt)
      ? {
          excerpt: offerText
            ? offerText.length > 600
              ? `${offerText.slice(0, 600).trim()}…`
              : offerText
            : null,
          updatedAt: application.offer.updatedAt,
          signatureStatus: application.offer.signatureStatus,
        }
      : null;

  return {
    applicationId: application.id,
    currentStatus: application.currentStatus,
    submittedAt: application.submittedAt,
    reviewedAt: application.reviewedAt,
    resumeFileUrl: application.resumeFileUrl,
    researchSummary: application.researchSummary,
    parsedResumeJson: application.parsedResumeJson,
    aiScore: application.aiScreenScore ? Number(application.aiScreenScore) : null,
    aiSummary: application.aiScreenSummary,
    aiRecommendation: screenedPayload?.recommendation ?? null,
    aiConfidence: screenedPayload?.confidenceLevel ?? null,
    screeningThreshold: env.SCREENING_SCORE_THRESHOLD,
    screeningDecisionPath: screenedPayload?.decisionPath ?? null,
    strengths: jsonArrayToStrings(application.aiStrengthsJson),
    gaps: jsonArrayToStrings(application.aiGapsJson),
    schedulingSlots: application.interviewSlots.map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
      slotStatus: s.slotStatus,
      holdExpiresAt: s.holdExpiresAt,
    })),
    offerPreview,
    parseMeta: extractParseMeta(application.parsedResumeJson),
    researchSourceLinks: parseResearchSourceLinks(application.researchProfile?.sourceLinksJson),
    interviews: application.interviews.map((row) => ({
      id: row.id,
      transcriptText: row.transcriptText,
      feedbackSummary: row.feedbackSummary,
      notetakerProvider: row.notetakerProvider,
      completedAt: row.completedAt,
      slotStart: row.interviewSlot.startTime,
      slotEnd: row.interviewSlot.endTime,
    })),
    candidate: {
      fullName: `${application.candidate.firstName} ${application.candidate.lastName}`.trim(),
      email: application.candidate.email,
      linkedinUrl: application.candidate.linkedinUrl,
      portfolioUrl: application.candidate.portfolioUrl,
      phone: application.candidate.phone,
    },
    job: application.job,
    statusHistory: application.statusHistory,
    activityLog: application.activityEvents,
  };
}

export async function applyAdminStatusOverride(input: AdminOverrideInput) {
  const parsed = adminOverrideSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      errorMessage: parsed.error.flatten().formErrors[0] ?? "Invalid override request.",
    };
  }

  const application = await db.application.findUnique({
    where: { id: parsed.data.applicationId },
    select: {
      id: true,
      candidateId: true,
      jobId: true,
      currentStatus: true,
    },
  });

  if (!application) {
    return {
      ok: false as const,
      errorMessage: "Application not found.",
    };
  }

  if (application.currentStatus === parsed.data.targetStatus) {
    return {
      ok: true as const,
      successMessage: `Application already marked as ${parsed.data.targetStatus.toLowerCase()}.`,
    };
  }

  await db.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: application.id },
      data: {
        currentStatus: parsed.data.targetStatus,
        reviewedAt: new Date(),
      },
    });

    await tx.candidateStatusHistory.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        fromStatus: application.currentStatus,
        toStatus: parsed.data.targetStatus,
        actorType: ActorType.ADMIN,
        note: parsed.data.note,
      },
    });

    await tx.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.ADMIN,
        eventType: "application.status_override",
        note: `Admin changed application status to ${parsed.data.targetStatus.toLowerCase()}.`,
        payloadJson: {
          fromStatus: application.currentStatus,
          toStatus: parsed.data.targetStatus,
          note: parsed.data.note,
        },
      },
    });
  });

  return {
    ok: true as const,
    successMessage: `Application updated to ${parsed.data.targetStatus.toLowerCase()}.`,
  };
}
