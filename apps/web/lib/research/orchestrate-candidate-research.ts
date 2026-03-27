import { ActorType, ApplicationStatus } from "@prisma/client";
import {
  buildCandidateResearchWithAI,
  type CandidateResearchResult,
  type StructuredResume,
} from "@hiring-workflow/ai-engine";

import { db } from "../db";
import { getResumeScreeningProvider } from "../screening/providers";

export type OrchestrateCandidateResearchInput = {
  applicationId: string;
};

export type OrchestrateCandidateResearchResult =
  | {
      ok: true;
      status: "enriched" | "already_enriched";
      applicationId: string;
    }
  | {
      ok: false;
      status: "failed";
      applicationId: string;
      error: string;
    };

type ResearchApplicationRecord = {
  id: string;
  candidateId: string;
  currentStatus: ApplicationStatus;
  parsedResumeJson: unknown;
  candidate: {
    linkedinUrl: string | null;
    portfolioUrl: string | null;
  };
  researchProfile: {
    id: string;
  } | null;
};

function extractGithubUrl(portfolioUrl: string | null) {
  if (!portfolioUrl) {
    return null;
  }

  return portfolioUrl.includes("github.com/") ? portfolioUrl : null;
}

function extractStructuredResume(parsedResumeJson: unknown): StructuredResume | null {
  if (!parsedResumeJson || typeof parsedResumeJson !== "object" || Array.isArray(parsedResumeJson)) {
    return null;
  }

  return parsedResumeJson as StructuredResume;
}

async function logResearchFailure(
  application: ResearchApplicationRecord,
  error: string,
) {
  await db.activityEvent.create({
    data: {
      applicationId: application.id,
      candidateId: application.candidateId,
      actorType: ActorType.AI_AGENT,
      eventType: "application.research_failed",
      note: "Candidate research enrichment failed.",
      payloadJson: {
        error,
      },
    },
  });
}

async function persistResearch(
  application: ResearchApplicationRecord,
  research: CandidateResearchResult,
) {
  const githubUrl = extractGithubUrl(application.candidate.portfolioUrl);

  await db.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: application.id },
      data: {
        researchSummary: research.shortCandidateBrief,
        discrepancyFlagsJson: research.discrepancyFlags,
      },
    });

    await tx.applicationResearch.upsert({
      where: { applicationId: application.id },
      update: {
        shortCandidateBrief: research.shortCandidateBrief,
        likelyStrengthsJson: research.likelyStrengths,
        notableProjectsJson: research.notablePublicProjects,
        discrepancyFlagsJson: research.discrepancyFlags,
        interviewerPrepNotes: research.interviewerPrepNotes.join("\n"),
        sourceLinksJson: {
          linkedinUrl: application.candidate.linkedinUrl,
          githubUrl,
          portfolioUrl: application.candidate.portfolioUrl,
        },
      },
      create: {
        applicationId: application.id,
        shortCandidateBrief: research.shortCandidateBrief,
        likelyStrengthsJson: research.likelyStrengths,
        notableProjectsJson: research.notablePublicProjects,
        discrepancyFlagsJson: research.discrepancyFlags,
        interviewerPrepNotes: research.interviewerPrepNotes.join("\n"),
        sourceLinksJson: {
          linkedinUrl: application.candidate.linkedinUrl,
          githubUrl,
          portfolioUrl: application.candidate.portfolioUrl,
        },
      },
    });

    await tx.activityEvent.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        actorType: ActorType.AI_AGENT,
        eventType: "application.research_enriched",
        note: "Candidate research enrichment completed.",
        payloadJson: {
          strengthsCount: research.likelyStrengths.length,
          projectsCount: research.notablePublicProjects.length,
          discrepancyFlagsCount: research.discrepancyFlags.length,
        },
      },
    });
  });
}

async function fetchApplication(applicationId: string) {
  return db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      candidateId: true,
      currentStatus: true,
      parsedResumeJson: true,
      candidate: {
        select: {
          linkedinUrl: true,
          portfolioUrl: true,
        },
      },
      researchProfile: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function orchestrateCandidateResearch({
  applicationId,
}: OrchestrateCandidateResearchInput): Promise<OrchestrateCandidateResearchResult> {
  const application = await fetchApplication(applicationId);

  if (!application) {
    return {
      ok: false,
      status: "failed",
      applicationId,
      error: "Application not found.",
    };
  }

  if (application.currentStatus !== ApplicationStatus.SHORTLISTED) {
    return {
      ok: false,
      status: "failed",
      applicationId,
      error: "Candidate research enrichment runs only for shortlisted applications.",
    };
  }

  if (application.researchProfile) {
    return {
      ok: true,
      status: "already_enriched",
      applicationId,
    };
  }

  const parsedResume = extractStructuredResume(application.parsedResumeJson);
  if (!parsedResume) {
    const error = "Parsed resume data is required before research enrichment can run.";
    await logResearchFailure(application, error);

    return {
      ok: false,
      status: "failed",
      applicationId,
      error,
    };
  }

  try {
    const research = await buildCandidateResearchWithAI(getResumeScreeningProvider(), {
      parsedResume,
      linkedinUrl: application.candidate.linkedinUrl,
      githubUrl: extractGithubUrl(application.candidate.portfolioUrl),
      portfolioUrl: application.candidate.portfolioUrl,
    });

    await persistResearch(application, research);

    return {
      ok: true,
      status: "enriched",
      applicationId,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected research enrichment error.";
    await logResearchFailure(application, message);

    return {
      ok: false,
      status: "failed",
      applicationId,
      error: message,
    };
  }
}
