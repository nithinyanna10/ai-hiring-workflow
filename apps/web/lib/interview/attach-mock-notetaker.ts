import { ActorType } from "@prisma/client";

import { db } from "../db";
import { buildMockInterviewNotes } from "./mock-notetaker";

export async function attachMockNotetakerToLatestInterview(applicationId: string) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      candidateId: true,
      jobId: true,
      candidate: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      job: { select: { title: true } },
    },
  });

  if (!application) {
    return { ok: false as const, error: "Application not found." };
  }

  const interview = await db.interview.findFirst({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      interviewSlot: { select: { startTime: true } },
    },
  });

  if (!interview) {
    return {
      ok: false as const,
      error: "No interview record yet. Confirm a slot on the candidate scheduling page first.",
    };
  }

  const candidateName =
    `${application.candidate.firstName} ${application.candidate.lastName}`.trim();
  const { transcriptText, feedbackSummary } = buildMockInterviewNotes({
    candidateName,
    roleTitle: application.job.title,
    interviewStart: interview.interviewSlot.startTime,
  });

  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.interview.update({
      where: { id: interview.id },
      data: {
        transcriptText,
        feedbackSummary,
        notetakerProvider: "mock_fireflies",
        completedAt: now,
      },
    });

    await tx.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.jobId,
        actorType: ActorType.SYSTEM,
        eventType: "interview.mock_notetaker_ingested",
        note: "Mock notetaker transcript and summary attached (demo path).",
        payloadJson: {
          interviewId: interview.id,
          provider: "mock_fireflies",
        },
      },
    });
  });

  return { ok: true as const };
}
