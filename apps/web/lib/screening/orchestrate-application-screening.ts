import { ActorType, ApplicationStatus, Prisma } from "@prisma/client";
import {
  parseResumeWithAI,
  screenResumeWithAI,
  type ScreeningResult,
  type StructuredResume,
} from "@hiring-workflow/ai-engine";

import { db } from "../db";
import { sendScreeningNotificationEmail } from "../email/send-screening-notification";
import { getEmailProvider } from "../email/provider";
import { orchestrateCandidateResearch } from "../research/orchestrate-candidate-research";
import {
  enrichParsedResumeFromRawText,
  mergeResumeJsonForStorage,
} from "../resume/enrich-parsed-resume";
import { extractResumeText } from "../resume-extraction";
import { env } from "../env";
import { getResumeParsingProvider, getResumeScreeningProvider } from "./providers";

export type OrchestrateApplicationScreeningInput = {
  applicationId: string;
  scoreThreshold?: number;
};

export type OrchestrateApplicationScreeningResult =
  | {
      ok: true;
      status: "already_processed" | "screened";
      applicationId: string;
      finalStatus: ApplicationStatus;
      score: number | null;
    }
  | {
      ok: false;
      status: "failed";
      applicationId: string;
      error: string;
    };

type ScreeningApplicationRecord = {
  id: string;
  candidateId: string;
  resumeFileUrl: string;
  parsedResumeJson: Prisma.JsonValue | null;
  aiScreenScore: Prisma.Decimal | null;
  aiScreenSummary: string | null;
  aiStrengthsJson: Prisma.JsonValue | null;
  aiGapsJson: Prisma.JsonValue | null;
  currentStatus: ApplicationStatus;
  candidate: {
    email: string;
    firstName: string;
    lastName: string;
  };
  job: {
    id: string;
    title: string;
    description: string;
    responsibilities: string[];
    requirements: string[];
  };
};

async function createFailureEvent(
  application: ScreeningApplicationRecord,
  stage: string,
  error: string,
) {
  await db.activityEvent.create({
    data: {
      applicationId: application.id,
      candidateId: application.candidateId,
      jobId: application.job.id,
      actorType: ActorType.AI_AGENT,
      eventType: "application.screening_failed",
      note: `Application screening failed during ${stage}.`,
      payloadJson: {
        stage,
        error,
      },
    },
  });
}

function getJobScreeningPrompt(job: ScreeningApplicationRecord["job"]) {
  return [
    `Title: ${job.title}`,
    "",
    "Description:",
    job.description,
    "",
    "Responsibilities:",
    ...job.responsibilities.map((item) => `- ${item}`),
    "",
    "Requirements:",
    ...job.requirements.map((item) => `- ${item}`),
  ].join("\n");
}

function isScreeningComplete(application: ScreeningApplicationRecord) {
  return (
    application.parsedResumeJson !== null &&
    application.aiScreenScore !== null &&
    application.aiScreenSummary !== null &&
    application.aiStrengthsJson !== null &&
    application.aiGapsJson !== null &&
    (application.currentStatus === ApplicationStatus.SCREENED ||
      application.currentStatus === ApplicationStatus.SHORTLISTED ||
      application.currentStatus === ApplicationStatus.UNDER_REVIEW)
  );
}

type ScreeningDecisionPath = "auto_shortlist" | "manual_review_queue" | "screened_only";

function resolveScreeningDecision(
  score: number,
  confidenceLevel: ScreeningResult["confidenceLevel"],
): { finalStatus: ApplicationStatus; decisionPath: ScreeningDecisionPath } {
  if (score >= 75 && confidenceLevel === "high") {
    return {
      finalStatus: ApplicationStatus.SHORTLISTED,
      decisionPath: "auto_shortlist",
    };
  }
  if (score >= 60 || confidenceLevel === "medium") {
    return {
      finalStatus: ApplicationStatus.UNDER_REVIEW,
      decisionPath: "manual_review_queue",
    };
  }
  return {
    finalStatus: ApplicationStatus.SCREENED,
    decisionPath: "screened_only",
  };
}

async function fetchApplication(applicationId: string) {
  return db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      candidateId: true,
      resumeFileUrl: true,
      parsedResumeJson: true,
      aiScreenScore: true,
      aiScreenSummary: true,
      aiStrengthsJson: true,
      aiGapsJson: true,
      currentStatus: true,
      candidate: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          description: true,
          responsibilities: true,
          requirements: true,
        },
      },
    },
  });
}

async function persistScreeningResult(
  application: ScreeningApplicationRecord,
  storedResumeJson: Prisma.InputJsonValue,
  screeningResult: ScreeningResult,
  thresholdForLog: number,
) {
  const screenedStatus = ApplicationStatus.SCREENED;
  const { finalStatus, decisionPath } = resolveScreeningDecision(
    screeningResult.score,
    screeningResult.confidenceLevel,
  );

  await db.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: application.id },
      data: {
        parsedResumeJson: storedResumeJson,
        aiScreenScore: screeningResult.score,
        aiScreenSummary: screeningResult.rationale,
        aiStrengthsJson: screeningResult.strengths,
        aiGapsJson: screeningResult.gaps,
        currentStatus: finalStatus,
        reviewedAt: new Date(),
      },
    });

    await tx.candidateStatusHistory.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        fromStatus: application.currentStatus,
        toStatus: screenedStatus,
        actorType: ActorType.AI_AGENT,
        note: `Automated screening completed with score ${screeningResult.score} (confidence: ${screeningResult.confidenceLevel}).`,
      },
    });

    if (finalStatus === ApplicationStatus.SHORTLISTED) {
      await tx.candidateStatusHistory.create({
        data: {
          applicationId: application.id,
          candidateId: application.candidateId,
          fromStatus: screenedStatus,
          toStatus: finalStatus,
          actorType: ActorType.AI_AGENT,
          note: "Auto-shortlisted: score ≥ 75 and model confidence high.",
        },
      });
    }

    if (finalStatus === ApplicationStatus.UNDER_REVIEW) {
      await tx.candidateStatusHistory.create({
        data: {
          applicationId: application.id,
          candidateId: application.candidateId,
          fromStatus: screenedStatus,
          toStatus: finalStatus,
          actorType: ActorType.AI_AGENT,
          note: "Queued for manual review: score ≥ 60 or medium confidence (per routing rules).",
        },
      });
    }

    await tx.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        jobId: application.job.id,
        actorType: ActorType.AI_AGENT,
        eventType: "application.screened",
        note: `AI screening completed — score ${screeningResult.score}, ${decisionPath.replace(/_/g, " ")}.`,
        payloadJson: {
          score: screeningResult.score,
          legacyThresholdSetting: thresholdForLog,
          recommendation: screeningResult.recommendation,
          confidenceLevel: screeningResult.confidenceLevel,
          finalStatus,
          decisionPath,
        },
      },
    });

    if (finalStatus === ApplicationStatus.SHORTLISTED) {
      await tx.activityEvent.create({
        data: {
          applicationId: application.id,
          candidateId: application.candidateId,
          jobId: application.job.id,
          actorType: ActorType.AI_AGENT,
          eventType: "application.shortlisted",
          note: "Application auto-shortlisted (high score + high confidence).",
          payloadJson: {
            score: screeningResult.score,
            decisionPath,
          },
        },
      });
    }

    if (finalStatus === ApplicationStatus.UNDER_REVIEW) {
      await tx.activityEvent.create({
        data: {
          applicationId: application.id,
          candidateId: application.candidateId,
          jobId: application.job.id,
          actorType: ActorType.AI_AGENT,
          eventType: "application.flagged_for_review",
          note: "Candidate routed to recruiter review queue based on score/confidence rules.",
          payloadJson: {
            score: screeningResult.score,
            confidenceLevel: screeningResult.confidenceLevel,
            decisionPath,
          },
        },
      });
    }
  });

  return finalStatus;
}

export async function orchestrateApplicationScreening({
  applicationId,
  scoreThreshold = env.SCREENING_SCORE_THRESHOLD,
}: OrchestrateApplicationScreeningInput): Promise<OrchestrateApplicationScreeningResult> {
  const application = await fetchApplication(applicationId);

  if (!application) {
    return {
      ok: false,
      status: "failed",
      applicationId,
      error: "Application not found.",
    };
  }

  if (isScreeningComplete(application)) {
    return {
      ok: true,
      status: "already_processed",
      applicationId: application.id,
      finalStatus: application.currentStatus,
      score: application.aiScreenScore ? Number(application.aiScreenScore) : null,
    };
  }

  try {
    const extractionResult = await extractResumeText({
      resumeFileUrl: application.resumeFileUrl,
    });

    if (!extractionResult.success) {
      const errorMessage = extractionResult.error ?? "Resume extraction failed.";
      await createFailureEvent(application, "resume_extraction", errorMessage);
      return {
        ok: false,
        status: "failed",
        applicationId: application.id,
        error: errorMessage,
      };
    }

    let parsedResume: StructuredResume;
    try {
      parsedResume = await parseResumeWithAI(getResumeParsingProvider(), {
        rawResumeText: extractionResult.extractedText,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Resume parsing failed.";
      await createFailureEvent(application, "resume_parsing", errorMessage);
      return {
        ok: false,
        status: "failed",
        applicationId: application.id,
        error: errorMessage,
      };
    }

    const { resume: enrichedResume, meta: parseMeta } = enrichParsedResumeFromRawText(
      parsedResume,
      extractionResult.extractedText,
    );
    const storedResumeJson = mergeResumeJsonForStorage(enrichedResume, parseMeta);

    let screeningResult: ScreeningResult;
    try {
      screeningResult = await screenResumeWithAI(getResumeScreeningProvider(), {
        parsedResume: enrichedResume,
        jobDescription: getJobScreeningPrompt(application.job),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Resume screening failed.";
      await createFailureEvent(application, "resume_screening", errorMessage);
      return {
        ok: false,
        status: "failed",
        applicationId: application.id,
        error: errorMessage,
      };
    }

    const finalStatus = await persistScreeningResult(
      application,
      storedResumeJson as Prisma.InputJsonValue,
      screeningResult,
      scoreThreshold,
    );

    try {
      const candidateName =
        `${application.candidate.firstName} ${application.candidate.lastName}`.trim();
      const emailResult = await sendScreeningNotificationEmail({
        candidateEmail: application.candidate.email,
        candidateName,
        roleTitle: application.job.title,
        score: screeningResult.score,
        threshold: scoreThreshold,
        shortlisted: finalStatus === ApplicationStatus.SHORTLISTED,
      });

      await db.activityEvent.create({
        data: {
          applicationId: application.id,
          candidateId: application.candidateId,
          jobId: application.job.id,
          actorType: ActorType.SYSTEM,
          eventType: "application.screening_notification_email_sent",
          note: `Screening summary email sent to ${application.candidate.email}.`,
          payloadJson: {
            provider: emailResult.provider,
            messageId: emailResult.messageId ?? null,
          },
        },
      });
    } catch (error) {
      const failureMessage =
        error instanceof Error ? error.message : "Unknown screening email failure.";
      await db.activityEvent.create({
        data: {
          applicationId: application.id,
          candidateId: application.candidateId,
          jobId: application.job.id,
          actorType: ActorType.SYSTEM,
          eventType: "application.screening_notification_email_failed",
          note: `Screening summary email failed for ${application.candidate.email}.`,
          payloadJson: {
            provider: getEmailProvider().name,
            error: failureMessage,
          },
        },
      });
    }

    if (finalStatus === ApplicationStatus.SHORTLISTED) {
      await orchestrateCandidateResearch({
        applicationId: application.id,
      }).catch(() => undefined);
    }

    return {
      ok: true,
      status: "screened",
      applicationId: application.id,
      finalStatus,
      score: screeningResult.score,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected screening error.";
    await createFailureEvent(application, "screening_pipeline", errorMessage);

    return {
      ok: false,
      status: "failed",
      applicationId: application.id,
      error: errorMessage,
    };
  }
}
