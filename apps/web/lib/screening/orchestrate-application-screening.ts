import { ActorType, ApplicationStatus, Prisma } from "@prisma/client";
import {
  parseResumeWithAI,
  screenResumeWithAI,
  type ScreeningResult,
  type StructuredResume,
} from "@hiring-workflow/ai-engine";

import { db } from "../db";
import { orchestrateCandidateResearch } from "../research/orchestrate-candidate-research";
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
      application.currentStatus === ApplicationStatus.SHORTLISTED)
  );
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
  parsedResume: StructuredResume,
  screeningResult: ScreeningResult,
  threshold: number,
) {
  const screenedStatus = ApplicationStatus.SCREENED;
  const finalStatus =
    screeningResult.score >= threshold
      ? ApplicationStatus.SHORTLISTED
      : ApplicationStatus.SCREENED;

  await db.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: application.id },
      data: {
        parsedResumeJson: parsedResume,
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
        note: `Automated screening completed with score ${screeningResult.score}.`,
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
          note: `Application met the shortlist threshold of ${threshold}.`,
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
        note: `Automated screening completed for ${application.job.title}.`,
        payloadJson: {
          score: screeningResult.score,
          threshold,
          recommendation: screeningResult.recommendation,
          confidenceLevel: screeningResult.confidenceLevel,
          finalStatus,
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
          note: `Application was shortlisted by automated screening.`,
          payloadJson: {
            score: screeningResult.score,
            threshold,
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

    let screeningResult: ScreeningResult;
    try {
      screeningResult = await screenResumeWithAI(getResumeScreeningProvider(), {
        parsedResume,
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
      parsedResume,
      screeningResult,
      scoreThreshold,
    );

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
