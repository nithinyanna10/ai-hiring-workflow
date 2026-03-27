import { ActorType, ApplicationStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { db } from "../db";
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
    },
  });

  if (!application) {
    return null;
  }

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
    strengths: jsonArrayToStrings(application.aiStrengthsJson),
    gaps: jsonArrayToStrings(application.aiGapsJson),
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
